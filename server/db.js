const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { sampleDatasets, sampleKPIs, defaultDashboards } = require("./sampleData");

// Load .env variables
require("dotenv").config();

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let pgPool = null;
let usePostgres = false;

// Check if PostgreSQL configuration is provided
if (process.env.DATABASE_URL || (process.env.PGHOST && process.env.PGUSER)) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Fallback to separate config fields if URL is not present
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      port: process.env.PGPORT || 5432,
      ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost") 
        ? { rejectUnauthorized: false } 
        : false
    });
    usePostgres = true;
    console.log("Database Mode: PostgreSQL Client Initialized.");
  } catch (err) {
    console.error("Failed to initialize PostgreSQL pool, falling back to local JSON database. Error:", err.message);
    usePostgres = false;
  }
} else {
  console.log("Database Mode: Local JSON File fallback database active. Set DATABASE_URL env variable to use PostgreSQL.");
}

// JSON Database helper paths
const filePaths = {
  datasets: path.join(DATA_DIR, "datasets.json"),
  kpis: path.join(DATA_DIR, "kpis.json"),
  dashboards: path.join(DATA_DIR, "dashboards.json")
};

// Seed Local JSON DB if files don't exist
function seedLocalJSON() {
  if (!fs.existsSync(filePaths.datasets)) {
    fs.writeFileSync(filePaths.datasets, JSON.stringify(sampleDatasets, null, 2), "utf8");
    console.log("Seeded default datasets in JSON database.");
  }
  if (!fs.existsSync(filePaths.kpis)) {
    fs.writeFileSync(filePaths.kpis, JSON.stringify(sampleKPIs, null, 2), "utf8");
    console.log("Seeded default KPIs in JSON database.");
  }
  if (!fs.existsSync(filePaths.dashboards)) {
    fs.writeFileSync(filePaths.dashboards, JSON.stringify(defaultDashboards, null, 2), "utf8");
    console.log("Seeded default Dashboards in JSON database.");
  }
}

// Initialize tables if using PostgreSQL
async function initializePostgres() {
  if (!usePostgres) return;
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");
    
    // Create datasets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS datasets (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        columns JSONB NOT NULL,
        data JSONB NOT NULL
      )
    `);

    // Create kpis table
    await client.query(`
      CREATE TABLE IF NOT EXISTS kpis (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        value NUMERIC,
        unit VARCHAR(50),
        target NUMERIC,
        warn_threshold NUMERIC,
        crit_threshold NUMERIC,
        trend NUMERIC,
        historical_data JSONB
      )
    `);

    // Create dashboards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS dashboards (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        widgets JSONB NOT NULL
      )
    `);

    await client.query("COMMIT");
    console.log("PostgreSQL Database tables verified/created.");

    // Seed PostgreSQL if empty
    const dsRes = await client.query("SELECT COUNT(*) FROM datasets");
    if (parseInt(dsRes.rows[0].count) === 0) {
      console.log("Seeding PostgreSQL with sample datasets...");
      for (const ds of sampleDatasets) {
        await client.query(
          "INSERT INTO datasets (id, name, columns, data) VALUES ($1, $2, $3, $4)",
          [ds.id, ds.name, JSON.stringify(ds.columns), JSON.stringify(ds.data)]
        );
      }
    }

    const kpiRes = await client.query("SELECT COUNT(*) FROM kpis");
    if (parseInt(kpiRes.rows[0].count) === 0) {
      console.log("Seeding PostgreSQL with sample KPIs...");
      for (const kpi of sampleKPIs) {
        await client.query(
          "INSERT INTO kpis (id, name, value, unit, target, warn_threshold, crit_threshold, trend, historical_data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
          [kpi.id, kpi.name, kpi.value, kpi.unit, kpi.target, kpi.warnThreshold, kpi.critThreshold, kpi.trend, JSON.stringify(kpi.historicalData)]
        );
      }
    }

    const dbRes = await client.query("SELECT COUNT(*) FROM dashboards");
    if (parseInt(dbRes.rows[0].count) === 0) {
      console.log("Seeding PostgreSQL with default dashboards...");
      for (const dash of defaultDashboards) {
        await client.query(
          "INSERT INTO dashboards (id, name, widgets) VALUES ($1, $2, $3)",
          [dash.id, dash.name, JSON.stringify(dash.widgets)]
        );
      }
    }
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error seeding or creating PostgreSQL schema, reverting to Local JSON database mode. Error:", err.message);
    usePostgres = false;
    seedLocalJSON();
  } finally {
    client.release();
  }
}

// Read JSON database helpers
function readJSON(type) {
  const filePath = filePaths[type];
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${type} from JSON db, returning empty array.`, err.message);
    return [];
  }
}

// Write JSON database helpers
function writeJSON(type, data) {
  const filePath = filePaths[type];
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error(`Error writing ${type} to JSON db.`, err.message);
    return false;
  }
}

// Exported Database Service
const db = {
  async init() {
    if (usePostgres) {
      await initializePostgres();
    } else {
      seedLocalJSON();
    }
  },

  // DATASETS API
  async getDatasets() {
    if (usePostgres) {
      const res = await pgPool.query("SELECT id, name, columns, data FROM datasets");
      return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        columns: typeof row.columns === "string" ? JSON.parse(row.columns) : row.columns,
        data: typeof row.data === "string" ? JSON.parse(row.data) : row.data
      }));
    } else {
      return readJSON("datasets");
    }
  },

  async saveDataset(dataset) {
    if (usePostgres) {
      await pgPool.query(
        "INSERT INTO datasets (id, name, columns, data) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name = $2, columns = $3, data = $4",
        [dataset.id, dataset.name, JSON.stringify(dataset.columns), JSON.stringify(dataset.data)]
      );
    } else {
      const datasets = readJSON("datasets");
      const idx = datasets.findIndex(d => d.id === dataset.id);
      if (idx >= 0) {
        datasets[idx] = dataset;
      } else {
        datasets.push(dataset);
      }
      writeJSON("datasets", datasets);
    }
    return dataset;
  },

  async deleteDataset(id) {
    if (usePostgres) {
      await pgPool.query("DELETE FROM datasets WHERE id = $1", [id]);
    } else {
      const datasets = readJSON("datasets");
      const filtered = datasets.filter(d => d.id !== id);
      writeJSON("datasets", filtered);
    }
    return true;
  },

  // KPIS API
  async getKPIs() {
    if (usePostgres) {
      const res = await pgPool.query("SELECT id, name, value, unit, target, warn_threshold, crit_threshold, trend, historical_data FROM kpis");
      return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        value: parseFloat(row.value),
        unit: row.unit,
        target: parseFloat(row.target),
        warnThreshold: parseFloat(row.warn_threshold),
        critThreshold: parseFloat(row.crit_threshold),
        trend: parseFloat(row.trend),
        historicalData: typeof row.historical_data === "string" ? JSON.parse(row.historical_data) : row.historical_data
      }));
    } else {
      return readJSON("kpis");
    }
  },

  async saveKPI(kpi) {
    if (usePostgres) {
      await pgPool.query(
        `INSERT INTO kpis (id, name, value, unit, target, warn_threshold, crit_threshold, trend, historical_data) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO UPDATE 
         SET name = $2, value = $3, unit = $4, target = $5, warn_threshold = $6, crit_threshold = $7, trend = $8, historical_data = $9`,
        [
          kpi.id,
          kpi.name,
          kpi.value,
          kpi.unit,
          kpi.target,
          kpi.warnThreshold,
          kpi.critThreshold,
          kpi.trend,
          JSON.stringify(kpi.historicalData || [])
        ]
      );
    } else {
      const kpis = readJSON("kpis");
      const idx = kpis.findIndex(k => k.id === kpi.id);
      if (idx >= 0) {
        kpis[idx] = kpi;
      } else {
        kpis.push(kpi);
      }
      writeJSON("kpis", kpis);
    }
    return kpi;
  },

  // DASHBOARDS API
  async getDashboards() {
    if (usePostgres) {
      const res = await pgPool.query("SELECT id, name, widgets FROM dashboards");
      return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        widgets: typeof row.widgets === "string" ? JSON.parse(row.widgets) : row.widgets
      }));
    } else {
      return readJSON("dashboards");
    }
  },

  async saveDashboard(dashboard) {
    if (usePostgres) {
      await pgPool.query(
        "INSERT INTO dashboards (id, name, widgets) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET name = $2, widgets = $3",
        [dashboard.id, dashboard.name, JSON.stringify(dashboard.widgets)]
      );
    } else {
      const dashboards = readJSON("dashboards");
      const idx = dashboards.findIndex(d => d.id === dashboard.id);
      if (idx >= 0) {
        dashboards[idx] = dashboard;
      } else {
        dashboards.push(dashboard);
      }
      writeJSON("dashboards", dashboards);
    }
    return dashboard;
  },

  async deleteDashboard(id) {
    if (usePostgres) {
      await pgPool.query("DELETE FROM dashboards WHERE id = $1", [id]);
    } else {
      const dashboards = readJSON("dashboards");
      const filtered = dashboards.filter(d => d.id !== id);
      writeJSON("dashboards", filtered);
    }
    return true;
  }
};

module.exports = db;

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const csv = require("csv-parser");
const { Readable } = require("stream");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Multer in-memory upload setup
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Root check
app.get("/", (req, res) => {
  res.send("Data Analytics & Business Intelligence Dashboard API Running.");
});

// Helper: Try to parse numbers from strings in datasets
function parseRowData(row) {
  const parsed = {};
  for (const key in row) {
    const val = row[key].trim();
    if (val === "") {
      parsed[key] = null;
    } else if (!isNaN(val) && val !== "") {
      parsed[key] = Number(val);
    } else if (val.toLowerCase() === "true") {
      parsed[key] = true;
    } else if (val.toLowerCase() === "false") {
      parsed[key] = false;
    } else {
      parsed[key] = val;
    }
  }
  return parsed;
}

// -------------------------------------------------------------
// DATASETS API
// -------------------------------------------------------------

// Fetch all datasets
app.get("/api/datasets", async (req, res) => {
  try {
    const datasets = await db.getDatasets();
    res.json(datasets);
  } catch (err) {
    console.error("GET /api/datasets failed:", err);
    res.status(500).json({ error: "Failed to retrieve datasets" });
  }
});

// Create/Update a dataset
app.post("/api/datasets", async (req, res) => {
  try {
    const { id, name, columns, data } = req.body;
    if (!id || !name || !columns || !data) {
      return res.status(400).json({ error: "Missing required dataset fields (id, name, columns, data)" });
    }
    const saved = await db.saveDataset({ id, name, columns, data });
    res.status(201).json(saved);
  } catch (err) {
    console.error("POST /api/datasets failed:", err);
    res.status(500).json({ error: "Failed to save dataset" });
  }
});

// Delete a dataset
app.delete("/api/datasets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteDataset(id);
    res.json({ success: true, message: `Dataset ${id} deleted` });
  } catch (err) {
    console.error(`DELETE /api/datasets/${req.params.id} failed:`, err);
    res.status(500).json({ error: "Failed to delete dataset" });
  }
});

// File parser endpoint (CSV/JSON upload)
app.post("/api/import", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file was uploaded." });
  }

  const filename = req.file.originalname;
  const fileBuffer = req.file.buffer;

  if (filename.endsWith(".json")) {
    try {
      const parsedData = JSON.parse(fileBuffer.toString("utf8"));
      // Expecting array of objects
      const rows = Array.isArray(parsedData) ? parsedData : [parsedData];
      if (rows.length === 0) {
        return res.status(400).json({ error: "JSON file is empty or invalid structure." });
      }
      
      const columns = Object.keys(rows[0]);
      const data = rows.map(parseRowData);
      
      res.json({
        name: filename.replace(/\.[^/.]+$/, ""),
        columns,
        data
      });
    } catch (err) {
      res.status(400).json({ error: "Invalid JSON syntax: " + err.message });
    }
  } else if (filename.endsWith(".csv")) {
    const results = [];
    const stream = Readable.from(fileBuffer);
    
    stream.pipe(csv())
      .on("data", (row) => {
        results.push(parseRowData(row));
      })
      .on("end", () => {
        if (results.length === 0) {
          return res.status(400).json({ error: "CSV file is empty or headers are invalid." });
        }
        const columns = Object.keys(results[0]);
        res.json({
          name: filename.replace(/\.[^/.]+$/, ""),
          columns,
          data: results
        });
      })
      .on("error", (err) => {
        res.status(500).json({ error: "Failed to parse CSV file: " + err.message });
      });
  } else {
    res.status(400).json({ error: "Unsupported file format. Please upload a .csv or .json file." });
  }
});

// -------------------------------------------------------------
// KPIS API
// -------------------------------------------------------------

// Fetch all KPIs
app.get("/api/kpis", async (req, res) => {
  try {
    const kpis = await db.getKPIs();
    res.json(kpis);
  } catch (err) {
    console.error("GET /api/kpis failed:", err);
    res.status(500).json({ error: "Failed to retrieve KPIs" });
  }
});

// Update/Save a KPI
app.post("/api/kpis", async (req, res) => {
  try {
    const kpi = req.body;
    if (!kpi.id || !kpi.name) {
      return res.status(400).json({ error: "Missing required KPI fields (id, name)" });
    }
    const saved = await db.saveKPI(kpi);
    res.json(saved);
  } catch (err) {
    console.error("POST /api/kpis failed:", err);
    res.status(500).json({ error: "Failed to save KPI" });
  }
});

// -------------------------------------------------------------
// DASHBOARDS API
// -------------------------------------------------------------

// Fetch all dashboards
app.get("/api/dashboards", async (req, res) => {
  try {
    const dashboards = await db.getDashboards();
    res.json(dashboards);
  } catch (err) {
    console.error("GET /api/dashboards failed:", err);
    res.status(500).json({ error: "Failed to retrieve dashboards" });
  }
});

// Save/Update dashboard
app.post("/api/dashboards", async (req, res) => {
  try {
    const dashboard = req.body;
    if (!dashboard.id || !dashboard.name || !dashboard.widgets) {
      return res.status(400).json({ error: "Missing required dashboard fields (id, name, widgets)" });
    }
    const saved = await db.saveDashboard(dashboard);
    res.json(saved);
  } catch (err) {
    console.error("POST /api/dashboards failed:", err);
    res.status(500).json({ error: "Failed to save dashboard" });
  }
});

// Delete dashboard
app.delete("/api/dashboards/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteDashboard(id);
    res.json({ success: true, message: `Dashboard ${id} deleted` });
  } catch (err) {
    console.error(`DELETE /api/dashboards/${req.params.id} failed:`, err);
    res.status(500).json({ error: "Failed to delete dashboard" });
  }
});

// -------------------------------------------------------------
// START SERVER
// -------------------------------------------------------------
async function start() {
  await db.init();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

start();

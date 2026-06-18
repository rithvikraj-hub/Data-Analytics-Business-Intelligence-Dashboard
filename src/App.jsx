import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Settings, 
  Database, 
  FileText, 
  Plus, 
  Save, 
  Download, 
  Sparkles, 
  TrendingUp, 
  Loader2, 
  AlertTriangle,
  FolderOpen,
  ArrowRight
} from "lucide-react";
import WidgetGrid from "./components/WidgetGrid";
import WidgetForm from "./components/WidgetForm";
import KPIThresholds from "./components/KPIThresholds";
import DataPreview from "./components/DataPreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function App() {
  // Navigation / Views
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Data State
  const [datasets, setDatasets] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [activeDashboardId, setActiveDashboardId] = useState("");
  
  // Loading & Action State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isWidgetFormOpen, setIsWidgetFormOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);

  // Fetch initial configuration
  useEffect(() => {
    async function fetchData() {
      try {
        const [dsRes, kpiRes, dashRes] = await Promise.all([
          fetch("/api/datasets").then(r => r.json()),
          fetch("/api/kpis").then(r => r.json()),
          fetch("/api/dashboards").then(r => r.json())
        ]);
        
        setDatasets(dsRes);
        setKpis(kpiRes);
        setDashboards(dashRes);
        
        if (dashRes.length > 0) {
          setActiveDashboardId(dashRes[0].id);
        }
      } catch (err) {
        console.error("Error loading application data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeDashboard = dashboards.find(d => d.id === activeDashboardId);
  const activeWidgets = activeDashboard ? activeDashboard.widgets : [];

  // -------------------------------------------------------------
  // DASHBOARD ACTIONS
  // -------------------------------------------------------------
  
  // Create a new empty dashboard
  const handleCreateDashboard = async () => {
    const name = prompt("Enter a name for your custom dashboard:");
    if (!name || !name.trim()) return;

    const newDash = {
      id: `dash_${Date.now()}`,
      name: name.trim(),
      widgets: []
    };

    try {
      const response = await fetch("/api/dashboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDash)
      });
      const saved = await response.json();
      setDashboards([...dashboards, saved]);
      setActiveDashboardId(saved.id);
    } catch (err) {
      alert("Failed to create dashboard: " + err.message);
    }
  };

  // Delete dashboard
  const handleDeleteDashboard = async () => {
    if (!activeDashboardId) return;
    if (activeDashboardId === "dash_executive_overview") {
      alert("System Overview dashboard cannot be deleted.");
      return;
    }

    if (!confirm(`Are you sure you want to delete the dashboard "${activeDashboard?.name}"?`)) return;

    try {
      await fetch(`/api/dashboards/${activeDashboardId}`, { method: "DELETE" });
      const filtered = dashboards.filter(d => d.id !== activeDashboardId);
      setDashboards(filtered);
      if (filtered.length > 0) {
        setActiveDashboardId(filtered[0].id);
      } else {
        setActiveDashboardId("");
      }
    } catch (err) {
      alert("Failed to delete dashboard: " + err.message);
    }
  };

  // Save Dashboard Layout
  const handleSaveLayout = async (customWidgets = activeWidgets) => {
    if (!activeDashboard) return;
    setSaving(true);
    
    const updatedDashboard = {
      ...activeDashboard,
      widgets: customWidgets
    };

    try {
      const response = await fetch("/api/dashboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDashboard)
      });
      const saved = await response.json();
      
      // Update local dashboards state
      const updatedList = dashboards.map(d => d.id === saved.id ? saved : d);
      setDashboards(updatedList);
    } catch (err) {
      alert("Failed to save dashboard layout: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------
  // WIDGET ACTIONS
  // -------------------------------------------------------------

  const handleOpenAddWidget = () => {
    setEditingWidget(null);
    setIsWidgetFormOpen(true);
  };

  const handleOpenEditWidget = (widget) => {
    setEditingWidget(widget);
    setIsWidgetFormOpen(true);
  };

  const handleSaveWidget = (widget) => {
    let updatedWidgets = [];
    if (editingWidget) {
      // Edit mode
      updatedWidgets = activeWidgets.map(w => w.id === widget.id ? widget : w);
    } else {
      // Add mode
      updatedWidgets = [...activeWidgets, widget];
    }
    
    // Save to server
    handleSaveLayout(updatedWidgets);
    setIsWidgetFormOpen(false);
  };

  const handleDeleteWidget = (widgetId) => {
    if (!confirm("Are you sure you want to remove this widget?")) return;
    const updatedWidgets = activeWidgets.filter(w => w.id !== widgetId);
    handleSaveLayout(updatedWidgets);
  };

  const handleReorderWidgets = (newWidgetsList) => {
    handleSaveLayout(newWidgetsList);
  };

  // -------------------------------------------------------------
  // KPI ACTIONS
  // -------------------------------------------------------------
  const handleSaveKPI = async (updatedKPI) => {
    try {
      const response = await fetch("/api/kpis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedKPI)
      });
      const saved = await response.json();
      
      const updatedList = kpis.map(k => k.id === saved.id ? saved : k);
      setKpis(updatedList);
    } catch (err) {
      alert("Failed to update KPI: " + err.message);
    }
  };

  // -------------------------------------------------------------
  // DATA ACTIONS
  // -------------------------------------------------------------
  const handleImportDataset = async (newDataset) => {
    try {
      const response = await fetch("/api/datasets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDataset)
      });
      const saved = await response.json();
      setDatasets([...datasets, saved]);
      alert(`Dataset "${saved.name}" successfully imported!`);
    } catch (err) {
      alert("Failed to import dataset: " + err.message);
    }
  };

  const handleDeleteDataset = async (datasetId) => {
    if (!confirm("Are you sure you want to delete this dataset? Widgets using this source will no longer load data.")) return;
    
    try {
      await fetch(`/api/datasets/${datasetId}`, { method: "DELETE" });
      setDatasets(datasets.filter(d => d.id !== datasetId));
    } catch (err) {
      alert("Failed to delete dataset: " + err.message);
    }
  };

  // -------------------------------------------------------------
  // EXPORTS & REPORTS GENERATION
  // -------------------------------------------------------------
  const [exportingPDF, setExportingPDF] = useState(false);
  
  const handleGeneratePDFReport = async () => {
    const reportElem = document.getElementById("bi-report-preview");
    if (!reportElem) return;

    setExportingPDF(true);
    try {
      // Temporarily hide PDF print margins/actions
      const canvas = await html2canvas(reportElem, {
        scale: 2,
        backgroundColor: "#060913",
        useCORS: true
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`Vanguard_Analytics_Report_${activeDashboard?.name || "BI"}.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert("Failed to export PDF: " + err.message);
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportCSVData = (dataset) => {
    if (!dataset || !dataset.data || dataset.data.length === 0) return;

    const headers = dataset.columns.join(",");
    const rows = dataset.data.map(row => 
      dataset.columns.map(col => `"${row[col] ?? ""}"`).join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${dataset.name.replace(/\s+/g, "_")}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine App KPI overall status warning count
  const warningKPIs = kpis.filter(k => {
    const val = k.value;
    const warn = k.warnThreshold;
    const crit = k.critThreshold;
    if (warn > crit) return val <= warn;
    return val >= warn;
  });

  return (
    <div className="app-container">
      <div className="app-bg-glow"></div>

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ backgroundColor: "var(--color-primary)", padding: 6, borderRadius: 8, display: "flex" }}>
            <Sparkles size={20} color="#ffffff" />
          </div>
          <h1>Vanguard BI</h1>
        </div>

        <ul className="sidebar-menu">
          <li 
            className={`sidebar-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={18} />
            <span>Dashboards</span>
          </li>
          <li 
            className={`sidebar-item ${activeTab === "kpis" ? "active" : ""}`}
            onClick={() => setActiveTab("kpis")}
          >
            <Settings size={18} />
            <span>KPI Alert configs</span>
            {warningKPIs.length > 0 && (
              <span style={{ marginLeft: "auto", background: "var(--color-warning)", color: "var(--text-dark)", padding: "2px 6px", borderRadius: "50%", fontSize: "0.7rem", fontWeight: "bold" }}>
                {warningKPIs.length}
              </span>
            )}
          </li>
          <li 
            className={`sidebar-item ${activeTab === "data" ? "active" : ""}`}
            onClick={() => setActiveTab("data")}
          >
            <Database size={18} />
            <span>Data Ingestion</span>
          </li>
          <li 
            className={`sidebar-item ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <FileText size={18} />
            <span>Report Center</span>
          </li>
        </ul>

        <div className="sidebar-footer">
          Vanguard Analytics v1.0.0
        </div>
      </aside>

      {/* App Main Shell */}
      <main className="main-wrapper">
        <header className="main-header">
          <div className="header-title">
            <h2>
              {activeTab === "dashboard" && "Analytics Workbench"}
              {activeTab === "kpis" && "Operational KPIs"}
              {activeTab === "data" && "Data Feeds"}
              {activeTab === "reports" && "Executive Reports"}
            </h2>
          </div>

          <div className="header-actions">
            {/* Sync / Saving Spinner */}
            {saving && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-primary)", fontSize: "0.85rem" }}>
                <Loader2 size={16} className="spinner" style={{ animation: "spin 1s linear infinite" }} />
                <span>Syncing layout...</span>
              </div>
            )}
          </div>
        </header>

        {loading ? (
          <div style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 12 }}>
            <Loader2 size={32} className="spinner" style={{ animation: "spin 1s linear infinite", color: "var(--color-primary)" }} />
            <span style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Initializing analytics services...</span>
          </div>
        ) : (
          <div className="content-body">
            
            {/* VIEW 1: CUSTOM DASHBOARD BUILDER */}
            {activeTab === "dashboard" && (
              <div>
                <div className="dashboard-actions-bar">
                  <div className="dashboard-select-wrapper">
                    <FolderOpen size={16} style={{ color: "var(--text-muted)" }} />
                    <select
                      className="form-select"
                      value={activeDashboardId}
                      onChange={(e) => setActiveDashboardId(e.target.value)}
                      style={{ width: "220px", background: "rgba(255,255,255,0.02)" }}
                    >
                      {dashboards.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    
                    <button className="btn btn-secondary" onClick={handleCreateDashboard} title="Create New Custom Dashboard">
                      <Plus size={14} /> New
                    </button>
                    {activeDashboardId !== "dash_executive_overview" && (
                      <button className="btn btn-danger" onClick={handleDeleteDashboard} style={{ padding: "10px 14px" }}>
                        Delete
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn btn-primary" onClick={handleOpenAddWidget}>
                      <Plus size={14} /> Add Widget
                    </button>
                  </div>
                </div>

                {/* Dashboard Widget Layout Grid */}
                <WidgetGrid
                  widgets={activeWidgets}
                  datasets={datasets}
                  onEditWidget={handleOpenEditWidget}
                  onDeleteWidget={handleDeleteWidget}
                  onReorderWidgets={handleReorderWidgets}
                />
              </div>
            )}

            {/* VIEW 2: KPI THRESHOLDS */}
            {activeTab === "kpis" && (
              <KPIThresholds
                kpis={kpis}
                onSaveKPI={handleSaveKPI}
              />
            )}

            {/* VIEW 3: DATA INGESTION & CATALOG */}
            {activeTab === "data" && (
              <DataPreview
                datasets={datasets}
                onImportDataset={handleImportDataset}
                onDeleteDataset={handleDeleteDataset}
              />
            )}

            {/* VIEW 4: REPORT CENTER */}
            {activeTab === "reports" && (
              <div className="reports-layout">
                
                {/* Left controls */}
                <div className="report-controls-panel">
                  <div className="glass-card">
                    <h4 style={{ fontFamily: "var(--font-title)", marginBottom: 12, fontSize: "1rem", color: "var(--text-bright)" }}>Report Settings</h4>
                    
                    <div className="form-group">
                      <label className="form-label">Active Dashboard</label>
                      <select 
                        className="form-select" 
                        value={activeDashboardId} 
                        onChange={(e) => setActiveDashboardId(e.target.value)}
                      >
                        {dashboards.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      className="btn btn-primary" 
                      onClick={handleGeneratePDFReport}
                      disabled={exportingPDF}
                      style={{ width: "100%", marginTop: 12 }}
                    >
                      {exportingPDF ? (
                        <>
                          <Loader2 size={14} className="spinner" style={{ animation: "spin 1s linear infinite" }} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download size={14} /> Export PDF Report
                        </>
                      )}
                    </button>
                  </div>

                  <div className="glass-card">
                    <h4 style={{ fontFamily: "var(--font-title)", marginBottom: 12, fontSize: "1rem", color: "var(--text-bright)" }}>Export CSV Data</h4>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: 12 }}>
                      Download raw records in standard spreadsheet CSV format.
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {datasets.map(d => (
                        <button 
                          key={d.id} 
                          className="btn btn-secondary" 
                          onClick={() => handleExportCSVData(d)}
                          style={{ justifyContent: "space-between", fontSize: "0.85rem", padding: "8px 12px" }}
                        >
                          <span>{d.name}</span>
                          <Download size={12} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Print/Export Preview sheet */}
                <div className="report-preview-window" id="bi-report-preview">
                  <div className="report-preview-header">
                    <div>
                      <h3 className="report-preview-logo">Vanguard Reports</h3>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Data Analytics & Business Intelligence Engine
                      </span>
                    </div>
                    <div className="report-meta-table">
                      <div>Generated: {new Date().toLocaleDateString()}</div>
                      <div>Source: {activeDashboard?.name || "Custom"} Workbench</div>
                      <div>Format: PDF A4 Capture</div>
                    </div>
                  </div>

                  <div className="report-preview-body">
                    {/* KPI Quick Snapshot */}
                    <div>
                      <h4 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", marginBottom: 16, color: "var(--text-bright)" }}>
                        Performance Indicators (KPIs)
                      </h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                        {kpis.map(k => {
                          const unit = k.unit;
                          return (
                            <div key={k.id} style={{ padding: 16, borderRadius: 12, border: "1px solid var(--border-glass)", background: "rgba(255,255,255,0.01)" }}>
                              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
                                {k.name}
                              </div>
                              <div style={{ fontSize: "1.4rem", fontWeight: "800", marginTop: 4, fontFamily: "var(--font-title)", color: "var(--text-bright)" }}>
                                {unit === "$" ? "$" : ""}{k.value.toLocaleString()}{unit !== "$" ? unit : ""}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: k.trend >= 0 ? "var(--color-success)" : "var(--color-danger)", marginTop: 4 }}>
                                {k.trend >= 0 ? "+" : ""}{k.trend}% since last week (Target: {k.target.toLocaleString()})
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active Widgets Rendering */}
                    <div>
                      <h4 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", marginBottom: 16, color: "var(--text-bright)" }}>
                        Layout Snapshot: {activeDashboard?.name}
                      </h4>
                      
                      <div className="dashboard-grid">
                        {activeWidgets.map(w => {
                          const ds = datasets.find(d => d.id === w.datasetId);
                          // Force aggregate sum inside PDF preview for simplicity and performance if needed, or let standard WidgetCard do it
                          return (
                            <div key={w.id} className={`w-col-${Math.min(w.w, 2)}`} style={{ minHeight: "220px", display: "flex", flexDirection: "column", border: "1px solid var(--border-glass)", padding: 12, borderRadius: 8 }}>
                              <span style={{ fontSize: "0.85rem", fontWeight: "bold", marginBottom: 8 }}>{w.title}</span>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 8 }}>
                                Type: {w.type.toUpperCase()} | Source: {ds?.name || "Deleted"}
                              </div>
                              <div style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.01)", borderRadius: 6, border: "1px dashed rgba(255,255,255,0.04)" }}>
                                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                  [Chart Element: {w.xAxis} x {w.yAxis || "Frequency"}]
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}
      </main>

      {/* Widget Edit/Create Slideover Form */}
      <WidgetForm
        isOpen={isWidgetFormOpen}
        onClose={() => setIsWidgetFormOpen(false)}
        onSave={handleSaveWidget}
        widget={editingWidget}
        datasets={datasets}
      />
      
      {/* Dynamic inline spinner styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

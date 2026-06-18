import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const COLOR_PRESETS = [
  "#6366f1", // Indigo
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#ef4444", // Red
  "#8b5cf6"  // Purple
];

export default function WidgetForm({ isOpen, onClose, onSave, widget, datasets }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("line");
  const [datasetId, setDatasetId] = useState("");
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [aggregate, setAggregate] = useState("none");
  const [color, setColor] = useState("#6366f1");
  const [w, setW] = useState(2);
  const [h, setH] = useState(2);

  const activeDataset = datasets.find(d => d.id === datasetId);
  const columns = activeDataset ? activeDataset.columns : [];

  // Populate form if editing
  useEffect(() => {
    if (widget) {
      setTitle(widget.title || "");
      setType(widget.type || "line");
      setDatasetId(widget.datasetId || "");
      setXAxis(widget.xAxis || "");
      setYAxis(widget.yAxis || "");
      setAggregate(widget.aggregate || "none");
      setColor(widget.color || "#6366f1");
      setW(widget.w || 2);
      setH(widget.h || 2);
    } else {
      // Defaults
      setTitle("");
      setType("line");
      setDatasetId(datasets[0]?.id || "");
      setXAxis("");
      setYAxis("");
      setAggregate("none");
      setColor("#6366f1");
      setW(2);
      setH(2);
    }
  }, [widget, isOpen, datasets]);

  // Set default columns when dataset changes
  useEffect(() => {
    if (activeDataset && !widget) {
      setXAxis(activeDataset.columns[0] || "");
      setYAxis(activeDataset.columns[1] || "");
    }
  }, [datasetId]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !datasetId || !xAxis) {
      alert("Please fill in all required fields.");
      return;
    }

    onSave({
      id: widget?.id || `w_${Date.now()}`,
      title,
      type,
      datasetId,
      xAxis,
      yAxis: type !== "kpi" ? yAxis : xAxis, // For KPI widgets, aggregate on X axis if Y is missing
      aggregate,
      color,
      w: parseInt(w),
      h: parseInt(h)
    });
  };

  return (
    <div className="slideover-backdrop" onClick={onClose}>
      <div className="slideover-panel" onClick={(e) => e.stopPropagation()}>
        <div className="slideover-header">
          <h3 className="slideover-title">{widget ? "Edit Widget" : "Add Custom Widget"}</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="slideover-body">
          <div className="form-group">
            <label className="form-label">Widget Title *</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Q2 Revenue Trend"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Chart Type *</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="kpi">Stat Card (KPI)</option>
              <option value="table">Data Table</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Data Source (Dataset) *</label>
            <select
              className="form-select"
              value={datasetId}
              onChange={(e) => setDatasetId(e.target.value)}
              required
            >
              <option value="" disabled>Select a dataset...</option>
              {datasets.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {columns.length > 0 && (
            <>
              <div className="form-group">
                <label className="form-label">X-Axis Column (Labels) *</label>
                <select className="form-select" value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {type !== "kpi" && (
                <div className="form-group">
                  <label className="form-label">Y-Axis Column (Values)</label>
                  <select className="form-select" value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
                    <option value="">None (Count occurrence)</option>
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              )}

              {yAxis && type !== "kpi" && (
                <div className="form-group">
                  <label className="form-label">Aggregation Function</label>
                  <select
                    className="form-select"
                    value={aggregate}
                    onChange={(e) => setAggregate(e.target.value)}
                  >
                    <option value="none">None (Direct rows mapping)</option>
                    <option value="sum">Sum</option>
                    <option value="avg">Average</option>
                    <option value="count">Count Rows</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label className="form-label">Widget Dimensions (Grid)</label>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Width (Cols 1-4)</span>
                <select className="form-select" value={w} onChange={(e) => setW(e.target.value)}>
                  <option value="1">1 Col</option>
                  <option value="2">2 Cols</option>
                  <option value="3">3 Cols</option>
                  <option value="4">4 Cols</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Height (Rows 1-2)</span>
                <select className="form-select" value={h} onChange={(e) => setH(e.target.value)}>
                  <option value="1">1 Row</option>
                  <option value="2">2 Rows</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Theme Color</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  type="button"
                  style={{
                    backgroundColor: c,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: color === c ? "2px solid #ffffff" : "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer"
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
            <input
              type="color"
              className="form-input"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ height: 40, padding: 2, cursor: "pointer" }}
            />
          </div>
        </form>

        <div className="slideover-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            {widget ? "Save Changes" : "Create Widget"}
          </button>
        </div>
      </div>
    </div>
  );
}

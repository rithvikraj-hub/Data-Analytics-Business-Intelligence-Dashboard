import React, { useState } from "react";
import { Settings, Target, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";

export default function KPIThresholds({ kpis, onSaveKPI }) {
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [target, setTarget] = useState(0);
  const [warnThreshold, setWarnThreshold] = useState(0);
  const [critThreshold, setCritThreshold] = useState(0);
  const [unit, setUnit] = useState("");

  const handleEditClick = (kpi) => {
    setSelectedKPI(kpi);
    setTarget(kpi.target || 0);
    setWarnThreshold(kpi.warnThreshold || 0);
    setCritThreshold(kpi.critThreshold || 0);
    setUnit(kpi.unit || "");
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedKPI) return;

    onSaveKPI({
      ...selectedKPI,
      target: parseFloat(target),
      warnThreshold: parseFloat(warnThreshold),
      critThreshold: parseFloat(critThreshold),
      unit
    });
    setSelectedKPI(null);
  };

  // Status helper based on thresholds
  const getKPIStatus = (kpi) => {
    const val = kpi.value;
    const warn = kpi.warnThreshold;
    const crit = kpi.critThreshold;

    // Standard KPI: larger is better (e.g. Sales, Users)
    if (warn > crit) {
      if (val <= crit) return "danger";
      if (val <= warn) return "warning";
      return "success";
    }
    // Reverse KPI: smaller is better (e.g. Churn Rate)
    else {
      if (val >= crit) return "danger";
      if (val >= warn) return "warning";
      return "success";
    }
  };

  return (
    <div className="glass-card">
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", fontWeight: 700, color: "var(--text-bright)" }}>
          KPI Monitoring & Alert Thresholds
        </h3>
        <p className="text-muted" style={{ fontSize: "0.9rem" }}>
          Monitor business performance indicators and configure system warnings when performance falls below operational targets.
        </p>
      </div>

      <div className="kpi-manager-list">
        {kpis.map((kpi) => {
          const status = getKPIStatus(kpi);
          const unitSym = kpi.unit;
          const isChurn = kpi.name.toLowerCase().includes("churn");

          return (
            <div key={kpi.id} className="glass-card kpi-manager-item" style={{ borderLeft: `4px solid var(--color-${status})` }}>
              <div className="kpi-info-sec">
                <span className="kpi-name-lbl">{kpi.name}</span>
                
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "8px 0" }}>
                  <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-bright)", fontFamily: "var(--font-title)" }}>
                    {unitSym === "$" ? "$" : ""}{kpi.value.toLocaleString()}{unitSym !== "$" ? unitSym : ""}
                  </span>
                  
                  <span className={`kpi-trend ${kpi.trend >= 0 ? "positive" : "negative"}`}>
                    {kpi.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(kpi.trend)}%
                  </span>
                </div>

                <div className="kpi-threshold-pills">
                  <span className="threshold-pill target">
                    Target: {unitSym === "$" ? "$" : ""}{kpi.target.toLocaleString()}{unitSym !== "$" ? unitSym : ""}
                  </span>
                  <span className="threshold-pill warn">
                    Warn: {isChurn ? ">" : "<"} {unitSym === "$" ? "$" : ""}{kpi.warnThreshold.toLocaleString()}{unitSym !== "$" ? unitSym : ""}
                  </span>
                  <span className="threshold-pill crit">
                    Critical: {isChurn ? ">" : "<"} {unitSym === "$" ? "$" : ""}{kpi.critThreshold.toLocaleString()}{unitSym !== "$" ? unitSym : ""}
                  </span>
                </div>
              </div>

              {/* Sparkline & Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                {kpi.historicalData && kpi.historicalData.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "right" }}>3-Period Trend</span>
                    <div className="kpi-sparkline" style={{ width: 120 }}>
                      {kpi.historicalData.map((val, i) => {
                        const max = Math.max(...kpi.historicalData, 1);
                        const pct = (val / max) * 100;
                        return (
                          <div
                            key={i}
                            className={`kpi-sparkline-bar ${i === kpi.historicalData.length - 1 ? "highlight" : ""}`}
                            style={{ height: `${Math.max(pct, 15)}%` }}
                            title={`Period ${i + 1}: ${val}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                <button className="btn btn-secondary" onClick={() => handleEditClick(kpi)}>
                  <Settings size={14} /> Configure Alerts
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Alert Thresholds Slide-over Panel */}
      {selectedKPI && (
        <div className="slideover-backdrop" onClick={() => setSelectedKPI(null)}>
          <div className="slideover-panel" onClick={(e) => e.stopPropagation()}>
            <div className="slideover-header">
              <h3 className="slideover-title">Configure Alerts: {selectedKPI.name}</h3>
              <button className="btn-icon" onClick={() => setSelectedKPI(null)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="slideover-body">
              <div className="form-group">
                <label className="form-label">Metric Symbol / Unit</label>
                <input
                  type="text"
                  className="form-input"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., $, %, count"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Goal Value</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warning Alert Threshold</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={warnThreshold}
                  onChange={(e) => setWarnThreshold(e.target.value)}
                  required
                />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Trigger warning color when KPI falls below this value (or goes above for churn).
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Critical Alert Threshold</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={critThreshold}
                  onChange={(e) => setCritThreshold(e.target.value)}
                  required
                />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Trigger red warning alert when KPI reaches critical values.
                </span>
              </div>
            </form>

            <div className="slideover-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedKPI(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

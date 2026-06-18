import React, { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, Trash2, Database, AlertCircle, Check } from "lucide-react";

export default function DataPreview({ datasets, onImportDataset, onDeleteDataset }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Preview structure after parsing
  const [parsedPreview, setParsedPreview] = useState(null);
  const [datasetName, setDatasetName] = useState("");
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileParsing(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileParsing(e.target.files[0]);
    }
  };

  const handleFileParsing = async (selectedFile) => {
    if (!selectedFile.name.endsWith(".csv") && !selectedFile.name.endsWith(".json")) {
      setError("Unsupported format. Please upload a .csv or .json file.");
      return;
    }

    setFile(selectedFile);
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to parse file");
      }

      setParsedPreview(result);
      setDatasetName(result.name);
    } catch (err) {
      console.error("File parse error:", err);
      setError(err.message || "An error occurred while parsing the file.");
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!datasetName.trim()) {
      alert("Please enter a name for this dataset.");
      return;
    }

    const newDataset = {
      id: `ds_${Date.now()}`,
      name: datasetName,
      columns: parsedPreview.columns,
      data: parsedPreview.data
    };

    onImportDataset(newDataset);
    
    // Reset state
    setFile(null);
    setParsedPreview(null);
    setDatasetName("");
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      
      {/* File Upload Zone & Preview Panel */}
      <div className="glass-card">
        <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", fontWeight: 700, color: "var(--text-bright)", marginBottom: 8 }}>
          Import Datasets
        </h3>
        <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: 24 }}>
          Upload CSV spreadsheets or JSON arrays. Vanguard Analytics parses column aggregates instantly for custom mapping.
        </p>

        {!parsedPreview ? (
          <div>
            <div
              className={`dropzone ${dragActive ? "drag-active" : ""}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept=".csv,.json"
              />
              
              <UploadCloud size={40} className="dropzone-icon" style={{ margin: "0 auto 16px auto" }} />
              
              {loading ? (
                <p className="dropzone-text">Uploading and parsing file...</p>
              ) : (
                <p className="dropzone-text">
                  Drag and drop your file here, or <strong>browse</strong>
                  <br />
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 8, display: "block" }}>
                    Supports .csv and .json files (Max 10MB)
                  </span>
                </p>
              )}
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, color: "var(--color-danger)", fontSize: "0.9rem" }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          /* File Preview Layout */
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Dataset Name</label>
              <input
                type="text"
                className="form-input"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="Dataset display name"
              />
            </div>

            <div>
              <span className="form-label" style={{ display: "block", marginBottom: 8 }}>Detected Columns ({parsedPreview.columns.length})</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {parsedPreview.columns.map(c => (
                  <span key={c} style={{ fontSize: "0.8rem", padding: "4px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-glass)", borderRadius: 6, color: "var(--text-bright)" }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="form-label" style={{ display: "block", marginBottom: 8 }}>
                Data Preview (First 5 of {parsedPreview.data.length} rows)
              </span>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      {parsedPreview.columns.map(c => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPreview.data.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        {parsedPreview.columns.map(col => (
                          <td key={col}>{String(row[col] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setParsedPreview(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmImport}>
                <Check size={14} /> Import to Active Catalog
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dataset Catalog Management */}
      <div className="glass-card">
        <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", fontWeight: 700, color: "var(--text-bright)", marginBottom: 8 }}>
          Dataset Catalog
        </h3>
        <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: 24 }}>
          Manage your uploaded datasets and data feeds currently stored in the analytics database.
        </p>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Dataset Name</th>
                <th>Columns</th>
                <th>Records</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600, color: "var(--text-bright)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Database size={16} style={{ color: "var(--color-primary)" }} />
                      {d.name}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {d.columns.slice(0, 4).join(", ")}
                      {d.columns.length > 4 ? ` (+${d.columns.length - 4} more)` : ""}
                    </span>
                  </td>
                  <td>{d.data?.length || 0}</td>
                  <td>
                    {d.id.startsWith("ds_") && d.id !== "ds_ecommerce_sales" && d.id !== "ds_saas_metrics" && d.id !== "ds_web_traffic" ? (
                      <button className="btn-icon" onClick={() => onDeleteDataset(d.id)} style={{ color: "var(--color-danger)" }} title="Delete Dataset">
                        <Trash2 size={14} />
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>System Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

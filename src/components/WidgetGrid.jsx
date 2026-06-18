import React, { useState } from "react";
import WidgetCard from "./WidgetCard";
import { Move } from "lucide-react";

export default function WidgetGrid({ widgets, datasets, onEditWidget, onDeleteWidget, onReorderWidgets }) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, idx) => {
    setDraggedIndex(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragOverIndex !== idx) {
      setDragOverIndex(idx);
    }
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIdx) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedWidgets = [...widgets];
    const [movedWidget] = updatedWidgets.splice(draggedIndex, 1);
    updatedWidgets.splice(targetIdx, 0, movedWidget);

    onReorderWidgets(updatedWidgets);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (widgets.length === 0) {
    return (
      <div className="glass-card empty-placeholder" style={{ minHeight: "350px" }}>
        <Move size={36} className="empty-placeholder-icon" />
        <h4 style={{ fontFamily: "var(--font-title)", marginBottom: 8, fontSize: "1.1rem" }}>Create your custom layout</h4>
        <p className="text-muted" style={{ maxWidth: "320px", fontSize: "0.9rem" }}>
          No widgets on this dashboard yet. Click **"Add Widget"** to start creating custom data visualizations.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      {widgets.map((widget, index) => {
        const dataset = datasets.find(d => d.id === widget.datasetId);
        
        return (
          <div
            key={widget.id}
            className={`w-col-${widget.w || 2} w-row-${widget.h || 1}`}
            style={{
              opacity: draggedIndex === index ? 0.4 : 1,
              transition: "opacity var(--transition-fast)",
              border: dragOverIndex === index ? "2px dashed var(--color-primary)" : "none",
              borderRadius: "16px"
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
          >
            <WidgetCard
              widget={widget}
              dataset={dataset}
              onEdit={onEditWidget}
              onDelete={onDeleteWidget}
            />
          </div>
        );
      })}
    </div>
  );
}

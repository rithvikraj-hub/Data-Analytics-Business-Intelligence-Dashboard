import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import { Edit2, Trash2, TableProperties, BarChart3, TrendingUp, DollarSign } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Aggregate data helper
function processWidgetData(data, xAxis, yAxis, aggregateType) {
  if (!data || data.length === 0 || !xAxis) return [];

  if (!yAxis || aggregateType === "none") {
    return data.map(item => ({
      label: String(item[xAxis]),
      value: yAxis ? parseFloat(item[yAxis]) || 0 : 0
    }));
  }

  const groups = {};
  data.forEach(item => {
    const groupKey = String(item[xAxis] ?? "N/A");
    const value = parseFloat(item[yAxis]) || 0;

    if (!groups[groupKey]) {
      groups[groupKey] = { sum: 0, count: 0 };
    }
    groups[groupKey].sum += value;
    groups[groupKey].count += 1;
  });

  return Object.keys(groups).map(key => {
    let val = 0;
    if (aggregateType === "sum") {
      val = groups[key].sum;
    } else if (aggregateType === "avg") {
      val = groups[key].count > 0 ? groups[key].sum / groups[key].count : 0;
    } else if (aggregateType === "count") {
      val = groups[key].count;
    }
    return {
      label: key,
      value: parseFloat(val.toFixed(2))
    };
  });
}

export default function WidgetCard({ widget, dataset, onEdit, onDelete }) {
  const rawData = dataset?.data || [];
  const processedData = processWidgetData(rawData, widget.xAxis, widget.yAxis, widget.aggregate);
  
  const labels = processedData.map(d => d.label);
  const values = processedData.map(d => d.value);

  // Styling helper for Chart.js
  const primaryColor = widget.color || "#6366f1";
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: widget.type === "pie",
        position: "bottom",
        labels: {
          color: "#9ca3af",
          font: { family: "Inter", size: 11 }
        }
      },
      tooltip: {
        backgroundColor: "rgba(8, 12, 24, 0.95)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        titleColor: "#ffffff",
        bodyColor: "#f3f4f6",
        titleFont: { family: "Outfit", weight: "bold" },
        bodyFont: { family: "Inter" },
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: widget.type !== "pie" ? {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.04)" },
        ticks: { color: "#9ca3af", font: { family: "Inter", size: 11 } }
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.04)" },
        ticks: { color: "#9ca3af", font: { family: "Inter", size: 11 } }
      }
    } : undefined
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: widget.yAxis || "Count",
        data: values,
        backgroundColor: widget.type === "pie" 
          ? [
              primaryColor,
              "#06b6d4",
              "#d946ef",
              "#f59e0b",
              "#10b981",
              "#ef4444",
              "#8b949e"
            ]
          : widget.type === "line"
            ? `${primaryColor}22`
            : primaryColor,
        borderColor: primaryColor,
        borderWidth: widget.type === "line" ? 3 : 1,
        fill: widget.type === "line",
        tension: 0.3,
        pointBackgroundColor: primaryColor,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const renderContent = () => {
    if (!dataset) {
      return (
        <div className="empty-placeholder">
          <p className="text-muted">Dataset not found or deleted.</p>
        </div>
      );
    }

    if (rawData.length === 0) {
      return (
        <div className="empty-placeholder">
          <p className="text-muted">No data available in this dataset.</p>
        </div>
      );
    }

    switch (widget.type) {
      case "line":
        return <Line options={chartOptions} data={chartData} />;
      case "bar":
        return <Bar options={chartOptions} data={chartData} />;
      case "pie":
        return <Pie options={chartOptions} data={chartData} />;
      case "kpi": {
        const sum = values.reduce((a, b) => a + b, 0);
        const displayVal = widget.aggregate === "avg" 
          ? (sum / (values.length || 1)).toFixed(2)
          : sum;
        return (
          <div className="empty-placeholder" style={{ padding: 0 }}>
            <div className="kpi-value-container" style={{ flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div className="kpi-value" style={{ fontSize: "2.8rem" }}>
                {Number(displayVal).toLocaleString()}
              </div>
              <div className="kpi-title" style={{ fontSize: "0.85rem", marginTop: 4 }}>
                {widget.aggregate === "none" ? `Latest ${widget.yAxis}` : `${widget.aggregate.toUpperCase()} of ${widget.yAxis}`}
              </div>
            </div>
          </div>
        );
      }
      case "table":
        return (
          <div className="data-table-container" style={{ maxHeight: "220px", overflowY: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{widget.xAxis}</th>
                  {widget.yAxis && <th>{widget.yAxis}</th>}
                </tr>
              </thead>
              <tbody>
                {processedData.slice(0, 50).map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.label}</td>
                    {widget.yAxis && <td>{row.value.toLocaleString()}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  const widgetColClass = `w-col-${widget.w || 2}`;
  const widgetRowClass = `w-row-${widget.h || 1}`;

  return (
    <div className={`glass-card widget-card ${widgetColClass} ${widgetRowClass}`}>
      <div className="widget-header">
        <h3 className="widget-title">{widget.title}</h3>
        <div className="widget-actions">
          <button className="btn-icon" onClick={() => onEdit(widget)} title="Edit Widget">
            <Edit2 size={14} />
          </button>
          <button className="btn-icon" onClick={() => onDelete(widget.id)} title="Delete Widget" style={{ hover: { color: "var(--color-danger)" } }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="widget-content">
        {renderContent()}
      </div>
    </div>
  );
}

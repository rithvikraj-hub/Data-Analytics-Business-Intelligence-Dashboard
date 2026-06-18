const sampleDatasets = [
  {
    id: "ds_ecommerce_sales",
    name: "E-Commerce Sales",
    columns: ["Date", "Sales", "Category", "Quantity", "Region", "Profit"],
    data: [
      { "Date": "2026-06-01", "Sales": 1200, "Category": "Electronics", "Quantity": 3, "Region": "North", "Profit": 300 },
      { "Date": "2026-06-02", "Sales": 850, "Category": "Clothing", "Quantity": 5, "Region": "West", "Profit": 255 },
      { "Date": "2026-06-03", "Sales": 2400, "Category": "Electronics", "Quantity": 6, "Region": "East", "Profit": 720 },
      { "Date": "2026-06-04", "Sales": 450, "Category": "Home & Kitchen", "Quantity": 2, "Region": "South", "Profit": 90 },
      { "Date": "2026-06-05", "Sales": 1600, "Category": "Office Supplies", "Quantity": 12, "Region": "North", "Profit": 480 },
      { "Date": "2026-06-06", "Sales": 1950, "Category": "Electronics", "Quantity": 4, "Region": "West", "Profit": 585 },
      { "Date": "2026-06-07", "Sales": 3100, "Category": "Electronics", "Quantity": 8, "Region": "East", "Profit": 930 },
      { "Date": "2026-06-08", "Sales": 620, "Category": "Clothing", "Quantity": 4, "Region": "South", "Profit": 186 },
      { "Date": "2026-06-09", "Sales": 750, "Category": "Home & Kitchen", "Quantity": 3, "Region": "North", "Profit": 150 },
      { "Date": "2026-06-10", "Sales": 2100, "Category": "Office Supplies", "Quantity": 15, "Region": "West", "Profit": 630 },
      { "Date": "2026-06-11", "Sales": 1400, "Category": "Electronics", "Quantity": 4, "Region": "East", "Profit": 420 },
      { "Date": "2026-06-12", "Sales": 950, "Category": "Clothing", "Quantity": 6, "Region": "South", "Profit": 285 },
      { "Date": "2026-06-13", "Sales": 1800, "Category": "Home & Kitchen", "Quantity": 5, "Region": "North", "Profit": 360 },
      { "Date": "2026-06-14", "Sales": 2800, "Category": "Electronics", "Quantity": 7, "Region": "West", "Profit": 840 },
      { "Date": "2026-06-15", "Sales": 3500, "Category": "Office Supplies", "Quantity": 20, "Region": "East", "Profit": 1050 }
    ]
  },
  {
    id: "ds_saas_metrics",
    name: "SaaS Business Metrics",
    columns: ["Month", "MRR", "Churn_Rate", "CAC", "LTV", "Active_Users"],
    data: [
      { "Month": "Jan", "MRR": 45000, "Churn_Rate": 4.5, "CAC": 120, "LTV": 3600, "Active_Users": 1200 },
      { "Month": "Feb", "MRR": 48500, "Churn_Rate": 4.2, "CAC": 115, "LTV": 3800, "Active_Users": 1350 },
      { "Month": "Mar", "MRR": 53000, "Churn_Rate": 3.9, "CAC": 110, "LTV": 4100, "Active_Users": 1500 },
      { "Month": "Apr", "MRR": 58000, "Churn_Rate": 4.0, "CAC": 108, "LTV": 4300, "Active_Users": 1720 },
      { "Month": "May", "MRR": 64000, "Churn_Rate": 3.6, "CAC": 105, "LTV": 4600, "Active_Users": 1950 },
      { "Month": "Jun", "MRR": 72000, "Churn_Rate": 3.2, "CAC": 100, "LTV": 5000, "Active_Users": 2300 },
      { "Month": "Jul", "MRR": 81000, "Churn_Rate": 3.0, "CAC": 95, "LTV": 5400, "Active_Users": 2700 },
      { "Month": "Aug", "MRR": 89000, "Churn_Rate": 3.1, "CAC": 98, "LTV": 5300, "Active_Users": 3100 },
      { "Month": "Sep", "MRR": 98000, "Churn_Rate": 2.8, "CAC": 92, "LTV": 5800, "Active_Users": 3600 },
      { "Month": "Oct", "MRR": 108000, "Churn_Rate": 2.5, "CAC": 88, "LTV": 6200, "Active_Users": 4100 },
      { "Month": "Nov", "MRR": 119000, "Churn_Rate": 2.4, "CAC": 85, "LTV": 6500, "Active_Users": 4750 },
      { "Month": "Dec", "MRR": 132000, "Churn_Rate": 2.2, "CAC": 80, "LTV": 7000, "Active_Users": 5500 }
    ]
  },
  {
    id: "ds_web_traffic",
    name: "Website Traffic & Funnel",
    columns: ["Date", "Visitors", "Page_Views", "Bounce_Rate", "Conversion_Rate", "Source"],
    data: [
      { "Date": "2026-06-01", "Visitors": 5200, "Page_Views": 15600, "Bounce_Rate": 45.2, "Conversion_Rate": 2.1, "Source": "Organic Search" },
      { "Date": "2026-06-02", "Visitors": 4800, "Page_Views": 13400, "Bounce_Rate": 47.8, "Conversion_Rate": 1.9, "Source": "Direct" },
      { "Date": "2026-06-03", "Visitors": 6100, "Page_Views": 19500, "Bounce_Rate": 42.1, "Conversion_Rate": 2.5, "Source": "Social Media" },
      { "Date": "2026-06-04", "Visitors": 7200, "Page_Views": 23000, "Bounce_Rate": 40.5, "Conversion_Rate": 2.8, "Source": "Paid Ads" },
      { "Date": "2026-06-05", "Visitors": 5800, "Page_Views": 16800, "Bounce_Rate": 44.0, "Conversion_Rate": 2.2, "Source": "Organic Search" },
      { "Date": "2026-06-06", "Visitors": 4100, "Page_Views": 11500, "Bounce_Rate": 49.5, "Conversion_Rate": 1.7, "Source": "Direct" },
      { "Date": "2026-06-07", "Visitors": 4300, "Page_Views": 12000, "Bounce_Rate": 48.0, "Conversion_Rate": 1.8, "Source": "Referral" },
      { "Date": "2026-06-08", "Visitors": 6500, "Page_Views": 20100, "Bounce_Rate": 41.8, "Conversion_Rate": 2.4, "Source": "Organic Search" },
      { "Date": "2026-06-09", "Visitors": 6900, "Page_Views": 21800, "Bounce_Rate": 40.9, "Conversion_Rate": 2.6, "Source": "Paid Ads" },
      { "Date": "2026-06-10", "Visitors": 7500, "Page_Views": 24500, "Bounce_Rate": 39.2, "Conversion_Rate": 3.0, "Source": "Social Media" }
    ]
  }
];

const sampleKPIs = [
  {
    id: "kpi_mrr",
    name: "Monthly Recurring Revenue",
    value: 132000,
    unit: "$",
    target: 140000,
    warnThreshold: 120000,
    critThreshold: 100000,
    trend: 10.9,
    historicalData: [108000, 119000, 132000]
  },
  {
    id: "kpi_active_users",
    name: "Active Users",
    value: 5500,
    unit: "",
    target: 5000,
    warnThreshold: 4500,
    critThreshold: 4000,
    trend: 15.7,
    historicalData: [4100, 4750, 5500]
  },
  {
    id: "kpi_conv_rate",
    name: "Traffic Conversion Rate",
    value: 2.8,
    unit: "%",
    target: 3.0,
    warnThreshold: 2.2,
    critThreshold: 1.8,
    trend: 7.6,
    historicalData: [2.4, 2.6, 2.8]
  },
  {
    id: "kpi_churn_rate",
    name: "Customer Churn Rate",
    value: 2.2,
    unit: "%",
    target: 2.0,
    warnThreshold: 3.0,
    critThreshold: 4.5,
    trend: -8.3,
    historicalData: [2.5, 2.4, 2.2]
  }
];

const defaultDashboards = [
  {
    id: "dash_executive_overview",
    name: "Executive Overview",
    widgets: [
      {
        id: "w_mrr_trend",
        title: "Monthly Recurring Revenue (MRR) Growth",
        type: "line",
        datasetId: "ds_saas_metrics",
        xAxis: "Month",
        yAxis: "MRR",
        aggregate: "none",
        color: "#6366f1",
        w: 3,
        h: 2
      },
      {
        id: "w_active_users",
        title: "Active Users Trend",
        type: "bar",
        datasetId: "ds_saas_metrics",
        xAxis: "Month",
        yAxis: "Active_Users",
        aggregate: "none",
        color: "#14b8a6",
        w: 1,
        h: 2
      },
      {
        id: "w_sales_category",
        title: "Sales by Product Category",
        type: "pie",
        datasetId: "ds_ecommerce_sales",
        xAxis: "Category",
        yAxis: "Sales",
        aggregate: "sum",
        color: "#ec4899",
        w: 2,
        h: 2
      },
      {
        id: "w_traffic_source",
        title: "Website Traffic Visitors by Source",
        type: "bar",
        datasetId: "ds_web_traffic",
        xAxis: "Source",
        yAxis: "Visitors",
        aggregate: "sum",
        color: "#f59e0b",
        w: 2,
        h: 2
      }
    ]
  }
];

module.exports = { sampleDatasets, sampleKPIs, defaultDashboards };

import React, { useState, useEffect, useRef } from "react";

const API = "http://localhost:8000/api/v1/inventory";

const RANGES = [
  { label: "7 Days", value: "7d" },
  { label: "15 Days", value: "15d" },
  { label: "30 Days", value: "30d" },
  { label: "3 Months", value: "3m" },
  { label: "6 Months", value: "6m" },
  { label: "1 Year", value: "1y" },
  { label: "All Time", value: "all" },
];

export default function DrugReport() {
  const [range, setRange] = useState("30d");
  const [mode, setMode] = useState("quantity");
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/report?range=${range}`);
      const json = await res.json();
      if (res.ok) {
        setMeta({ start: json.start_date, end: json.end_date });
        setData(json.data);
      } else {
        setError("Failed to load report");
      }
    } catch {
      setError("Cannot connect to server");
    }
    setLoading(false);
  };

  useEffect(() => { fetchReport(); }, [range]);

  // Draw bar chart on canvas
  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const paddingLeft = 60;
    const paddingBottom = 60;
    const paddingTop = 20;
    const paddingRight = 20;

    ctx.clearRect(0, 0, W, H);

    const values = data.map(d => mode === "quantity" ? d.total_quantity_in : d.total_price_in);
    const maxVal = Math.max(...values, 1);
    const chartW = W - paddingLeft - paddingRight;
    const chartH = H - paddingTop - paddingBottom;
    const barWidth = Math.min(60, (chartW / data.length) * 0.6);
    const gap = chartW / data.length;

    // Grid lines
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = paddingTop + chartH - (i / 5) * chartH;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(W - paddingRight, y);
      ctx.stroke();

      // Y labels
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "right";
      const labelVal = Math.round((maxVal * i) / 5);
      ctx.fillText(mode === "price" ? `฿${labelVal.toLocaleString()}` : labelVal, paddingLeft - 6, y + 4);
    }

    // Bars
    data.forEach((d, i) => {
      const val = mode === "quantity" ? d.total_quantity_in : d.total_price_in;
      const barH = (val / maxVal) * chartH;
      const x = paddingLeft + gap * i + gap / 2 - barWidth / 2;
      const y = paddingTop + chartH - barH;

      // Bar
      ctx.fillStyle = mode === "quantity" ? "#3b82f6" : "#16a34a";
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
      ctx.fill();

      // Value on top
      ctx.fillStyle = "#374151";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(mode === "price" ? `฿${val.toLocaleString()}` : val, x + barWidth / 2, y - 5);

      // X label
      ctx.fillStyle = "#64748b";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      const label = d.name.length > 10 ? d.name.slice(0, 10) + "…" : d.name;
      ctx.fillText(label, x + barWidth / 2, H - paddingBottom + 16);
    });

    // Axes
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop);
    ctx.lineTo(paddingLeft, paddingTop + chartH);
    ctx.lineTo(W - paddingRight, paddingTop + chartH);
    ctx.stroke();

  }, [data, mode]);

  const totalQty = data.reduce((s, d) => s + d.total_quantity_in, 0);
  const totalPrice = data.reduce((s, d) => s + d.total_price_in, 0);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>📊 Drug In Report</h2>
        <p style={styles.subtitle}>{meta ? `${meta.start} → ${meta.end}` : "Loading..."}</p>

        {/* Time Range */}
        <div style={styles.rangeRow}>
          {RANGES.map(r => (
            <button key={r.value} style={{ ...styles.rangeBtn, ...(range === r.value ? styles.rangeBtnActive : {}) }} onClick={() => setRange(r.value)}>
              {r.label}
            </button>
          ))}
        </div>

        {/* Mode Toggle */}
        <div style={styles.toggleRow}>
          <button style={{ ...styles.modeBtn, ...(mode === "quantity" ? styles.modeBtnActive : {}) }} onClick={() => setMode("quantity")}>📦 Quantity</button>
          <button style={{ ...styles.modeBtn, ...(mode === "price" ? styles.modeBtnActive : {}) }} onClick={() => setMode("price")}>฿ Price</button>
        </div>

        {/* Summary Cards */}
        {!loading && !error && (
          <div style={styles.cards}>
            <div style={styles.card}>
              <p style={styles.cardLabel}>Total Drug Types</p>
              <p style={styles.cardValue}>{data.length}</p>
            </div>
            <div style={styles.card}>
              <p style={styles.cardLabel}>Total Qty In</p>
              <p style={styles.cardValue}>{totalQty.toLocaleString()} units</p>
            </div>
            <div style={{ ...styles.card, background: "#f0fdf4" }}>
              <p style={styles.cardLabel}>Total Value In</p>
              <p style={{ ...styles.cardValue, color: "#16a34a" }}>฿{totalPrice.toLocaleString()}</p>
            </div>
          </div>
        )}

        {loading && <div style={styles.center}>Loading...</div>}
        {error && <div style={styles.errorBox}>{error}</div>}

        {!loading && !error && data.length === 0 && (
          <div style={styles.center}>No data for this time range.</div>
        )}

        {/* Canvas Chart */}
        {!loading && !error && data.length > 0 && (
          <div style={styles.chartBox}>
            <h3 style={styles.chartTitle}>
              {mode === "quantity" ? "Quantity In by Medication" : "Value In by Medication (฿)"}
            </h3>
            <canvas ref={canvasRef} width={820} height={320} style={{ width: "100%", height: "auto" }} />
          </div>
        )}

        {/* Table */}
        {!loading && !error && data.length > 0 && (
          <div style={styles.tableBox}>
            <h3 style={styles.chartTitle}>Detail Table</h3>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Medication</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Qty In</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Value In (฿)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                    <td style={styles.td}>{d.name}</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: "700", color: "#2563eb" }}>{d.total_quantity_in.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: "700", color: "#16a34a" }}>฿{d.total_price_in.toLocaleString()}</td>
                  </tr>
                ))}
                <tr style={{ background: "#f0fdf4", fontWeight: "800" }}>
                  <td style={styles.td}>Total</td>
                  <td style={{ ...styles.td, textAlign: "right", color: "#2563eb" }}>{totalQty.toLocaleString()}</td>
                  <td style={{ ...styles.td, textAlign: "right", color: "#16a34a" }}>฿{totalPrice.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", padding: "32px 24px" },
  container: { maxWidth: "900px", margin: "0 auto" },
  title: { margin: "0 0 4px", fontSize: "28px", fontWeight: "800", color: "#0f172a" },
  subtitle: { margin: "0 0 20px", fontSize: "14px", color: "#64748b" },
  rangeRow: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" },
  rangeBtn: { padding: "7px 14px", background: "#e2e8f0", border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#475569" },
  rangeBtnActive: { background: "#2563eb", color: "#fff" },
  toggleRow: { display: "flex", gap: "8px", marginBottom: "24px" },
  modeBtn: { padding: "8px 20px", background: "#e2e8f0", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "#475569" },
  modeBtnActive: { background: "#0f172a", color: "#fff" },
  cards: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" },
  card: { background: "#fff", borderRadius: "10px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" },
  cardLabel: { margin: "0 0 6px", fontSize: "12px", color: "#64748b", fontWeight: "600" },
  cardValue: { margin: 0, fontSize: "22px", fontWeight: "800", color: "#0f172a" },
  center: { textAlign: "center", padding: "60px", color: "#94a3b8" },
  errorBox: { background: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px" },
  chartBox: { background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", marginBottom: "20px" },
  chartTitle: { margin: "0 0 16px", fontSize: "15px", fontWeight: "700", color: "#374151" },
  tableBox: { background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f1f5f9" },
  th: { padding: "10px 14px", fontSize: "12px", fontWeight: "700", color: "#475569", textAlign: "left", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "10px 14px", fontSize: "13px", color: "#374151", borderBottom: "1px solid #f1f5f9" },
};
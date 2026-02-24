import { useState, useEffect } from "react";

const API = "http://localhost:8000/api/v1/inventory";

export default function ViewMedications() {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const fetchMeds = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/view`);
      const data = await res.json();
      if (res.ok) setMeds(data);
      else setError("Failed to load medications");
    } catch {
      setError("❌ Cannot connect to server");
    }
    setLoading(false);
  };

  useEffect(() => { fetchMeds(); }, []);

  const totalStock = (stocks) => stocks.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Medication Overview</h2>
          <p style={styles.subtitle}>All medications with stock and info</p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchMeds}>↻ Refresh</button>
      </div>

      {loading && <div style={styles.center}>Loading...</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      {!loading && !error && meds.length === 0 && (
        <div style={styles.center}>No medications found. Add some first!</div>
      )}

      <div style={styles.grid}>
        {meds.map((med) => (
          <div key={med.med_id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <span style={styles.medId}>ID: {med.med_id}</span>
                <h3 style={styles.medName}>{med.name}</h3>
                {med.common_name && <p style={styles.commonName}>"{med.common_name}"</p>}
              </div>
              <div style={styles.price}>฿{med.price.toLocaleString()}</div>
            </div>

            {/* Stock Summary */}
            <div style={styles.stockRow}>
              <span style={styles.stockLabel}>Total Stock</span>
              <span style={{ ...styles.stockBadge, background: totalStock(med.stock) > 0 ? "#dcfce7" : "#fee2e2", color: totalStock(med.stock) > 0 ? "#166534" : "#991b1b" }}>
                {totalStock(med.stock)} units
              </span>
            </div>

            {/* Expand toggle */}
            <button style={styles.toggleBtn} onClick={() => setExpanded(expanded === med.med_id ? null : med.med_id)}>
              {expanded === med.med_id ? "▲ Hide Details" : "▼ Show Details"}
            </button>

            {expanded === med.med_id && (
              <div style={styles.details}>
                {/* Stock entries */}
                <p style={styles.detailTitle}>📦 Stock Entries</p>
                {med.stock.length === 0 ? (
                  <p style={styles.noData}>No stock entries</p>
                ) : (
                  med.stock.map((s) => (
                    <div key={s.inv_id} style={styles.stockEntry}>
                      <span>Qty: <b>{s.quantity}</b></span>
                      <span>In: {s.in_day}</span>
                      <span>Exp: {s.exp_day}</span>
                    </div>
                  ))
                )}

                {/* Med Info */}
                <p style={styles.detailTitle}>📋 Med Info</p>
                {!med.med_info.guideline && !med.med_info.warning ? (
                  <p style={styles.noData}>No info available</p>
                ) : (
                  <div style={styles.infoBox}>
                    {med.med_info.guideline && (
                      <div>
                        <span style={styles.infoLabel}>Guideline</span>
                        <p style={styles.infoText}>{med.med_info.guideline}</p>
                      </div>
                    )}
                    {med.med_info.warning && (
                      <div style={{ marginTop: "8px" }}>
                        <span style={{ ...styles.infoLabel, color: "#dc2626" }}>⚠ Warning</span>
                        <p style={{ ...styles.infoText, color: "#dc2626" }}>{med.med_info.warning}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", padding: "32px 24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", maxWidth: "900px", margin: "0 auto 28px" },
  title: { margin: "0 0 4px", fontSize: "28px", fontWeight: "800", color: "#0f172a" },
  subtitle: { margin: 0, fontSize: "14px", color: "#64748b" },
  refreshBtn: { padding: "8px 16px", background: "#e2e8f0", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  center: { textAlign: "center", padding: "60px", color: "#94a3b8", fontSize: "16px" },
  errorBox: { background: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: "8px", maxWidth: "900px", margin: "0 auto 20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "16px", maxWidth: "900px", margin: "0 auto" },
  card: { background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" },
  medId: { fontSize: "11px", color: "#94a3b8", fontWeight: "600", letterSpacing: "0.05em" },
  medName: { margin: "2px 0 0", fontSize: "18px", fontWeight: "800", color: "#0f172a" },
  commonName: { margin: "2px 0 0", fontSize: "13px", color: "#64748b", fontStyle: "italic" },
  price: { fontSize: "18px", fontWeight: "800", color: "#16a34a" },
  stockRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  stockLabel: { fontSize: "13px", color: "#64748b" },
  stockBadge: { fontSize: "13px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" },
  toggleBtn: { width: "100%", padding: "8px", background: "#f1f5f9", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#475569" },
  details: { marginTop: "14px", borderTop: "1px solid #f1f5f9", paddingTop: "14px" },
  detailTitle: { margin: "0 0 8px", fontSize: "13px", fontWeight: "700", color: "#374151" },
  noData: { fontSize: "13px", color: "#94a3b8", fontStyle: "italic" },
  stockEntry: { display: "flex", gap: "16px", fontSize: "13px", color: "#374151", padding: "6px 10px", background: "#f8fafc", borderRadius: "6px", marginBottom: "4px" },
  infoBox: { background: "#f8fafc", borderRadius: "8px", padding: "12px" },
  infoLabel: { fontSize: "11px", fontWeight: "700", color: "#16a34a", letterSpacing: "0.05em", textTransform: "uppercase" },
  infoText: { margin: "4px 0 0", fontSize: "13px", color: "#374151", lineHeight: "1.5" },
};

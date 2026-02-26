import React from 'react';

export default function TreatmentList({ treatments }) {
  if (!treatments || treatments.length === 0) {
    return <div style={styles.emptyState}>No treatment records found for this patient.</div>;
  }

  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Medication ID</th>
            <th style={styles.th}>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {treatments.map((t) => (
            <tr key={t.t_id}>
              <td style={styles.td}>{t.date}</td>
              <td style={styles.td}>{t.med_id}</td>
              <td style={styles.td}>{t.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  emptyState: { 
    padding: '30px', 
    textAlign: 'center', 
    backgroundColor: '#f1f5f9', 
    color: '#64748b', 
    borderRadius: '4px', 
    fontSize: '14px' 
  },
  tableContainer: {
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid #cbd5e1'
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { 
    backgroundColor: '#1e3a8a', 
    color: '#ffffff', 
    padding: '12px 15px', 
    textAlign: 'left', 
    fontSize: '14px', 
    fontWeight: 'bold' 
  },
  td: { 
    borderBottom: '1px solid #e2e8f0', 
    padding: '12px 15px', 
    fontSize: '14px', 
    color: '#334155',
    backgroundColor: '#ffffff'
  }
};
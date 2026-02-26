import React from 'react';
import { Link } from 'react-router-dom';

export default function PatientTable({ patients, onSelectForHistory }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Patient Directory</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Patient ID</th>
              <th style={styles.th}>Full Name</th>
              <th style={styles.th}>Age</th>
              <th style={styles.th}>Gender</th>
              <th style={styles.thAction}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? (
              patients.map((p) => (
                <tr key={p.p_id} style={styles.tr}>
                  <td style={styles.td}>HN-{p.p_id}</td>
                  <td style={{...styles.td, fontWeight: 'bold', color: '#1e293b'}}>{p.name}</td>
                  <td style={styles.td}>{p.age}</td>
                  <td style={styles.td}>{p.gender}</td>
                  <td style={styles.tdAction}>
                    <button onClick={() => onSelectForHistory(p)} style={styles.historyBtn}>
                      Add Record
                    </button>
                    <Link to={`/patients/${p.p_id}`} style={styles.actionBtn}>
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" style={styles.emptyState}>No patient records found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  card: { background: '#fff', padding: '0', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  title: { margin: 0, padding: '20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#334155', fontSize: '16px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px 20px', borderBottom: '2px solid #cbd5e1', textAlign: 'left', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', background: '#ffffff' },
  thAction: { padding: '15px 20px', borderBottom: '2px solid #cbd5e1', textAlign: 'right', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', background: '#ffffff' },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#475569' },
  tdAction: { padding: '15px 20px', textAlign: 'right', whiteSpace: 'nowrap' },
  actionBtn: { padding: '8px 14px', background: '#fff', color: '#1e3a8a', textDecoration: 'none', border: '1px solid #1e3a8a', borderRadius: '4px', fontSize: '13px', marginLeft: '8px', fontWeight: 'bold', display: 'inline-block' },
  historyBtn: { padding: '8px 14px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-block' },
  emptyState: { textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: '14px' }
};
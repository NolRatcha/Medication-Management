import React from 'react';
import { Link } from 'react-router-dom';

// รับข้อมูล patients มาจากหน้าหลักผ่าน props
export default function PatientTable({ patients }) {
  return (
    <div style={styles.card}>
      <h3 style={{ marginTop: 0 }}>📋 รายชื่อผู้ป่วยทั้งหมด</h3>
      <table style={styles.table}>
        <thead>
          <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
            <th style={styles.th}>รหัสผู้ป่วย (ID)</th>
            <th style={styles.th}>ชื่อ - นามสกุล</th>
            <th style={styles.th}>อายุ</th>
            <th style={styles.th}>เพศ</th>
            <th style={styles.th}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {patients.length > 0 ? (
            patients.map((p) => (
              <tr key={p.p_id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={styles.td}>HN-{p.p_id.toString().padStart(4, '0')}</td>
                <td style={styles.td}>{p.name}</td>
                <td style={styles.td}>{p.age} ปี</td>
                <td style={styles.td}>{p.gender}</td>
                <td style={styles.td}>
                  <Link to={`/patients/${p.p_id}`} style={styles.actionBtn}>
                    ดูประวัติ/การรักษา
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>ไม่มีข้อมูล</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// (เอา styles ของตารางมาใส่ตรงนี้)
const styles = {
    card: { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { padding: '12px 15px', borderBottom: '2px solid #cbd5e1' },
    td: { padding: '12px 15px' },
    actionBtn: { padding: '8px 12px', background: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '6px' }
};
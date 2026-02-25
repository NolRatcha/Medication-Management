import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // State สำหรับจัดการโหมดแก้ไข
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    history: '', diagnosis: '', medication: '', allergies: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPatientData();
    fetchPatientHistory();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/patients/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPatient(data);
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    }
  };

  const fetchPatientHistory = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/patients/${id}/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      } else if (response.status === 404) {
        setHistory(null);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- ฟังก์ชันเมื่อกดปุ่ม "แก้ไขประวัติ" ---
  const handleEditClick = () => {
    // นำข้อมูลเดิมที่มีอยู่มาใส่ในฟอร์มเตรียมไว้
    setEditFormData({
      history: history.history || '',
      diagnosis: history.diagnosis || '',
      medication: history.medication || '',
      allergies: history.allergies || ''
    });
    setIsEditing(true); // เปิดโหมดแก้ไข
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000); // หายไปหลังจาก 3 วินาที
  };


  // --- ฟังก์ชันบันทึกการแก้ไข (ยิง API PUT) ---
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/patients/${id}/history`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
  
      if (response.ok) {
        showMessage('✅ อัปเดตประวัติสำเร็จ!', 'success'); // ใช้ฟังก์ชันใหม่
        setIsEditing(false);
        fetchPatientHistory();
      } else {
        showMessage('❌ เกิดข้อผิดพลาดในการบันทึก', 'error');
      }
    } catch (error) {
      showMessage('❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    } finally {
      setSaving(false);
    }
  };


  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>กำลังโหลดข้อมูล...</div>;
  if (!patient) return <div style={{ padding: '20px', textAlign: 'center' }}>ไม่พบข้อมูลผู้ป่วย</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <Link to="/patients" style={styles.backBtn}>
        ← กลับไปหน้ารายชื่อผู้ป่วย
      </Link>
      {message.text && (
        <div style={{
            ...styles.notification,
            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
        }}>
            {message.text}
        </div>
        )}

      <h2 style={{ color: '#0f766e', borderBottom: '2px solid #ccfbf1', paddingBottom: '10px' }}>
        👤 ข้อมูลผู้ป่วย: {patient.name}
      </h2>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* กล่องข้อมูลพื้นฐาน (SQL) */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0, color: '#334155' }}>ข้อมูลพื้นฐาน</h3>
          <p><strong>รหัส (HN):</strong> {patient.p_id}</p>
          <p><strong>ชื่อ-นามสกุล:</strong> {patient.name}</p>
          <p><strong>อายุ:</strong> {patient.age} ปี</p>
          <p><strong>เพศ:</strong> {patient.gender}</p>
        </div>

        {/* กล่องข้อมูลประวัติ (MongoDB) */}
        <div style={{ ...styles.card, flex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#0369a1' }}>📝 ประวัติการรักษา (MongoDB)</h3>
            {/* ปุ่มแก้ไข จะโชว์ก็ต่อเมื่อมีประวัติแล้ว และไม่ได้อยู่ในโหมดแก้ไข */}
            {history && !isEditing && (
              <button onClick={handleEditClick} style={styles.editBtn}>
                ✏️ แก้ไขประวัติ
              </button>
            )}
          </div>

          {!history ? (
            <div style={styles.emptyBox}>
              ผู้ป่วยรายนี้ยังไม่มีการบันทึกประวัติ <br/>
              (กรุณากลับไปหน้าหลักเพื่อกดปุ่ม "+ เพิ่มประวัติ")
            </div>
          ) : isEditing ? (
            /* --- โหมดแก้ไข: แสดงแบบฟอร์ม --- */
            <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={styles.label}>ประวัติ (History):</label>
                <textarea name="history" value={editFormData.history} onChange={handleInputChange} style={styles.textarea} />
              </div>
              <div>
                <label style={styles.label}>การวินิจฉัย (Diagnosis):</label>
                <input type="text" name="diagnosis" value={editFormData.diagnosis} onChange={handleInputChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>ยาที่ใช้ประจำ (Medication):</label>
                <input type="text" name="medication" value={editFormData.medication} onChange={handleInputChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>ประวัติแพ้ยา (Allergies):</label>
                <input type="text" name="allergies" value={editFormData.allergies} onChange={handleInputChange} style={styles.input} />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" disabled={saving} style={styles.saveBtn}>
                  {saving ? 'กำลังบันทึก...' : '💾 บันทึกการแก้ไข'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} style={styles.cancelBtn}>
                  ❌ ยกเลิก
                </button>
              </div>
            </form>
          ) : (
            /* --- โหมดปกติ: แสดงข้อความ --- */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={styles.historyBox}>
                <strong>ประวัติ (History):</strong> <br/> {history.history || '-'}
              </div>
              <div style={styles.historyBox}>
                <strong>การวินิจฉัย (Diagnosis):</strong> <br/> {history.diagnosis || '-'}
              </div>
              <div style={styles.historyBox}>
                <strong>ยาที่ใช้ประจำ (Medication):</strong> <br/> {history.medication || '-'}
              </div>
              <div style={styles.historyBox}>
                <strong style={{ color: '#dc2626' }}>ประวัติแพ้ยา (Allergies):</strong> <br/> {history.allergies || 'ไม่มี'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Styles
const styles = {
  card: { flex: 1, minWidth: '250px', background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' },
  backBtn: { display: 'inline-block', marginBottom: '15px', textDecoration: 'none', color: '#0ea5e9', fontWeight: 'bold' },
  historyBox: { background: '#f0f9ff', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #0ea5e9' },
  emptyBox: { padding: '20px', background: '#f8fafc', borderRadius: '6px', textAlign: 'center', color: '#64748b' },
  editBtn: { padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '4px', display: 'block' },
  input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '80px', fontFamily: 'inherit', boxSizing: 'border-box' },
  saveBtn: { padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flex: 1 },
  cancelBtn: { padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  notification: { padding: '12px 16px', borderRadius: '6px', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }
};
import React, { useState } from 'react';

export default function PatientHistoryForm({ patient, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    history: '', diagnosis: '', medication: '', allergies: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000); // หายไปหลังจาก 3 วินาที
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ยิง API ไปที่ MongoDB (ตาม Router ที่คุณเขียนไว้)
      const response = await fetch(`http://localhost:8000/api/v1/patients/${patient.p_id}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showMessage('✅ บันทึกประวัติลง MongoDB สำเร็จ!', 'success');
        onSuccess(); // สั่งให้หน้าหลักปิดฟอร์มนี้
      } else if (response.status === 409) {
        showMessage('❌ ผู้ป่วยคนนี้มีประวัติอยู่แล้วครับ (API แจ้งว่าต้องใช้ PUT เพื่อแก้ไข)', 'error');
      } else {
        const errorData = await response.json();
        showMessage(`❌ เกิดข้อผิดพลาด: ${JSON.stringify(errorData)}`, 'error');
      }
    } catch (error) {
      showMessage('❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modalCard}>
      <h3 style={{ color: '#0369a1', marginTop: 0 }}>
        📝 เพิ่มประวัติการรักษา: {patient.name} (HN-{patient.p_id})
      </h3>
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
      <form onSubmit={handleSubmit} style={styles.form}>
        <textarea name="history" placeholder="ประวัติผู้ป่วย (History)" value={formData.history} onChange={handleInputChange} style={styles.textarea} />
        <input type="text" name="diagnosis" placeholder="การวินิจฉัย (Diagnosis)" value={formData.diagnosis} onChange={handleInputChange} style={styles.input} />
        <input type="text" name="medication" placeholder="ยาที่ใช้ประจำ (Medication)" value={formData.medication} onChange={handleInputChange} style={styles.input} />
        <input type="text" name="allergies" placeholder="ประวัติแพ้ยา (Allergies)" value={formData.allergies} onChange={handleInputChange} style={styles.input} />
        
        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
          <button type="submit" disabled={loading} style={styles.saveBtn}>
            {loading ? 'กำลังบันทึก...' : 'บันทึกประวัติ'}
          </button>
          <button type="button" onClick={onCancel} style={styles.cancelBtn}>
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  modalCard: { background: '#f0f9ff', padding: '20px', borderRadius: '8px', border: '2px dashed #7dd3fc', marginBottom: '20px' },
  form: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  input: { flex: '1 1 45%', padding: '10px', borderRadius: '4px', border: '1px solid #bae6fd' },
  textarea: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #bae6fd', minHeight: '60px', fontFamily: 'inherit' },
  saveBtn: { padding: '10px 20px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 },
  cancelBtn: { padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  notification: { padding: '12px 16px', borderRadius: '6px', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }
};
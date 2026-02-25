import React, { useState } from 'react';

// รับ props ชื่อ onAddSuccess เพื่อสั่งให้หน้าหลักโหลดข้อมูลใหม่เมื่อบันทึกเสร็จ
export default function PatientForm({ onAddSuccess }) {
  const [formData, setFormData] = useState({ name: '', age: '', gender: 'Male' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000); // หายไปหลังจาก 3 วินาที
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/patients/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, age: parseInt(formData.age, 10) }),
      });

      if (response.ok) {
        showMessage('✅ เพิ่มผู้ป่วยสำเร็จ!', 'success');
        setFormData({ name: '', age: '', gender: 'Male' }); // ล้างฟอร์ม
        onAddSuccess(); // เรียกฟังก์ชันที่แม่ส่งมาให้ เพื่อโหลดตารางใหม่
      } else {
        showMessage(`❌ เกิดข้อผิดพลาด: ${JSON.stringify(errorData)}`, 'error');
      }
    } catch (error) {
      showMessage('❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={{ marginTop: 0 }}>➕ เพิ่มผู้ป่วยใหม่</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="text" name="name" placeholder="ชื่อ - นามสกุล" value={formData.name} onChange={handleInputChange} required style={styles.input} />
        <input type="number" name="age" placeholder="อายุ" value={formData.age} onChange={handleInputChange} required style={{ ...styles.input, maxWidth: '100px' }} />
        <select name="gender" value={formData.gender} onChange={handleInputChange} style={styles.input}>
          <option value="Male">ชาย</option>
          <option value="Female">หญิง</option>
        </select>
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
        </button>
      </form>
    </div>
  );
}

// (เอา styles.card, styles.form, styles.input, styles.button มาใส่ตรงนี้)
const styles = {
    card: { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '25px', border: '1px solid #e2e8f0' },
    form: { display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' },
    input: { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' },
    button: { padding: '10px 20px', background: '#0d9488', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
};
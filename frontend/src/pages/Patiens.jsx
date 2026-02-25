import React, { useState, useEffect } from 'react';
import PatientForm from '../components/PatientForm';
import PatientTable from '../components/PatientTable';

export default function PatientPage() {
  // หน้าหลักเป็นคนเก็บ State ผู้ป่วย
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/patients/');
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#0f766e', borderBottom: '2px solid #ccfbf1', paddingBottom: '10px' }}>
        🩺 ระบบจัดการข้อมูลผู้ป่วย
      </h2>

      {/* เรียกใช้งานชิ้นที่ 1 (ฟอร์ม) และส่งฟังก์ชัน fetch ไปให้มันเรียกใช้ตอนบันทึกเสร็จ */}
      <PatientForm onAddSuccess={fetchPatients} />

      {/* เรียกใช้งานชิ้นที่ 2 (ตาราง) และส่งข้อมูล patients ไปให้มันวาดหน้าจอ */}
      <PatientTable patients={patients} />

    </div>
  );
}
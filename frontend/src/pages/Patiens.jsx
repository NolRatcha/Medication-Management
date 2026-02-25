import React, { useState, useEffect } from 'react';
import PatientForm from '../components/Patient/PatientForm';
import PatientTable from '../components/Patient/PatientTable';
import PatientHistoryForm from '../components/Patient/PatientHistForm';

export default function PatientPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null); 

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const response = await fetch('http://localhost:8000/api/v1/patients/');
    if (response.ok) {
      const data = await response.json();
      setPatients(data);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#0f766e', borderBottom: '2px solid #ccfbf1', paddingBottom: '10px' }}>
        🩺 ระบบจัดการข้อมูลผู้ป่วย
      </h2>

      <PatientForm onAddSuccess={fetchPatients} />

      {selectedPatient && (
        <PatientHistoryForm 
          patient={selectedPatient} 
          onSuccess={() => setSelectedPatient(null)}
          onCancel={() => setSelectedPatient(null)}
        />
      )}

      <PatientTable 
        patients={patients} 
        onSelectForHistory={(patient) => setSelectedPatient(patient)} 
      />
    </div>
  );
}
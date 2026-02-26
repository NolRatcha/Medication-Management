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
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ borderBottom: '2px solid #1e3a8a', paddingBottom: '15px', marginBottom: '25px' }}>
        <h2 style={{ color: '#1e3a8a', margin: 0, fontSize: '24px' }}>
          Patient Management System
        </h2>
      </div>

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
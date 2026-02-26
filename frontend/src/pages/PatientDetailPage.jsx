import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TreatmentSection from '../components/Patient/TreatmentSection';

export default function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

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

  const handleEditClick = () => {
    setEditFormData({
      history: history.history || '',
      diagnosis: history.diagnosis || '',
      medication: history.medication || '',
      allergies: history.allergies || ''
    });
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

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
        showMessage('Medical history updated successfully.', 'success');
        setIsEditing(false);
        fetchPatientHistory();
      } else {
        showMessage('Error saving changes. Please try again.', 'error');
      }
    } catch (error) {
      showMessage('Unable to connect to the server.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading patient data...</div>;
  if (!patient) return <div style={{ padding: '20px', textAlign: 'center', color: '#dc2626' }}>Patient record not found.</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <Link to="/patients" style={styles.backBtn}>
        &larr; Back to Patient Directory
      </Link>
      
      {message.text && (
        <div style={{
            ...styles.notification,
            backgroundColor: message.type === 'success' ? '#edf7ed' : '#fdeded',
            color: message.type === 'success' ? '#1e4620' : '#5f2120',
            border: `1px solid ${message.type === 'success' ? '#c8e6c9' : '#ffcdd2'}`
        }}>
            {message.text}
        </div>
      )}

      <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', fontSize: '22px' }}>
        Patient Profile: {patient.name}
      </h2>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>General Information</h3>
          <table style={styles.infoTable}>
            <tbody>
              <tr><td style={styles.infoLabel}>Patient ID (HN)</td><td>{patient.p_id}</td></tr>
              <tr><td style={styles.infoLabel}>Full Name</td><td>{patient.name}</td></tr>
              <tr><td style={styles.infoLabel}>Age</td><td>{patient.age} years</td></tr>
              <tr><td style={styles.infoLabel}>Gender</td><td>{patient.gender}</td></tr>
            </tbody>
          </table>
        </div>

        <div style={{ ...styles.card, flex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={styles.sectionTitle}>Medical History</h3>
            {history && !isEditing && (
              <button onClick={handleEditClick} style={styles.editBtn}>
                Edit History
              </button>
            )}
          </div>

          {!history ? (
            <div style={styles.emptyBox}>
              No medical history recorded for this patient.<br/>
              Please return to the directory to add a new record.
            </div>
          ) : isEditing ? (
            <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={styles.label}>Clinical History</label>
                <textarea name="history" value={editFormData.history} onChange={handleInputChange} style={styles.textarea} />
              </div>
              <div>
                <label style={styles.label}>Diagnosis</label>
                <input type="text" name="diagnosis" value={editFormData.diagnosis} onChange={handleInputChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Current Medication</label>
                <input type="text" name="medication" value={editFormData.medication} onChange={handleInputChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Allergies</label>
                <input type="text" name="allergies" value={editFormData.allergies} onChange={handleInputChange} style={styles.input} />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" disabled={saving} style={styles.saveBtn}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={styles.historyBox}>
                <div style={styles.historyLabel}>Clinical History</div>
                <div style={styles.historyValue}>{history.history || '-'}</div>
              </div>
              <div style={styles.historyBox}>
                <div style={styles.historyLabel}>Diagnosis</div>
                <div style={styles.historyValue}>{history.diagnosis || '-'}</div>
              </div>
              <div style={styles.historyBox}>
                <div style={styles.historyLabel}>Current Medication</div>
                <div style={styles.historyValue}>{history.medication || '-'}</div>
              </div>
              <div style={{ ...styles.historyBox, borderLeft: '4px solid #d32f2f' }}>
                <div style={{ ...styles.historyLabel, color: '#d32f2f' }}>Allergies</div>
                <div style={styles.historyValue}>{history.allergies || 'None'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <TreatmentSection patient={patient} />
    </div>
  );
}

const styles = {
  card: { flex: 1, minWidth: '300px', background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  backBtn: { display: 'inline-block', marginBottom: '20px', textDecoration: 'none', color: '#475569', fontSize: '14px', fontWeight: 'bold' },
  sectionTitle: { margin: '0 0 15px 0', color: '#334155', fontSize: '18px', fontWeight: 'bold' },
  infoTable: { width: '100%', borderCollapse: 'collapse' },
  infoLabel: { fontWeight: 'bold', color: '#64748b', padding: '8px 0', width: '40%' },
  historyBox: { background: '#f8fafc', padding: '15px', borderRadius: '4px', borderLeft: '4px solid #1e3a8a' },
  historyLabel: { fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', marginBottom: '5px' },
  historyValue: { fontSize: '15px', color: '#1e293b', whiteSpace: 'pre-wrap' },
  emptyBox: { padding: '30px', background: '#f1f5f9', borderRadius: '4px', textAlign: 'center', color: '#64748b', fontSize: '14px', lineHeight: '1.6' },
  editBtn: { padding: '8px 16px', background: '#fff', color: '#1e3a8a', border: '1px solid #1e3a8a', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: 'all 0.2s' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', display: 'block' },
  input: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' },
  textarea: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '100px', fontFamily: 'inherit', boxSizing: 'border-box', fontSize: '14px' },
  saveBtn: { padding: '10px 20px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  cancelBtn: { padding: '10px 20px', background: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  notification: { padding: '12px 16px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }
};
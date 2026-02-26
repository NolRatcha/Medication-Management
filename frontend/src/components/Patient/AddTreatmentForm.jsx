import React, { useState } from 'react';

export default function AddTreatmentForm({ onAddTreatment }) {
  const [medId, setMedId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!medId || !amount || !date) return alert("Please fill in all fields.");

    onAddTreatment({
      med_id: parseInt(medId),
      amount: parseInt(amount),
      date: date
    });

    setMedId('');
    setAmount('');
    setDate('');
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h4 style={styles.formTitle}>Add New Treatment</h4>
      <div style={styles.inputGroup}>
        <div style={styles.inputWrapper}>
          <label style={styles.label}>Medication ID</label>
          <input 
            type="number" 
            placeholder="e.g., 101" 
            value={medId} 
            onChange={(e) => setMedId(e.target.value)} 
            style={styles.input}
          />
        </div>
        <div style={styles.inputWrapper}>
          <label style={styles.label}>Quantity</label>
          <input 
            type="number" 
            placeholder="e.g., 2" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            style={styles.input}
          />
        </div>
        <div style={styles.inputWrapper}>
          <label style={styles.label}>Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            style={styles.input}
          />
        </div>
        <div style={styles.buttonWrapper}>
          <button type="submit" style={styles.button}>Save Record</button>
        </div>
      </div>
    </form>
  );
}

const styles = {
  form: { 
    padding: '20px', 
    border: '1px solid #cbd5e1', 
    borderRadius: '6px', 
    marginBottom: '25px', 
    backgroundColor: '#f8fafc', 
    borderLeft: '4px solid #1e3a8a' 
  },
  formTitle: { margin: '0 0 15px 0', color: '#334155', fontSize: '16px' },
  inputGroup: { display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' },
  inputWrapper: { flex: '1 1 200px', display: 'flex', flexDirection: 'column' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  buttonWrapper: { flex: '0 0 auto' },
  button: { 
    padding: '10px 20px', 
    backgroundColor: '#1e3a8a', 
    color: '#ffffff', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    fontSize: '14px', 
    height: '39px',
    transition: 'background-color 0.2s'
  }
};
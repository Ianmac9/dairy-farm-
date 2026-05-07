import React, { useState } from 'react';
import API from '../services/api';

function CowForm({ cow, onClose, onSave }) {
  const [form, setForm] = useState({
    cow_id: cow?.cow_id || '',
    name: cow?.name || '',
    breed: cow?.breed || '',
    color: cow?.color || '',
    date_of_birth: cow?.date_of_birth ? cow.date_of_birth.split('T')[0] : '',
    health_status: cow?.health_status || 'Healthy',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (cow) {
        await API.put(`/cows/${cow.id}`, form);
      } else {
        await API.post('/cows', form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>{cow ? 'Edit Cow' : 'Add New Cow'}</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input style={styles.input} name="cow_id" placeholder="Cow ID (e.g. COW-001)" value={form.cow_id} onChange={handleChange} required />
          <input style={styles.input} name="name" placeholder="Name" value={form.name} onChange={handleChange} />
          <input style={styles.input} name="breed" placeholder="Breed" value={form.breed} onChange={handleChange} />
          <input style={styles.input} name="color" placeholder="Color" value={form.color} onChange={handleChange} />
          <input style={styles.input} name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
          <select style={styles.input} name="health_status" value={form.health_status} onChange={handleChange}>
            <option>Healthy</option>
            <option>Sick</option>
            <option>Pregnant</option>
            <option>Recovering</option>
            <option>Dry</option>
          </select>
          <button style={styles.button} type="submit">{cow ? 'Save Changes' : 'Add Cow'}</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', width: '400px', maxWidth: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { color: '#2d6a2d', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' },
  input: { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', backgroundColor: '#2d6a2d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  error: { color: 'red', marginBottom: '12px', textAlign: 'center' },
};

export default CowForm;
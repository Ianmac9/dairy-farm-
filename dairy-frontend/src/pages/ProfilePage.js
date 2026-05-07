import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function ProfilePage({ farmer, onLogout, onUpdate }) {  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: farmer.name || '',
    farm_name: farmer.farm_name || '',
    phone: farmer.phone || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await API.put('/auth/profile', form);
      onUpdate(res.data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Back</button>
        <h1 style={styles.title}>👤 My Profile</h1>
        <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Farm Details</h2>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Your Name</label>
          <input style={styles.input} name="name" value={form.name} onChange={handleChange} />

          <label style={styles.label}>Farm Name</label>
          <input style={styles.input} name="farm_name" value={form.farm_name} onChange={handleChange} />

          <label style={styles.label}>Phone Number</label>
          <input style={styles.input} name="phone" placeholder="+254712345678" value={form.phone} onChange={handleChange} />
          <p style={styles.hint}>📱 This number will receive SMS notifications about your herd.</p>

          <button style={styles.button} type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '500px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  backBtn: { padding: '8px 16px', backgroundColor: '#f0f4f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  title: { color: '#2d6a2d', margin: 0 },
  logoutBtn: { padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardTitle: { color: '#2d6a2d', marginTop: 0, marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', marginTop: '12px' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  hint: { fontSize: '12px', color: '#999', marginTop: '4px' },
  button: { width: '100%', padding: '12px', backgroundColor: '#2d6a2d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', marginTop: '16px' },
  error: { color: 'red', marginBottom: '12px' },
  success: { color: '#2d6a2d', marginBottom: '12px' },
};

export default ProfilePage;
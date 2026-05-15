import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function ProfilePage({ farmer, onLogout, onUpdate }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: farmer.name || '',
    farm_name: farmer.farm_name || '',
    phone: farmer.phone || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div style={styles.page}>
      {sidebarOpen && <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      <div style={{ ...styles.sidebar, left: sidebarOpen ? '0' : '-260px' }}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>DairyFarm</h2>
          <button style={styles.closeBtn} onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <div style={styles.farmInfo}>
          <p style={styles.farmName}>{farmer.farm_name || 'My Farm'}</p>
          <p style={styles.farmerName}>{farmer.name}</p>
        </div>
        <nav style={styles.nav}>
          {[
            { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
            { key: 'notifications', label: 'Notifications', path: '/notifications' },
            { key: 'profile', label: 'Profile', path: '/profile' },
          ].map(item => (
            <div key={item.key} style={styles.navItem} onClick={() => navigate(item.path)}>{item.label}</div>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
      </div>

      <div style={styles.main}>
        <div style={styles.topBar}>
          <button style={styles.menuBtn} onClick={() => setSidebarOpen(true)}>☰ Menu</button>
          <h2 style={styles.topBarTitle}>My Profile</h2>
        </div>

        {/* Profile Header */}
        <div style={styles.profileHeader}>
          <div style={styles.avatar}>{farmer.name?.charAt(0).toUpperCase()}</div>
          <div>
            <h2 style={styles.profileName}>{farmer.name}</h2>
            <p style={styles.profileFarm}>{farmer.farm_name || 'No farm name set'}</p>
            <p style={styles.profileEmail}>{farmer.email}</p>
          </div>
        </div>

        {/* Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Update Profile</h2>

          {error && <div style={styles.errorBox}>{error}</div>}
          {success && <div style={styles.successBox}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Full Name</label>
                <input style={styles.input} name="name" value={form.name} onChange={handleChange} />
              </div>
              <div>
                <label style={styles.label}>Farm Name</label>
                <input style={styles.input} name="farm_name" value={form.farm_name} onChange={handleChange} />
              </div>
            </div>

            <label style={styles.label}>Phone Number</label>
            <input style={styles.input} name="phone" placeholder="+254712345678" value={form.phone} onChange={handleChange} />
            <p style={styles.hint}>📱 This number receives SMS notifications about your herd.</p>

            <button style={styles.button} type="submit">Save Changes</button>
          </form>
        </div>

        {/* Danger Zone */}
        <div style={styles.dangerCard}>
          <h2 style={styles.dangerTitle}>Account</h2>
          <p style={styles.dangerText}>Sign out of your DairyFarm account.</p>
          <button style={styles.logoutBtnMain} onClick={onLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f0f6ff', fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 99 },
  sidebar: { position: 'fixed', top: 0, bottom: 0, width: '240px', backgroundColor: '#0f3460', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '24px 0', transition: 'left 0.3s ease', boxShadow: '4px 0 20px rgba(0,0,0,0.2)' },
  sidebarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  sidebarTitle: { color: '#63b3ed', margin: 0, fontSize: '20px', fontWeight: '700' },
  closeBtn: { background: 'none', border: 'none', color: '#63b3ed', fontSize: '18px', cursor: 'pointer' },
  farmInfo: { padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  farmName: { color: '#bee3f8', margin: '0 0 4px 0', fontWeight: '600', fontSize: '14px' },
  farmerName: { color: '#63b3ed', margin: 0, fontSize: '13px' },
  nav: { flex: 1, padding: '16px 0' },
  navItem: { padding: '12px 24px', color: '#90cdf4', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' },
  logoutBtn: { margin: '0 24px 24px', padding: '10px', backgroundColor: 'rgba(231,76,60,0.15)', color: '#fc8181', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  main: { padding: '24px 32px', maxWidth: '600px' },
  topBar: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' },
  menuBtn: { padding: '8px 16px', backgroundColor: '#1a6fc4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  topBarTitle: { color: '#0f3460', margin: 0, fontSize: '22px', fontWeight: '700' },
  profileHeader: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 16px rgba(15,52,96,0.08)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #dbeafe' },
  avatar: { width: '72px', height: '72px', borderRadius: '14px', background: 'linear-gradient(135deg, #1a6fc4, #1e90ff)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800' },
  profileName: { color: '#0f3460', margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700' },
  profileFarm: { color: '#1a6fc4', margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' },
  profileEmail: { color: '#4a7fa5', margin: 0, fontSize: '13px' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 16px rgba(15,52,96,0.08)', marginBottom: '20px', border: '1px solid #dbeafe' },
  cardTitle: { color: '#0f3460', marginTop: 0, marginBottom: '20px', fontSize: '17px', fontWeight: '600' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  label: { display: 'block', fontSize: '12px', color: '#4a7fa5', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '12px' },
  input: { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #bfdbfe', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8fbff', outline: 'none', fontFamily: 'inherit', color: '#0f3460' },
  hint: { fontSize: '12px', color: '#4a7fa5', marginTop: '6px', marginBottom: '16px' },
  button: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #1a6fc4, #1e90ff)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', cursor: 'pointer', fontWeight: '600', marginTop: '8px' },
  dangerCard: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 16px rgba(15,52,96,0.08)', border: '1px solid #fee2e2' },
  dangerTitle: { color: '#c0392b', marginTop: 0, marginBottom: '8px', fontSize: '17px', fontWeight: '600' },
  dangerText: { color: '#4a7fa5', marginBottom: '16px', fontSize: '14px' },
  logoutBtnMain: { padding: '10px 24px', backgroundColor: 'rgba(231,76,60,0.08)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  errorBox: { backgroundColor: '#fde8e8', color: '#c0392b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  successBox: { backgroundColor: '#e0f2fe', color: '#0f3460', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' },
};

export default ProfilePage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import CowForm from '../components/CowForm';

function Dashboard({ farmer, onLogout }) {
  const [cows, setCows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [notifCount, setNotifCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCows();
    fetchNotifCount();
  }, []);

  const fetchCows = async () => {
    try {
      const res = await API.get('/cows');
      setCows(res.data);
    } catch (err) {
      setError('Failed to fetch cows');
    }
  };

  const fetchNotifCount = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifCount(res.data.length);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this cow?')) return;
    try {
      await API.delete(`/cows/${id}`);
      fetchCows();
    } catch (err) {
      setError('Failed to delete cow');
    }
  };

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={styles.sidebarIcon}>🐄</span>
          <h2 style={styles.sidebarTitle}>DairyFarm</h2>
        </div>
        <div style={styles.farmInfo}>
          <p style={styles.farmName}>{farmer.farm_name || 'My Farm'}</p>
          <p style={styles.farmerName}>👤 {farmer.name}</p>
        </div>
        <nav style={styles.nav}>
          <div style={{ ...styles.navItem, ...styles.navItemActive }}>🏠 Dashboard</div>
          <div style={styles.navItem} onClick={() => navigate('/notifications')}>
            🔔 Notifications {notifCount > 0 && <span style={styles.badge}>{notifCount}</span>}
          </div>
          <div style={styles.navItem} onClick={() => navigate('/profile')}>👤 Profile</div>
        </nav>
        <button style={styles.logoutBtn} onClick={onLogout}>🚪 Logout</button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Herd</h1>
            <p style={styles.subtitle}>Manage and track all your cows</p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowForm(true)}>+ Add Cow</button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Stats */}
        <div style={styles.statsBar}>
          <div style={styles.stat}>
            <span style={styles.statNumber}>{cows.length}</span>
            <span style={styles.statLabel}>Total Cows</span>
            <span style={styles.statIcon}>🐄</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNumber}>{cows.filter(c => c.health_status === 'Healthy').length}</span>
            <span style={styles.statLabel}>Healthy</span>
            <span style={styles.statIcon}>💚</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNumber}>{cows.filter(c => c.health_status === 'Sick').length}</span>
            <span style={styles.statLabel}>Sick</span>
            <span style={styles.statIcon}>🔴</span>
          </div>
        </div>

        {/* Cow Grid */}
        <div style={styles.cowGrid}>
          {cows.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>🐄</p>
              <p style={styles.emptyText}>No cows yet. Add your first cow!</p>
            </div>
          )}
          {cows.map(cow => (
            <div key={cow.id} style={styles.cowCard} onClick={() => navigate(`/cow/${cow.id}`)}>
              <div style={styles.cowCardTop}>
                <span style={styles.cowEmoji}>🐄</span>
                <button style={styles.deleteBtn} onClick={(e) => handleDelete(cow.id, e)}>🗑</button>
              </div>
              <h3 style={styles.cowId}>{cow.cow_id}</h3>
              <p style={styles.cowName}>{cow.name || 'Unnamed'}</p>
              {cow.breed && <p style={styles.cowBreed}>{cow.breed}</p>}
              <div style={styles.cowCardBottom}>
                <span style={{ ...styles.statusBadge, backgroundColor: getBadgeColor(cow.health_status) }}>
                  {cow.health_status}
                </span>
                <span style={styles.viewBtn}>View →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <CowForm
          cow={null}
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); fetchCows(); }}
        />
      )}
    </div>
  );
}

function getBadgeColor(status) {
  const colors = {
    Healthy: '#2d6a2d',
    Sick: '#c0392b',
    Pregnant: '#8e44ad',
    Recovering: '#e67e22',
    Dry: '#7f8c8d',
  };
  return colors[status] || '#2d6a2d';
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', backgroundColor: '#f5f0e8', fontFamily: 'Georgia, serif' },
  sidebar: { width: '240px', backgroundColor: '#3d2b1f', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', top: 0, bottom: 0, left: 0 },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  sidebarIcon: { fontSize: '28px' },
  sidebarTitle: { color: '#d4a855', margin: 0, fontSize: '20px', fontWeight: 'bold' },
  farmInfo: { padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  farmName: { color: '#e8d5b7', margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px' },
  farmerName: { color: '#a08060', margin: 0, fontSize: '13px' },
  nav: { flex: 1, padding: '16px 0' },
  navItem: { padding: '12px 24px', color: '#c4a882', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' },
  navItemActive: { backgroundColor: 'rgba(212,168,85,0.15)', color: '#d4a855', borderRight: '3px solid #d4a855' },
  badge: { backgroundColor: '#e67e22', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', marginLeft: 'auto' },
  logoutBtn: { margin: '0 24px 24px', padding: '10px', backgroundColor: 'rgba(231,76,60,0.15)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  main: { flex: 1, marginLeft: '240px', padding: '32px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  title: { color: '#3d2b1f', margin: '0 0 4px 0', fontSize: '28px' },
  subtitle: { color: '#8b6f47', margin: 0, fontSize: '14px' },
  addBtn: { padding: '12px 24px', backgroundColor: '#3d2b1f', color: '#d4a855', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' },
  statsBar: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' },
  stat: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(61,43,31,0.08)', position: 'relative', overflow: 'hidden' },
  statNumber: { display: 'block', fontSize: '32px', fontWeight: 'bold', color: '#3d2b1f' },
  statLabel: { display: 'block', color: '#8b6f47', fontSize: '13px', marginTop: '4px' },
  statIcon: { position: 'absolute', right: '16px', top: '16px', fontSize: '24px', opacity: 0.3 },
  cowGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
  cowCard: { backgroundColor: 'white', borderRadius: '14px', padding: '20px', cursor: 'pointer', boxShadow: '0 2px 12px rgba(61,43,31,0.08)', transition: 'transform 0.2s, box-shadow 0.2s' },
  cowCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  cowEmoji: { fontSize: '32px' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: 0.5 },
  cowId: { color: '#3d2b1f', margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' },
  cowName: { color: '#8b6f47', margin: '0 0 4px 0', fontSize: '13px' },
  cowBreed: { color: '#a08060', margin: '0 0 12px 0', fontSize: '12px' },
  cowCardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' },
  statusBadge: { padding: '3px 10px', borderRadius: '20px', color: 'white', fontSize: '11px', fontWeight: 'bold' },
  viewBtn: { color: '#d4a855', fontSize: '12px', fontWeight: 'bold' },
  emptyState: { gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' },
  emptyIcon: { fontSize: '64px', margin: '0 0 16px 0' },
  emptyText: { color: '#8b6f47', fontSize: '16px' },
  error: { color: 'red', marginBottom: '12px' },
};

export default Dashboard;
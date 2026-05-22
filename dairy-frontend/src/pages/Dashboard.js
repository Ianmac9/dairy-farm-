import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import CowForm from '../components/CowForm';

function Dashboard({ farmer, onLogout }) {
  const [cows, setCows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchCow();
    fetchRecords();
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
      setNotifications(res.data);
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

  const getPriorityColor = (priority) => ({
    urgent: '#c0392b', high: '#e67e22', medium: '#1a6fc4', low: '#0e8c6e',
  }[priority] || '#1a6fc4');

  return (
    <div style={styles.page}>
      {sidebarOpen && <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
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
            { key: 'notifications', label: `Notifications ${notifCount > 0 ? `(${notifCount})` : ''}`, path: '/notifications' },
            { key: 'profile', label: 'Profile', path: '/profile' },
          ].map(item => (
            <div key={item.key} style={styles.navItem} onClick={() => navigate(item.path)}>
              {item.label}
            </div>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.topBar}>
          <button style={styles.menuBtn} onClick={() => setSidebarOpen(true)}>☰ Menu</button>
          <h2 style={styles.topBarTitle}>My Herd</h2>
          <button style={styles.addBtn} onClick={() => setShowForm(true)}>+ Add Cow</button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Notification Alerts */}
        {notifications.length > 0 && (
          <div style={styles.notifContainer}>
            <div style={styles.notifHeader}>
              <span style={styles.notifHeaderText}>🔔 Alerts ({notifications.length})</span>
              <span style={styles.notifViewAll} onClick={() => navigate('/notifications')}>View all →</span>
            </div>
            {notifications.slice(0, 3).map((notif, index) => (
              <div
                key={index}
                style={{ ...styles.notifAlert, borderLeft: `4px solid ${getPriorityColor(notif.priority)}` }}
                onClick={() => navigate(`/cow/${notif.cow_id}/breeding`)}
              >
                <div>
                  <span style={styles.notifAlertMsg}>{notif.message}</span>
                  <span style={styles.notifAlertDetail}>{notif.detail}</span>
                </div>
                <span style={{ ...styles.notifBadge, backgroundColor: getPriorityColor(notif.priority) }}>
                  {notif.priority.toUpperCase()}
                </span>
              </div>
            ))}
            {notifications.length > 3 && (
              <p style={styles.moreNotifs} onClick={() => navigate('/notifications')}>
                + {notifications.length - 3} more notifications →
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        <div style={styles.statsBar}>
          <div style={{ ...styles.stat, background: 'linear-gradient(135deg, #1a6fc4, #1e90ff)' }}>
            <span style={styles.statNumber}>{cows.length}</span>
            <span style={styles.statLabel}>Total Cows</span>
          </div>
          <div style={{ ...styles.stat, background: 'linear-gradient(135deg, #0e8c6e, #20c997)' }}>
            <span style={styles.statNumber}>{cows.filter(c => c.health_status === 'Healthy').length}</span>
            <span style={styles.statLabel}>Healthy</span>
          </div>
          <div style={{ ...styles.stat, background: 'linear-gradient(135deg, #c0392b, #e74c3c)' }}>
            <span style={styles.statNumber}>{cows.filter(c => c.health_status === 'Sick').length}</span>
            <span style={styles.statLabel}>Sick</span>
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
                <div style={styles.cowAvatar}>{cow.cow_id.charAt(0)}</div>
                <button style={styles.deleteBtn} onClick={(e) => handleDelete(cow.id, e)}>✕</button>
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
    Healthy: '#0e8c6e', Sick: '#c0392b', Pregnant: '#7c3aed', Recovering: '#e67e22', Dry: '#7f8c8d',
  };
  return colors[status] || '#0e8c6e';
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
  main: { padding: '24px 32px' },
  topBar: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' },
  menuBtn: { padding: '8px 16px', backgroundColor: '#1a6fc4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  topBarTitle: { flex: 1, color: '#0f3460', margin: 0, fontSize: '22px', fontWeight: '700' },
  addBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #1a6fc4, #1e90ff)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  notifContainer: { marginBottom: '24px', backgroundColor: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 12px rgba(15,52,96,0.08)', border: '1px solid #dbeafe' },
  notifHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  notifHeaderText: { fontWeight: '700', color: '#0f3460', fontSize: '15px' },
  notifViewAll: { color: '#1a6fc4', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  notifAlert: { padding: '12px 14px', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer', backgroundColor: '#f8fbff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  notifAlertMsg: { display: 'block', fontWeight: '600', color: '#0f3460', fontSize: '14px', marginBottom: '2px' },
  notifAlertDetail: { display: 'block', color: '#4a7fa5', fontSize: '12px' },
  notifBadge: { padding: '3px 8px', borderRadius: '20px', color: 'white', fontSize: '10px', fontWeight: '700', whiteSpace: 'nowrap' },
  moreNotifs: { color: '#1a6fc4', fontWeight: '600', fontSize: '13px', cursor: 'pointer', margin: '8px 0 0 0', textAlign: 'right' },
  statsBar: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' },
  stat: { padding: '20px 24px', borderRadius: '14px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
  statNumber: { display: 'block', fontSize: '32px', fontWeight: '700', color: 'white' },
  statLabel: { display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '4px', fontWeight: '500' },
  cowGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
  cowCard: { backgroundColor: 'white', borderRadius: '14px', padding: '20px', cursor: 'pointer', boxShadow: '0 2px 12px rgba(15,52,96,0.08)', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid #dbeafe' },
  cowCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  cowAvatar: { width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#0f3460', color: '#63b3ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#cbd5e0', fontWeight: '600' },
  cowId: { color: '#0f3460', margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700' },
  cowName: { color: '#4a7fa5', margin: '0 0 4px 0', fontSize: '13px' },
  cowBreed: { color: '#90cdf4', margin: '0 0 12px 0', fontSize: '12px' },
  cowCardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' },
  statusBadge: { padding: '3px 10px', borderRadius: '20px', color: 'white', fontSize: '11px', fontWeight: '600' },
  viewBtn: { color: '#1a6fc4', fontSize: '12px', fontWeight: '700' },
  emptyState: { gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' },
  emptyIcon: { fontSize: '64px', margin: '0 0 16px 0' },
  emptyText: { color: '#4a7fa5', fontSize: '16px' },
  error: { color: 'red', marginBottom: '12px' },
};

export default Dashboard;

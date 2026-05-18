import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function NotificationsPage({ farmer }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

 // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCow();
    fetchRecords();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      setError('Failed to fetch notifications');
    }
    setLoading(false);
  };

  const getPriorityColor = (priority) => ({
    urgent: '#c0392b', high: '#e67e22', medium: '#1a6fc4', low: '#0e8c6e',
  }[priority] || '#777');

  const getPriorityBg = (priority) => ({
    urgent: '#fde8e8', high: '#fff3e0', medium: '#e0f2fe', low: '#e8f5e9',
  }[priority] || '#f5f5f5');

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
        <button style={styles.logoutBtn} onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('farmer'); window.location.href = '/'; }}>Logout</button>
      </div>

      <div style={styles.main}>
        <div style={styles.topBar}>
          <button style={styles.menuBtn} onClick={() => setSidebarOpen(true)}>☰ Menu</button>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <h2 style={styles.topBarTitle}>Notifications</h2>
          <button style={styles.refreshBtn} onClick={fetchNotifications}>↻ Refresh</button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {loading ? (
          <div style={styles.loading}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyIcon}>✅</p>
            <p style={styles.emptyText}>All clear!</p>
            <p style={styles.emptySubtext}>No notifications right now. All your cows are on track.</p>
            <button style={styles.dashboardBtn} onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          </div>
        ) : (
          <div>
            <p style={styles.count}>{notifications.length} notification{notifications.length > 1 ? 's' : ''}</p>
            {notifications.map((notif, index) => (
              <div
                key={index}
                style={{ ...styles.notifCard, backgroundColor: getPriorityBg(notif.priority), borderLeft: `4px solid ${getPriorityColor(notif.priority)}` }}
                onClick={() => navigate(`/cow/${notif.cow_id}/breeding`)}
              >
                <div style={styles.notifHeader}>
                  <span style={styles.notifMessage}>{notif.message}</span>
                  <span style={{ ...styles.priorityBadge, backgroundColor: getPriorityColor(notif.priority) }}>
                    {notif.priority.toUpperCase()}
                  </span>
                </div>
                <p style={styles.notifDetail}>{notif.detail}</p>
                <p style={styles.notifAction}>Tap to view breeding record →</p>
              </div>
            ))}
            <button style={styles.dashboardBtn} onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          </div>
        )}
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
  main: { padding: '24px 32px', maxWidth: '700px' },
  topBar: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' },
  menuBtn: { padding: '8px 16px', backgroundColor: '#1a6fc4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  backBtn: { padding: '8px 16px', backgroundColor: 'white', color: '#0f3460', border: '1.5px solid #dbeafe', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  topBarTitle: { flex: 1, color: '#0f3460', margin: 0, fontSize: '22px', fontWeight: '700' },
  refreshBtn: { padding: '8px 16px', backgroundColor: 'white', color: '#1a6fc4', border: '1.5px solid #1a6fc4', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  count: { color: '#4a7fa5', fontSize: '14px', marginBottom: '16px', fontWeight: '500' },
  notifCard: { borderRadius: '12px', padding: '18px', marginBottom: '12px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  notifHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '12px' },
  notifMessage: { fontWeight: '700', color: '#0f3460', fontSize: '15px' },
  priorityBadge: { padding: '3px 10px', borderRadius: '20px', color: 'white', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' },
  notifDetail: { color: '#4a7fa5', fontSize: '13px', margin: '0 0 8px 0' },
  notifAction: { color: '#1a6fc4', fontSize: '12px', margin: 0, fontWeight: '600' },
  emptyCard: { backgroundColor: 'white', borderRadius: '16px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 2px 16px rgba(15,52,96,0.08)', border: '1px solid #dbeafe' },
  emptyIcon: { fontSize: '56px', margin: '0 0 16px 0' },
  emptyText: { fontSize: '22px', fontWeight: '700', color: '#0f3460', margin: '0 0 8px 0' },
  emptySubtext: { color: '#4a7fa5', margin: '0 0 24px 0', fontSize: '14px' },
  dashboardBtn: { padding: '10px 24px', backgroundColor: '#1a6fc4', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', marginTop: '16px' },
  loading: { textAlign: 'center', marginTop: '60px', color: '#4a7fa5', fontSize: '16px' },
  errorBox: { backgroundColor: '#fde8e8', color: '#c0392b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
};

export default NotificationsPage;
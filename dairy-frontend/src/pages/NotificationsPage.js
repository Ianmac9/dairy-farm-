import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function NotificationsPage({ farmer }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      setError('Failed to fetch notifications');
    }
    setLoading(false);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#c0392b',
      high: '#e67e22',
      medium: '#2980b9',
      low: '#27ae60',
    };
    return colors[priority] || '#777';
  };

  const getPriorityBg = (priority) => {
    const colors = {
      urgent: '#fde8e8',
      high: '#fff3e0',
      medium: '#e8f4fd',
      low: '#e8f5e9',
    };
    return colors[priority] || '#f5f5f5';
  };

  if (loading) return <div style={styles.loading}>Loading notifications...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Back</button>
        <h1 style={styles.title}>🔔 Notifications</h1>
        <button style={styles.refreshBtn} onClick={fetchNotifications}>🔄 Refresh</button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {notifications.length === 0 && (
        <div style={styles.emptyCard}>
          <p style={styles.emptyIcon}>✅</p>
          <p style={styles.emptyText}>No notifications right now!</p>
          <p style={styles.emptySubtext}>All your cows are on track.</p>
        </div>
      )}

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
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '700px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  backBtn: { padding: '8px 16px', backgroundColor: '#f0f4f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  title: { color: '#2d6a2d', margin: 0 },
  refreshBtn: { padding: '8px 16px', backgroundColor: '#2d6a2d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  notifCard: { borderRadius: '10px', padding: '16px', marginBottom: '12px', cursor: 'pointer' },
  notifHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  notifMessage: { fontWeight: 'bold', color: '#333', fontSize: '15px' },
  priorityBadge: { padding: '3px 8px', borderRadius: '20px', color: 'white', fontSize: '11px', fontWeight: 'bold' },
  notifDetail: { color: '#555', fontSize: '13px', margin: '0 0 6px 0' },
  notifAction: { color: '#999', fontSize: '12px', margin: 0 },
  emptyCard: { backgroundColor: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  emptyIcon: { fontSize: '48px', margin: '0 0 12px 0' },
  emptyText: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' },
  emptySubtext: { color: '#777', margin: 0 },
  loading: { textAlign: 'center', marginTop: '100px', color: '#777' },
  error: { color: 'red', marginBottom: '12px' },
};

export default NotificationsPage;
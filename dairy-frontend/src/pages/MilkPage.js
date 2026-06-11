import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

function MilkPage({ farmer }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cow, setCow] = useState(null);
  const [logs, setLogs] = useState([]);
  const [monthly, setMonthly] = useState({ monthly_total: 0, days_recorded: 0 });
  const [todayLog, setTodayLog] = useState({ morning: '', afternoon: '', evening: '' });
  const [activeSession, setActiveSession] = useState(null);
  const [sessionInput, setSessionInput] = useState('');
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCow();
    fetchLogs();
    fetchMonthly();
  }, []);
  const fetchCow = async () => {
    try {
      const res = await API.get(`/cows/${id}`);
      setCow(res.data);
    } catch (err) {
      setError('Failed to fetch cow');
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await API.get(`/milk/cow/${id}`);
      setLogs(res.data);
      const today = res.data.find(l => l.log_date?.split('T')[0] === selectedDate);
      if (today) {
        setTodayLog({
          morning: today.morning || '',
          afternoon: today.afternoon || '',
          evening: today.evening || '',
        });
      }
    } catch (err) {
      setError('Failed to fetch milk logs');
    }
  };

  const fetchMonthly = async () => {
    try {
      const res = await API.get(`/milk/cow/${id}/monthly?month=${currentMonth}&year=${currentYear}`);
      setMonthly({
        monthly_total: parseFloat(res.data.monthly_total) || 0,
        days_recorded: parseInt(res.data.days_recorded) || 0,
      });
    } catch (err) {
      setError('Failed to fetch monthly totals');
    }
  };

  const handleSessionSave = async () => {
    if (!sessionInput && sessionInput !== '0') {
      setError('Please enter the litres produced');
      return;
    }
    setError('');
    setSuccess('');
    const updated = { ...todayLog, [activeSession]: sessionInput };
    try {
      await API.post('/milk', {
        cow_id: id,
        log_date: selectedDate,
        morning: parseFloat(updated.morning) || 0,
        afternoon: parseFloat(updated.afternoon) || 0,
        evening: parseFloat(updated.evening) || 0,
      });
      setTodayLog(updated);
      setActiveSession(null);
      setSessionInput('');
      setSuccess(`${activeSession.charAt(0).toUpperCase() + activeSession.slice(1)} session saved!`);
      fetchLogs();
      fetchMonthly();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await API.delete(`/milk/${logId}`);
      fetchLogs();
      fetchMonthly();
    } catch (err) {
      setError('Failed to delete record');
    }
  };

  const todayTotal = (parseFloat(todayLog.morning) || 0) + (parseFloat(todayLog.afternoon) || 0) + (parseFloat(todayLog.evening) || 0);
  const dailyAverage = monthly.days_recorded > 0 ? (monthly.monthly_total / monthly.days_recorded).toFixed(1) : '0.0';

  const sessions = [
    { key: 'morning', label: 'Morning', time: '5:00 AM - 8:00 AM', color: '#f59e0b', bg: '#fffbeb' },
    { key: 'afternoon', label: 'Afternoon', time: '12:00 PM - 2:00 PM', color: '#1e90ff', bg: '#eff8ff' },
    { key: 'evening', label: 'Evening', time: '5:00 PM - 7:00 PM', color: '#7c3aed', bg: '#f5f3ff' },
  ];

  if (!cow) return <div style={styles.loading}>Loading...</div>;

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
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbLink} onClick={() => navigate('/dashboard')}>My Herd</span>
            <span style={styles.breadcrumbSep}> › </span>
            <span style={styles.breadcrumbLink} onClick={() => navigate(`/cow/${id}`)}>{cow.cow_id}</span>
            <span style={styles.breadcrumbSep}> › </span>
            <span style={styles.breadcrumbCurrent}>Milk Log</span>
          </div>
        </div>

        <div style={styles.pageHeader}>
          <h1 style={styles.title}>Milk Log</h1>
          <p style={styles.subtitle}>{cow.cow_id} — {cow.name || 'Unnamed'}</p>
        </div>

        {/* Monthly Stats */}
        <div style={styles.statsRow}>
          <div style={{ ...styles.stat, background: 'linear-gradient(135deg, #1a6fc4, #1e90ff)' }}>
            <span style={styles.statNumber}>{monthly.monthly_total.toFixed(1)}L</span>
            <span style={styles.statLabel}>This Month</span>
          </div>
          <div style={{ ...styles.stat, background: 'linear-gradient(135deg, #0e8c6e, #20c997)' }}>
            <span style={styles.statNumber}>{monthly.days_recorded}</span>
            <span style={styles.statLabel}>Days Recorded</span>
          </div>
          <div style={{ ...styles.stat, background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            <span style={styles.statNumber}>{dailyAverage}L</span>
            <span style={styles.statLabel}>Daily Average</span>
          </div>
        </div>

        {/* Today's Sessions */}
        <div style={styles.card}>
          <div style={styles.cardHeaderRow}>
            <h2 style={styles.cardTitle}>Today's Milking</h2>
            <span style={styles.todayDate}>{new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}
          {success && <div style={styles.successBox}>{success}</div>}

          <div style={styles.sessionsGrid}>
            {sessions.map(session => {
              const recorded = todayLog[session.key] !== '' && todayLog[session.key] !== undefined;
              const isActive = activeSession === session.key;
              return (
                <div key={session.key} style={{ ...styles.sessionCard, borderTop: `4px solid ${session.color}`, backgroundColor: recorded ? session.bg : 'white' }}>
                  <div style={styles.sessionTop}>
                    <div>
                      <p style={{ ...styles.sessionLabel, color: session.color }}>{session.label}</p>
                      <p style={styles.sessionTime}>{session.time}</p>
                    </div>
                    {recorded && (
                      <div style={{ ...styles.sessionValue, color: session.color }}>
                        {parseFloat(todayLog[session.key]).toFixed(1)}L
                      </div>
                    )}
                  </div>

                  {isActive ? (
                    <div style={styles.sessionInputArea}>
                      <input
                        style={styles.sessionInput}
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        value={sessionInput}
                        onChange={(e) => setSessionInput(e.target.value)}
                        autoFocus
                      />
                      <div style={styles.sessionBtns}>
                        <button style={{ ...styles.saveSessionBtn, backgroundColor: session.color }} onClick={handleSessionSave}>Save</button>
                        <button style={styles.cancelSessionBtn} onClick={() => { setActiveSession(null); setSessionInput(''); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      style={{ ...styles.recordBtn, borderColor: session.color, color: session.color }}
                      onClick={() => {
                        setActiveSession(session.key);
                        setSessionInput(todayLog[session.key] || '');
                        setSuccess('');
                        setError('');
                      }}
                    >
                      {recorded ? 'Edit' : 'Record'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Daily Total */}
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Today's Total</span>
            <span style={styles.totalValue}>{todayTotal.toFixed(1)} L</span>
          </div>
        </div>

        {/* History */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>History</h2>
          {logs.length === 0 && <p style={styles.empty}>No records yet.</p>}
          <table style={styles.table}>
            {logs.length > 0 && (
              <thead>
                <tr style={{ backgroundColor: '#f0f7ff' }}>
                  <th style={styles.th}>Date</th>
                  <th style={{ ...styles.th, color: '#f59e0b' }}>Morning</th>
                  <th style={{ ...styles.th, color: '#1e90ff' }}>Afternoon</th>
                  <th style={{ ...styles.th, color: '#7c3aed' }}>Evening</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
            )}
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={styles.tr}>
                  <td style={styles.td}>{new Date(log.log_date).toLocaleDateString()}</td>
                  <td style={styles.td}>{parseFloat(log.morning).toFixed(1)}L</td>
                  <td style={styles.td}>{parseFloat(log.afternoon).toFixed(1)}L</td>
                  <td style={styles.td}>{parseFloat(log.evening).toFixed(1)}L</td>
                  <td style={{ ...styles.td, fontWeight: '700', color: '#1a6fc4' }}>{parseFloat(log.total).toFixed(1)}L</td>
                  <td style={styles.td}>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(log.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  navItem: { padding: '12px 24px', color: '#90cdf4', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  logoutBtn: { margin: '0 24px 24px', padding: '10px', backgroundColor: 'rgba(231,76,60,0.15)', color: '#fc8181', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  main: { padding: '24px 32px' },
  topBar: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  menuBtn: { padding: '8px 16px', backgroundColor: '#1a6fc4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  breadcrumb: { fontSize: '14px', fontWeight: '500' },
  breadcrumbLink: { color: '#1a6fc4', cursor: 'pointer' },
  breadcrumbSep: { color: '#a0b4c8', margin: '0 8px' },
  breadcrumbCurrent: { color: '#0f3460', fontWeight: '600' },
  pageHeader: { marginBottom: '24px' },
  title: { color: '#0f3460', margin: '0 0 4px 0', fontSize: '28px', fontWeight: '700' },
  subtitle: { color: '#4a7fa5', margin: 0, fontSize: '14px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  stat: { padding: '20px 24px', borderRadius: '14px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
  statNumber: { display: 'block', fontSize: '28px', fontWeight: '700', color: 'white' },
  statLabel: { display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '4px', fontWeight: '500' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 16px rgba(15,52,96,0.08)', marginBottom: '24px', border: '1px solid #dbeafe' },
  cardHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  cardTitle: { color: '#0f3460', margin: 0, fontSize: '17px', fontWeight: '600' },
  todayDate: { color: '#4a7fa5', fontSize: '13px' },
  sessionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' },
  sessionCard: { borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', transition: 'all 0.2s' },
  sessionTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  sessionLabel: { margin: '0 0 4px 0', fontWeight: '700', fontSize: '15px' },
  sessionTime: { color: '#94a3b8', fontSize: '11px', margin: 0 },
  sessionValue: { fontSize: '22px', fontWeight: '800' },
  sessionInputArea: { marginTop: '8px' },
  sessionInput: { width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #bfdbfe', fontSize: '16px', boxSizing: 'border-box', marginBottom: '8px', outline: 'none' },
  sessionBtns: { display: 'flex', gap: '8px' },
  saveSessionBtn: { flex: 1, padding: '8px', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  cancelSessionBtn: { flex: 1, padding: '8px', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  recordBtn: { width: '100%', padding: '8px', backgroundColor: 'white', border: '1.5px solid', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginTop: '4px' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #dbeafe, #ede9fe)', padding: '14px 18px', borderRadius: '10px' },
  totalLabel: { fontWeight: '600', color: '#0f3460', fontSize: '15px' },
  totalValue: { fontSize: '24px', fontWeight: '800', color: '#1a6fc4' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #dbeafe', color: '#4a7fa5', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' },
  tr: { borderBottom: '1px solid #f0f6ff' },
  td: { padding: '12px', fontSize: '14px', color: '#0f3460' },
  deleteBtn: { padding: '5px 12px', backgroundColor: 'rgba(231,76,60,0.08)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  empty: { color: '#4a7fa5', textAlign: 'center', padding: '20px 0' },
  errorBox: { backgroundColor: '#fde8e8', color: '#c0392b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  successBox: { backgroundColor: '#e0f2fe', color: '#0f3460', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' },
  loading: { textAlign: 'center', marginTop: '100px', color: '#4a7fa5', fontSize: '16px' },
};

export default MilkPage;

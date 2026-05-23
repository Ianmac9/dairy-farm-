import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

function MilkPage({ farmer }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cow, setCow] = useState(null);
  const [logs, setLogs] = useState([]);
  const [monthly, setMonthly] = useState({ monthly_total: 0, days_recorded: 0 });
  const [form, setForm] = useState({ morning: '', afternoon: '', evening: '' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

useEffect(() => {
    fetchCow();
    fetchLogs();
    fetchMonthly();
  }, []);
  
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await API.post('/milk', {
        cow_id: id,
        log_date: selectedDate,
        morning: parseFloat(form.morning) || 0,
        afternoon: parseFloat(form.afternoon) || 0,
        evening: parseFloat(form.evening) || 0,
      });
      setSuccess('Milk record saved successfully!');
      setForm({ morning: '', afternoon: '', evening: '' });
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

  const dailyTotal = (parseFloat(form.morning) || 0) + (parseFloat(form.afternoon) || 0) + (parseFloat(form.evening) || 0);
  const dailyAverage = monthly.days_recorded > 0 ? (monthly.monthly_total / monthly.days_recorded).toFixed(1) : '0.0';

  if (!cow) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.page}>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

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
            { key: 'notifications', label: 'Notifications', path: '/notifications' },
            { key: 'profile', label: 'Profile', path: '/profile' },
          ].map(item => (
            <div
              key={item.key}
              style={styles.navItem}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </div>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('farmer'); window.location.href = '/'; }}>Logout</button>
      </div>

      {/* Main */}
      <div style={styles.main}>
        {/* Top Bar */}
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

        {/* Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Record Milk</h2>
          {error && <div style={styles.errorBox}>{error}</div>}
          {success && <div style={styles.successBox}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.dateRow}>
              <label style={styles.label}>Date</label>
              <input
                style={styles.input}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div style={styles.sessionsRow}>
              <div style={styles.session}>
                <label style={{ ...styles.label, color: '#f59e0b' }}>Morning (L)</label>
                <input style={styles.input} name="morning" type="number" step="0.1" min="0" placeholder="0.0" value={form.morning} onChange={handleChange} />
              </div>
              <div style={styles.session}>
                <label style={{ ...styles.label, color: '#1e90ff' }}>Afternoon (L)</label>
                <input style={styles.input} name="afternoon" type="number" step="0.1" min="0" placeholder="0.0" value={form.afternoon} onChange={handleChange} />
              </div>
              <div style={styles.session}>
                <label style={{ ...styles.label, color: '#7c3aed' }}>Evening (L)</label>
                <input style={styles.input} name="evening" type="number" step="0.1" min="0" placeholder="0.0" value={form.evening} onChange={handleChange} />
              </div>
            </div>

            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Daily Total</span>
              <span style={styles.totalValue}>{dailyTotal.toFixed(1)} L</span>
            </div>

            <button style={styles.button} type="submit">Save Record</button>
          </form>
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
  navItem: { padding: '12px 24px', color: '#90cdf4', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' },
  logoutBtn: { margin: '0 24px 24px', padding: '10px', backgroundColor: 'rgba(231,76,60,0.15)', color: '#fc8181', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  main: { padding: '24px 32px' },
  topBar: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  menuBtn: { padding: '8px 16px', backgroundColor: '#1a6fc4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' },
  breadcrumb: { fontSize: '14px', fontWeight: '500' },
  breadcrumbLink: { color: '#1a6fc4', cursor: 'pointer' },
  breadcrumbSep: { color: '#a0b4c8', margin: '0 8px' },
  breadcrumbCurrent: { color: '#0f3460', fontWeight: '600' },
  pageHeader: { marginBottom: '24px' },
  title: { color: '#0f3460', margin: '0 0 4px 0', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px' },
  subtitle: { color: '#4a7fa5', margin: 0, fontSize: '14px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  stat: { padding: '20px 24px', borderRadius: '14px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
  statNumber: { display: 'block', fontSize: '28px', fontWeight: '700', color: 'white', letterSpacing: '-1px' },
  statLabel: { display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '4px', fontWeight: '500' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 16px rgba(15,52,96,0.08)', marginBottom: '24px', border: '1px solid #dbeafe' },
  cardTitle: { color: '#0f3460', marginTop: 0, marginBottom: '20px', fontSize: '17px', fontWeight: '600' },
  dateRow: { marginBottom: '16px' },
  sessionsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' },
  session: {},
  label: { display: 'block', fontSize: '12px', color: '#4a7fa5', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px' },
  input: { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #bfdbfe', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8fbff', outline: 'none', fontFamily: 'inherit', color: '#0f3460' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #dbeafe, #ede9fe)', padding: '14px 18px', borderRadius: '10px', marginBottom: '16px' },
  totalLabel: { fontWeight: '600', color: '#0f3460', fontSize: '15px' },
  totalValue: { fontSize: '22px', fontWeight: '700', color: '#1a6fc4' },
  button: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #1a6fc4, #1e90ff)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', cursor: 'pointer', fontWeight: '600' },
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

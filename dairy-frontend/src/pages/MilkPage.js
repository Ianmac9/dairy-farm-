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

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

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
      setSuccess('Milk record saved!');
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
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(`/cow/${id}`)}>← Back</button>
        <div>
          <h1 style={styles.title}>🥛 Milk Log</h1>
          <p style={styles.subtitle}>{cow.cow_id} — {cow.name || 'Unnamed'}</p>
        </div>
      </div>

      {/* Monthly Stats */}
      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{monthly.monthly_total.toFixed(1)}L</span>
          <span style={styles.statLabel}>This Month</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{monthly.days_recorded}</span>
          <span style={styles.statLabel}>Days Recorded</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{dailyAverage}L</span>
          <span style={styles.statLabel}>Daily Average</span>
        </div>
      </div>

      {/* Add Record Form */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Record Milk</h2>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

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
              <label style={styles.label}>🌅 Morning (L)</label>
              <input
                style={styles.input}
                name="morning"
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                value={form.morning}
                onChange={handleChange}
              />
            </div>
            <div style={styles.session}>
              <label style={styles.label}>☀️ Afternoon (L)</label>
              <input
                style={styles.input}
                name="afternoon"
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                value={form.afternoon}
                onChange={handleChange}
              />
            </div>
            <div style={styles.session}>
              <label style={styles.label}>🌙 Evening (L)</label>
              <input
                style={styles.input}
                name="evening"
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                value={form.evening}
                onChange={handleChange}
              />
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
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Morning</th>
                <th style={styles.th}>Afternoon</th>
                <th style={styles.th}>Evening</th>
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
                <td style={{ ...styles.td, fontWeight: 'bold', color: '#2d6a2d' }}>{parseFloat(log.total).toFixed(1)}L</td>
                <td style={styles.td}>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(log.id)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '800px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  backBtn: { padding: '8px 16px', backgroundColor: '#f0f4f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  title: { color: '#2d6a2d', margin: 0 },
  subtitle: { color: '#777', margin: 0, fontSize: '14px' },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '24px' },
  stat: { flex: 1, backgroundColor: 'white', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' },
  statNumber: { display: 'block', fontSize: '24px', fontWeight: 'bold', color: '#2d6a2d' },
  statLabel: { fontSize: '12px', color: '#777' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' },
  cardTitle: { color: '#2d6a2d', marginTop: 0, marginBottom: '20px' },
  dateRow: { marginBottom: '16px' },
  sessionsRow: { display: 'flex', gap: '16px', marginBottom: '16px' },
  session: { flex: 1 },
  label: { display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0f4f0', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' },
  totalLabel: { fontWeight: 'bold', color: '#555' },
  totalValue: { fontSize: '20px', fontWeight: 'bold', color: '#2d6a2d' },
  button: { width: '100%', padding: '12px', backgroundColor: '#2d6a2d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px', borderBottom: '2px solid #eee', color: '#777', fontSize: '13px' },
  tr: { borderBottom: '1px solid #f5f5f5' },
  td: { padding: '10px', fontSize: '14px', color: '#333' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  empty: { color: '#999', textAlign: 'center' },
  error: { color: 'red', marginBottom: '12px' },
  success: { color: '#2d6a2d', marginBottom: '12px' },
  loading: { textAlign: 'center', marginTop: '100px', color: '#777' },
};

export default MilkPage;
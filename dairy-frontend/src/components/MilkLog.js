import React, { useState, useEffect } from 'react';
import API from '../services/api';

function MilkLog({ cow, onClose }) {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ litres: '', milked_at: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await API.get(`/milk/cow/${cow.id}`);
      setLogs(res.data);
    } catch (err) {
      setError('Failed to fetch milk logs');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/milk', {
        cow_id: cow.id,
        litres: parseFloat(form.litres),
        milked_at: form.milked_at || new Date().toISOString(),
        notes: form.notes,
      });
      setForm({ litres: '', milked_at: '', notes: '' });
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await API.delete(`/milk/${id}`);
      fetchLogs();
    } catch (err) {
      setError('Failed to delete record');
    }
  };

  const totalToday = logs
    .filter(l => new Date(l.milked_at).toDateString() === new Date().toDateString())
    .reduce((sum, l) => sum + parseFloat(l.litres), 0);

  const totalAll = logs.reduce((sum, l) => sum + parseFloat(l.litres), 0);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>🥛 Milk Log</h2>
            <p style={styles.subtitle}>{cow.cow_id} — {cow.name || 'Unnamed'}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <span style={styles.statNumber}>{totalToday.toFixed(1)}L</span>
            <span style={styles.statLabel}>Today</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNumber}>{totalAll.toFixed(1)}L</span>
            <span style={styles.statLabel}>All Time</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNumber}>{logs.length}</span>
            <span style={styles.statLabel}>Sessions</span>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            name="litres"
            type="number"
            step="0.1"
            min="0"
            placeholder="Litres produced"
            value={form.litres}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            name="milked_at"
            type="datetime-local"
            value={form.milked_at}
            onChange={handleChange}
          />
          <input
            style={styles.input}
            name="notes"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={handleChange}
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Saving...' : '+ Add Record'}
          </button>
        </form>

        <div style={styles.logList}>
          {logs.length === 0 && <p style={styles.empty}>No milk records yet.</p>}
          {logs.map(log => (
            <div key={log.id} style={styles.logItem}>
              <div>
                <span style={styles.logLitres}>{parseFloat(log.litres).toFixed(1)}L</span>
                <span style={styles.logTime}>
                  {new Date(log.milked_at).toLocaleString()}
                </span>
                {log.notes && <span style={styles.logNotes}>{log.notes}</span>}
              </div>
              <button style={styles.deleteBtn} onClick={() => handleDelete(log.id)}>🗑</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  title: { color: '#2d6a2d', margin: 0 },
  subtitle: { color: '#777', margin: '4px 0 0 0', fontSize: '14px' },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' },
  statsRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
  stat: { flex: 1, backgroundColor: '#f0f4f0', padding: '12px', borderRadius: '8px', textAlign: 'center' },
  statNumber: { display: 'block', fontSize: '22px', fontWeight: 'bold', color: '#2d6a2d' },
  statLabel: { fontSize: '12px', color: '#777' },
  form: { marginBottom: '20px' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', backgroundColor: '#2d6a2d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  logList: { borderTop: '1px solid #eee', paddingTop: '16px' },
  logItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' },
  logLitres: { fontWeight: 'bold', color: '#2d6a2d', marginRight: '10px', fontSize: '16px' },
  logTime: { color: '#777', fontSize: '13px' },
  logNotes: { display: 'block', color: '#999', fontSize: '12px', marginTop: '2px' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  empty: { color: '#999', textAlign: 'center' },
  error: { color: 'red', marginBottom: '12px' },
};

export default MilkLog;
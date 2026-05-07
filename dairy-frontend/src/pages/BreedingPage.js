import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

function BreedingPage({ farmer }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cow, setCow] = useState(null);
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [confirmRecord, setConfirmRecord] = useState(null);
  const [form, setForm] = useState({
    heat_date: '',
    insemination_date: '',
    semen_breed: '',
    semen_batch: '',
    notes: '',
  });
  const [calvingForm, setCalvingForm] = useState({
    calving_date: '',
    num_calves: '',
    calf_gender: '',
    outcome: 'Successful',
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCow();
    fetchRecords();
  }, []);

  const fetchCow = async () => {
    try {
      const res = await API.get(`/cows/${id}`);
      setCow(res.data);
    } catch (err) {
      setError('Failed to fetch cow');
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await API.get(`/breeding/cow/${id}`);
      setRecords(res.data);
    } catch (err) {
      setError('Failed to fetch breeding records');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCalvingChange = (e) => {
    setCalvingForm({ ...calvingForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await API.post('/breeding', { cow_id: id, ...form });
      setSuccess('Breeding record saved!');
      setForm({ heat_date: '', insemination_date: '', semen_breed: '', semen_batch: '', notes: '' });
      setShowForm(false);
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleCalvingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await API.put(`/breeding/${editRecord.id}`, calvingForm);
      setSuccess('Calving record updated!');
      setEditRecord(null);
      setCalvingForm({ calving_date: '', num_calves: '', calf_gender: '', outcome: 'Successful', notes: '' });
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleConfirm = async (outcome) => {
    try {
      await API.put(`/breeding/${confirmRecord.id}`, { outcome });
      setSuccess(outcome === 'Successful' ? 'Pregnancy confirmed! 🎉' : 'Insemination marked as failed.');
      setConfirmRecord(null);
      fetchRecords();
    } catch (err) {
      setError('Failed to update record');
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await API.delete(`/breeding/${recordId}`);
      fetchRecords();
    } catch (err) {
      setError('Failed to delete record');
    }
  };

  const daysSinceInsemination = (date) => {
    const today = new Date();
    const insem = new Date(date);
    return Math.ceil((today - insem) / (1000 * 60 * 60 * 24));
  };

  const daysUntilCalving = (expectedDate) => {
    const today = new Date();
    const expected = new Date(expectedDate);
    return Math.ceil((expected - today) / (1000 * 60 * 60 * 24));
  };

  const nextHeatDate = (calvingDate) => {
    const date = new Date(calvingDate);
    date.setDate(date.getDate() + 45);
    return date.toLocaleDateString();
  };

  const getOutcomeBadgeColor = (outcome) => {
    const colors = {
      Pending: '#e67e22',
      Successful: '#2d6a2d',
      Failed: '#c0392b',
      Aborted: '#7f8c8d',
    };
    return colors[outcome] || '#e67e22';
  };

  if (!cow) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(`/cow/${id}`)}>← Back</button>
        <div>
          <h1 style={styles.title}>🐄 Breeding Records</h1>
          <p style={styles.subtitle}>{cow.cow_id} — {cow.name || 'Unnamed'}</p>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ Record Insemination'}
      </button>

      {/* Insemination Form */}
      {showForm && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>New Insemination Record</h2>
          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Heat Date</label>
            <input style={styles.input} name="heat_date" type="date" value={form.heat_date} onChange={handleChange} />

            <label style={styles.label}>Insemination Date *</label>
            <input style={styles.input} name="insemination_date" type="date" value={form.insemination_date} onChange={handleChange} required />

            <label style={styles.label}>Semen Breed</label>
            <input style={styles.input} name="semen_breed" placeholder="e.g. Friesian, Ayrshire" value={form.semen_breed} onChange={handleChange} />

            <label style={styles.label}>Semen Batch/Straw No.</label>
            <input style={styles.input} name="semen_batch" placeholder="Batch or straw number" value={form.semen_batch} onChange={handleChange} />

            <label style={styles.label}>Notes</label>
            <textarea style={styles.input} name="notes" placeholder="Any observations..." value={form.notes} onChange={handleChange} rows={3} />

            <button style={styles.button} type="submit">Save Record</button>
          </form>
        </div>
      )}

      {/* Confirm Insemination Result */}
      {confirmRecord && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Confirm Insemination Result</h2>
          <p style={{ color: '#777' }}>
            {confirmRecord.cow_code} — Inseminated on {new Date(confirmRecord.insemination_date).toLocaleDateString()} ({daysSinceInsemination(confirmRecord.insemination_date)} days ago)
          </p>
          <p style={{ color: '#555', fontWeight: 'bold' }}>Did the insemination succeed?</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button style={{ ...styles.button, backgroundColor: '#2d6a2d' }} onClick={() => handleConfirm('Successful')}>
              ✅ Yes — Cow is Pregnant
            </button>
            <button style={{ ...styles.button, backgroundColor: '#c0392b' }} onClick={() => handleConfirm('Failed')}>
              ❌ No — Insemination Failed
            </button>
          </div>
          <button style={{ ...styles.button, backgroundColor: '#999', marginTop: '8px' }} onClick={() => setConfirmRecord(null)}>
            Cancel
          </button>
        </div>
      )}

      {/* Calving Update Form */}
      {editRecord && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Record Calving for {new Date(editRecord.insemination_date).toLocaleDateString()}</h2>
          <form onSubmit={handleCalvingSubmit}>
            <label style={styles.label}>Calving Date *</label>
            <input style={styles.input} name="calving_date" type="date" value={calvingForm.calving_date} onChange={handleCalvingChange} required />

            <label style={styles.label}>Number of Calves</label>
            <select style={styles.input} name="num_calves" value={calvingForm.num_calves} onChange={handleCalvingChange}>
              <option value="">Select</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>

            <label style={styles.label}>Calf Gender</label>
            <select style={styles.input} name="calf_gender" value={calvingForm.calf_gender} onChange={handleCalvingChange}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Both">Both (twins)</option>
            </select>

            <label style={styles.label}>Notes</label>
            <textarea style={styles.input} name="notes" placeholder="Any complications..." value={calvingForm.notes} onChange={handleCalvingChange} rows={3} />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={styles.button} type="submit">Save Calving</button>
              <button style={{ ...styles.button, backgroundColor: '#999' }} type="button" onClick={() => setEditRecord(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Records List */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>History</h2>
        {records.length === 0 && <p style={styles.empty}>No breeding records yet.</p>}
        {records.map(record => {
          const days = record.outcome === 'Successful' && !record.calving_date ? daysUntilCalving(record.expected_calving_date) : null;
          const daysSince = daysSinceInsemination(record.insemination_date);
          return (
            <div key={record.id} style={styles.recordCard}>
              <div style={styles.recordHeader}>
                <div>
                  <span style={styles.recordDate}>
                    Inseminated: {new Date(record.insemination_date).toLocaleDateString()}
                  </span>
                  {record.heat_date && (
                    <span style={styles.recordSub}>Heat: {new Date(record.heat_date).toLocaleDateString()}</span>
                  )}
                </div>
                <span style={{ ...styles.badge, backgroundColor: getOutcomeBadgeColor(record.outcome) }}>
                  {record.outcome}
                </span>
              </div>

              <div style={styles.recordGrid}>
                {record.semen_breed && (
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Semen Breed</span>
                    <span style={styles.fieldValue}>{record.semen_breed}</span>
                  </div>
                )}
                {record.semen_batch && (
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Batch/Straw</span>
                    <span style={styles.fieldValue}>{record.semen_batch}</span>
                  </div>
                )}
                {record.outcome === 'Successful' && (
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Expected Calving</span>
                    <span style={styles.fieldValue}>{new Date(record.expected_calving_date).toLocaleDateString()}</span>
                  </div>
                )}
                {days !== null && (
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Days Until Calving</span>
                    <span style={{ ...styles.fieldValue, color: days <= 14 ? '#c0392b' : '#2d6a2d', fontWeight: 'bold' }}>
                      {days > 0 ? `${days} days` : '⚠️ Overdue!'}
                    </span>
                  </div>
                )}
                {record.calving_date && (
                  <>
                    <div style={styles.field}>
                      <span style={styles.fieldLabel}>Calving Date</span>
                      <span style={styles.fieldValue}>{new Date(record.calving_date).toLocaleDateString()}</span>
                    </div>
                    <div style={styles.field}>
                      <span style={styles.fieldLabel}>Next Heat Expected</span>
                      <span style={{ ...styles.fieldValue, color: '#8e44ad', fontWeight: 'bold' }}>
                        🌡️ {nextHeatDate(record.calving_date)}
                      </span>
                    </div>
                  </>
                )}
                {record.num_calves && (
                  <div style={styles.field}>
                    <span style={styles.fieldLabel}>Calves</span>
                    <span style={styles.fieldValue}>{record.num_calves} — {record.calf_gender}</span>
                  </div>
                )}
              </div>

              {record.notes && <p style={styles.notes}>{record.notes}</p>}

              <div style={styles.recordActions}>
                {record.outcome === 'Pending' && daysSince >= 21 && (
                  <button style={styles.confirmBtn} onClick={() => setConfirmRecord(record)}>✅ Confirm Result</button>
                )}
                {record.outcome === 'Successful' && !record.calving_date && (
                  <button style={styles.calvingBtn} onClick={() => setEditRecord(record)}>🐄 Record Calving</button>
                )}
                {record.outcome === 'Failed' && (
                  <button style={styles.addBtn} onClick={() => setShowForm(true)}>💉 Re-inseminate</button>
                )}
                <button style={styles.deleteBtn} onClick={() => handleDelete(record.id)}>🗑 Delete</button>
              </div>
            </div>
          );
        })}
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
  addBtn: { padding: '10px 20px', backgroundColor: '#2d6a2d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', fontSize: '15px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' },
  cardTitle: { color: '#2d6a2d', marginTop: 0, marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', marginTop: '12px' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', backgroundColor: '#2d6a2d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', marginTop: '12px' },
  recordCard: { border: '1px solid #eee', borderRadius: '10px', padding: '16px', marginBottom: '16px' },
  recordHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  recordDate: { fontWeight: 'bold', color: '#333', display: 'block' },
  recordSub: { fontSize: '13px', color: '#777', display: 'block', marginTop: '4px' },
  badge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '12px' },
  recordGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '2px' },
  fieldLabel: { fontSize: '11px', color: '#999', textTransform: 'uppercase' },
  fieldValue: { fontSize: '14px', color: '#333' },
  notes: { fontSize: '13px', color: '#777', fontStyle: 'italic', marginBottom: '12px' },
  recordActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  confirmBtn: { padding: '8px 16px', backgroundColor: '#fff3e0', color: '#e67e22', border: '1px solid #e67e22', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  calvingBtn: { padding: '8px 16px', backgroundColor: '#e8f5e9', color: '#2d6a2d', border: '1px solid #2d6a2d', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  deleteBtn: { padding: '8px 16px', backgroundColor: '#fde8e8', color: '#c0392b', border: '1px solid #c0392b', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  empty: { color: '#999', textAlign: 'center' },
  error: { color: 'red', marginBottom: '12px' },
  success: { color: '#2d6a2d', marginBottom: '12px' },
  loading: { textAlign: 'center', marginTop: '100px', color: '#777' },
};

export default BreedingPage;
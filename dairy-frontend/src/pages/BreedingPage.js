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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    heat_date: '', insemination_date: '', semen_breed: '', semen_batch: '', notes: '',
  });
  const [calvingForm, setCalvingForm] = useState({
    calving_date: '', num_calves: '', calf_gender: '', outcome: 'Successful', notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchCow(); fetchRecords(); }, []);

  const fetchCow = async () => {
    try { const res = await API.get(`/cows/${id}`); setCow(res.data); }
    catch (err) { setError('Failed to fetch cow'); }
  };

  const fetchRecords = async () => {
    try { const res = await API.get(`/breeding/cow/${id}`); setRecords(res.data); }
    catch (err) { setError('Failed to fetch breeding records'); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleCalvingChange = (e) => setCalvingForm({ ...calvingForm, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      await API.post('/breeding', { cow_id: id, ...form });
      setSuccess('Breeding record saved!');
      setForm({ heat_date: '', insemination_date: '', semen_breed: '', semen_batch: '', notes: '' });
      setShowForm(false); fetchRecords();
    } catch (err) { setError(err.response?.data?.error || 'Something went wrong'); }
  };

  const handleCalvingSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      await API.put(`/breeding/${editRecord.id}`, calvingForm);
      setSuccess('Calving record updated!');
      setEditRecord(null);
      setCalvingForm({ calving_date: '', num_calves: '', calf_gender: '', outcome: 'Successful', notes: '' });
      fetchRecords();
    } catch (err) { setError(err.response?.data?.error || 'Something went wrong'); }
  };

  const handleConfirm = async (outcome) => {
    try {
      await API.put(`/breeding/${confirmRecord.id}`, { outcome });
      setSuccess(outcome === 'Successful' ? 'Pregnancy confirmed!' : 'Marked as failed.');
      setConfirmRecord(null); fetchRecords();
    } catch (err) { setError('Failed to update record'); }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Delete this record?')) return;
    try { await API.delete(`/breeding/${recordId}`); fetchRecords(); }
    catch (err) { setError('Failed to delete record'); }
  };

  const daysSinceInsemination = (date) => Math.ceil((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
  const daysUntilCalving = (date) => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
  const nextHeatDate = (calvingDate) => { const d = new Date(calvingDate); d.setDate(d.getDate() + 45); return d.toLocaleDateString(); };

  const getOutcomeColor = (outcome) => ({ Pending: '#e67e22', Successful: '#0e8c6e', Failed: '#c0392b', Aborted: '#7f8c8d' }[outcome] || '#e67e22');

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
            <span style={styles.breadcrumbCurrent}>Breeding</span>
          </div>
        </div>

        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.title}>Breeding Records</h1>
            <p style={styles.subtitle}>{cow.cow_id} — {cow.name || 'Unnamed'}</p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Record Insemination'}
          </button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        {/* Insemination Form */}
        {showForm && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>New Insemination Record</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Heat Date</label>
                  <input style={styles.input} name="heat_date" type="date" value={form.heat_date} onChange={handleChange} />
                </div>
                <div>
                  <label style={styles.label}>Insemination Date *</label>
                  <input style={styles.input} name="insemination_date" type="date" value={form.insemination_date} onChange={handleChange} required />
                </div>
                <div>
                  <label style={styles.label}>Semen Breed</label>
                  <input style={styles.input} name="semen_breed" placeholder="e.g. Friesian" value={form.semen_breed} onChange={handleChange} />
                </div>
                <div>
                  <label style={styles.label}>Batch/Straw No.</label>
                  <input style={styles.input} name="semen_batch" placeholder="Straw number" value={form.semen_batch} onChange={handleChange} />
                </div>
              </div>
              <label style={styles.label}>Notes</label>
              <textarea style={styles.input} name="notes" placeholder="Any observations..." value={form.notes} onChange={handleChange} rows={3} />
              <button style={styles.submitBtn} type="submit">Save Record</button>
            </form>
          </div>
        )}

        {/* Confirm Result */}
        {confirmRecord && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Confirm Insemination Result</h2>
            <p style={{ color: '#4a7fa5', marginBottom: '16px' }}>
              {confirmRecord.cow_code} — Inseminated {daysSinceInsemination(confirmRecord.insemination_date)} days ago
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ ...styles.submitBtn, flex: 1 }} onClick={() => handleConfirm('Successful')}>✅ Cow is Pregnant</button>
              <button style={{ ...styles.submitBtn, flex: 1, background: 'linear-gradient(135deg, #c0392b, #e74c3c)' }} onClick={() => handleConfirm('Failed')}>❌ Insemination Failed</button>
            </div>
            <button style={{ ...styles.submitBtn, marginTop: '8px', background: '#718096' }} onClick={() => setConfirmRecord(null)}>Cancel</button>
          </div>
        )}

        {/* Calving Form */}
        {editRecord && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Record Calving</h2>
            <form onSubmit={handleCalvingSubmit}>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Calving Date *</label>
                  <input style={styles.input} name="calving_date" type="date" value={calvingForm.calving_date} onChange={handleCalvingChange} required />
                </div>
                <div>
                  <label style={styles.label}>Number of Calves</label>
                  <select style={styles.input} name="num_calves" value={calvingForm.num_calves} onChange={handleCalvingChange}>
                    <option value="">Select</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Calf Gender</label>
                  <select style={styles.input} name="calf_gender" value={calvingForm.calf_gender} onChange={handleCalvingChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Both">Both (twins)</option>
                  </select>
                </div>
              </div>
              <label style={styles.label}>Notes</label>
              <textarea style={styles.input} name="notes" placeholder="Any complications..." value={calvingForm.notes} onChange={handleCalvingChange} rows={3} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ ...styles.submitBtn, flex: 1 }} type="submit">Save Calving</button>
                <button style={{ ...styles.submitBtn, flex: 1, background: '#718096' }} type="button" onClick={() => setEditRecord(null)}>Cancel</button>
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
                    <span style={styles.recordDate}>Inseminated: {new Date(record.insemination_date).toLocaleDateString()}</span>
                    {record.heat_date && <span style={styles.recordSub}>Heat: {new Date(record.heat_date).toLocaleDateString()}</span>}
                  </div>
                  <span style={{ ...styles.outcomeBadge, backgroundColor: getOutcomeColor(record.outcome) }}>{record.outcome}</span>
                </div>

                <div style={styles.recordGrid}>
                  {record.semen_breed && <div style={styles.field}><span style={styles.fieldLabel}>Semen Breed</span><span style={styles.fieldValue}>{record.semen_breed}</span></div>}
                  {record.semen_batch && <div style={styles.field}><span style={styles.fieldLabel}>Batch/Straw</span><span style={styles.fieldValue}>{record.semen_batch}</span></div>}
                  {record.outcome === 'Successful' && (
                    <div style={styles.field}><span style={styles.fieldLabel}>Expected Calving</span><span style={styles.fieldValue}>{new Date(record.expected_calving_date).toLocaleDateString()}</span></div>
                  )}
                  {days !== null && (
                    <div style={styles.field}>
                      <span style={styles.fieldLabel}>Days Until Calving</span>
                      <span style={{ ...styles.fieldValue, color: days <= 14 ? '#c0392b' : '#0e8c6e', fontWeight: '700' }}>{days > 0 ? `${days} days` : '⚠️ Overdue!'}</span>
                    </div>
                  )}
                  {record.calving_date && (
                    <>
                      <div style={styles.field}><span style={styles.fieldLabel}>Calving Date</span><span style={styles.fieldValue}>{new Date(record.calving_date).toLocaleDateString()}</span></div>
                      <div style={styles.field}><span style={styles.fieldLabel}>Next Heat Expected</span><span style={{ ...styles.fieldValue, color: '#7c3aed', fontWeight: '700' }}>{nextHeatDate(record.calving_date)}</span></div>
                    </>
                  )}
                  {record.num_calves && <div style={styles.field}><span style={styles.fieldLabel}>Calves</span><span style={styles.fieldValue}>{record.num_calves} — {record.calf_gender}</span></div>}
                </div>

                {record.notes && <p style={styles.notes}>{record.notes}</p>}

                <div style={styles.recordActions}>
                  {record.outcome === 'Pending' && daysSince >= 21 && (
                    <button style={styles.confirmBtn} onClick={() => setConfirmRecord(record)}>Confirm Result</button>
                  )}
                  {record.outcome === 'Successful' && !record.calving_date && (
                    <button style={styles.calvingBtn} onClick={() => setEditRecord(record)}>Record Calving</button>
                  )}
                  {record.outcome === 'Failed' && (
                    <button style={styles.reinseminateBtn} onClick={() => setShowForm(true)}>Re-inseminate</button>
                  )}
                  <button style={styles.deleteRecordBtn} onClick={() => handleDelete(record.id)}>Delete</button>
                </div>
              </div>
            );
          })}
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
  menuBtn: { padding: '8px 16px', backgroundColor: '#1a6fc4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  breadcrumb: { fontSize: '14px', fontWeight: '500' },
  breadcrumbLink: { color: '#1a6fc4', cursor: 'pointer' },
  breadcrumbSep: { color: '#a0b4c8', margin: '0 8px' },
  breadcrumbCurrent: { color: '#0f3460', fontWeight: '600' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { color: '#0f3460', margin: '0 0 4px 0', fontSize: '28px', fontWeight: '700' },
  subtitle: { color: '#4a7fa5', margin: 0, fontSize: '14px' },
  addBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #1a6fc4, #1e90ff)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 16px rgba(15,52,96,0.08)', marginBottom: '24px', border: '1px solid #dbeafe' },
  cardTitle: { color: '#0f3460', marginTop: 0, marginBottom: '20px', fontSize: '17px', fontWeight: '600' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  label: { display: 'block', fontSize: '12px', color: '#4a7fa5', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px' },
  input: { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #bfdbfe', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8fbff', outline: 'none', fontFamily: 'inherit', color: '#0f3460' },
  submitBtn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #1a6fc4, #1e90ff)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontWeight: '600', marginTop: '12px' },
  recordCard: { border: '1px solid #dbeafe', borderRadius: '12px', padding: '20px', marginBottom: '16px', backgroundColor: '#f8fbff' },
  recordHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  recordDate: { fontWeight: '700', color: '#0f3460', display: 'block', fontSize: '15px' },
  recordSub: { fontSize: '13px', color: '#4a7fa5', display: 'block', marginTop: '4px' },
  outcomeBadge: { padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: '600' },
  recordGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '2px' },
  fieldLabel: { fontSize: '11px', color: '#4a7fa5', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' },
  fieldValue: { fontSize: '14px', color: '#0f3460', fontWeight: '500' },
  notes: { fontSize: '13px', color: '#4a7fa5', fontStyle: 'italic', marginBottom: '12px' },
  recordActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  confirmBtn: { padding: '7px 14px', backgroundColor: 'rgba(230,119,34,0.1)', color: '#e67e22', border: '1px solid rgba(230,119,34,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  calvingBtn: { padding: '7px 14px', backgroundColor: 'rgba(14,140,110,0.1)', color: '#0e8c6e', border: '1px solid rgba(14,140,110,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  reinseminateBtn: { padding: '7px 14px', background: 'linear-gradient(135deg, #1a6fc4, #1e90ff)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  deleteRecordBtn: { padding: '7px 14px', backgroundColor: 'rgba(231,76,60,0.08)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  empty: { color: '#4a7fa5', textAlign: 'center', padding: '20px 0' },
  errorBox: { backgroundColor: '#fde8e8', color: '#c0392b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  successBox: { backgroundColor: '#e0f2fe', color: '#0f3460', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' },
  loading: { textAlign: 'center', marginTop: '100px', color: '#4a7fa5', fontSize: '16px' },
};

export default BreedingPage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import CowForm from '../components/CowForm';

function CowPage({ farmer, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cow, setCow] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveredAction, setHoveredAction] = useState(null);

  useEffect(() => {
    fetchCow();
  }, []);

  const fetchCow = async () => {
    try {
      const res = await API.get(`/cows/${id}`);
      setCow(res.data);
    } catch (err) {
      setError('Failed to fetch cow details');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this cow?')) return;
    try {
      await API.delete(`/cows/${id}`);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to delete cow');
    }
  };

  if (!cow) return <div style={styles.loading}>Loading...</div>;

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
            { key: 'notifications', label: 'Notifications', path: '/notifications' },
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
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbLink} onClick={() => navigate('/dashboard')}>My Herd</span>
            <span style={styles.breadcrumbSep}> › </span>
            <span style={styles.breadcrumbCurrent}>{cow.cow_id}</span>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Hero Card */}
        <div style={styles.heroCard}>
          <div style={styles.heroLeft}>
            <div style={styles.cowAvatar}>{cow.cow_id.charAt(0)}</div>
            <div>
              <h1 style={styles.cowId}>{cow.cow_id}</h1>
              <p style={styles.cowName}>{cow.name || 'Unnamed'}</p>
              <span style={{ ...styles.statusBadge, backgroundColor: getBadgeColor(cow.health_status) }}>
                {cow.health_status}
              </span>
            </div>
          </div>
          <div style={styles.heroActions}>
            <button
              style={{ ...styles.editBtn, ...(hoveredAction === 'edit' ? styles.editBtnHover : {}) }}
              onClick={() => setShowEdit(true)}
              onMouseEnter={() => setHoveredAction('edit')}
              onMouseLeave={() => setHoveredAction(null)}
            >
              Edit
            </button>
            <button
              style={{ ...styles.deleteBtn, ...(hoveredAction === 'delete' ? styles.deleteBtnHover : {}) }}
              onClick={handleDelete}
              onMouseEnter={() => setHoveredAction('delete')}
              onMouseLeave={() => setHoveredAction(null)}
            >
              Delete
            </button>
          </div>
        </div>

        {/* Details Card */}
        <div style={styles.detailsCard}>
          <h2 style={styles.sectionTitle}>Cow Details</h2>
          <div style={styles.grid}>
            <div style={styles.field}>
              <span style={styles.fieldLabel}>Breed</span>
              <span style={styles.fieldValue}>{cow.breed || '—'}</span>
            </div>
            <div style={styles.field}>
              <span style={styles.fieldLabel}>Color</span>
              <span style={styles.fieldValue}>{cow.color || '—'}</span>
            </div>
            <div style={styles.field}>
              <span style={styles.fieldLabel}>Date of Birth</span>
              <span style={styles.fieldValue}>{cow.date_of_birth ? new Date(cow.date_of_birth).toLocaleDateString() : '—'}</span>
            </div>
            <div style={styles.field}>
              <span style={styles.fieldLabel}>Age</span>
              <span style={styles.fieldValue}>
                {cow.date_of_birth ? `${Math.floor((new Date() - new Date(cow.date_of_birth)) / (1000 * 60 * 60 * 24 * 365))} years` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.actionsGrid}>
          {[
            { key: 'milk', title: 'Milk Log', desc: 'Track daily milk production', path: `/cow/${id}/milk`, color: 'linear-gradient(135deg, #1a6fc4, #1e90ff)' },
            { key: 'breeding', title: 'Breeding', desc: 'Insemination & calving records', path: `/cow/${id}/breeding`, color: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
          ].map(action => (
            <div
              key={action.key}
              style={{ ...styles.actionCard, ...(hoveredAction === action.key ? styles.actionCardHover : {}) }}
              onClick={() => navigate(action.path)}
              onMouseEnter={() => setHoveredAction(action.key)}
              onMouseLeave={() => setHoveredAction(null)}
            >
              <div style={{ ...styles.actionBar, background: action.color }} />
              <h3 style={styles.actionTitle}>{action.title}</h3>
              <p style={styles.actionDesc}>{action.desc}</p>
              <span style={styles.actionArrow}>→</span>
            </div>
          ))}
        </div>
      </div>

      {showEdit && (
        <CowForm
          cow={cow}
          onClose={() => setShowEdit(false)}
          onSave={() => { setShowEdit(false); fetchCow(); }}
        />
      )}
    </div>
  );
}

function getBadgeColor(status) {
  const colors = {
    Healthy: '#0e8c6e',
    Sick: '#c0392b',
    Pregnant: '#7c3aed',
    Recovering: '#e67e22',
    Dry: '#7f8c8d',
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
  breadcrumb: { fontSize: '14px', fontWeight: '500' },
  breadcrumbLink: { color: '#1a6fc4', cursor: 'pointer' },
  breadcrumbSep: { color: '#a0b4c8', margin: '0 8px' },
  breadcrumbCurrent: { color: '#0f3460', fontWeight: '600' },
  heroCard: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 16px rgba(15,52,96,0.08)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #dbeafe' },
  heroLeft: { display: 'flex', alignItems: 'center', gap: '20px' },
  cowAvatar: { fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #1a6fc4, #1e90ff)', color: 'white', borderRadius: '14px', width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cowId: { color: '#0f3460', margin: '0 0 4px 0', fontSize: '26px', fontWeight: '700' },
  cowName: { color: '#4a7fa5', margin: '0 0 10px 0', fontSize: '15px' },
  statusBadge: { padding: '4px 14px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: '600' },
  heroActions: { display: 'flex', gap: '12px' },
  editBtn: { padding: '10px 24px', background: 'linear-gradient(135deg, #1a6fc4, #1e90ff)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' },
  editBtnHover: { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(26,111,196,0.4)' },
  deleteBtn: { padding: '10px 24px', backgroundColor: 'rgba(231,76,60,0.08)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.25)', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' },
  deleteBtnHover: { backgroundColor: '#e74c3c', color: 'white', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(231,76,60,0.3)' },
  detailsCard: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 16px rgba(15,52,96,0.08)', marginBottom: '20px', border: '1px solid #dbeafe' },
  sectionTitle: { color: '#0f3460', margin: '0 0 20px 0', fontSize: '17px', fontWeight: '600' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldLabel: { fontSize: '11px', color: '#4a7fa5', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' },
  fieldValue: { fontSize: '15px', color: '#0f3460', fontWeight: '500' },
  actionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  actionCard: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 16px rgba(15,52,96,0.08)', cursor: 'pointer', position: 'relative', transition: 'all 0.25s', border: '1px solid #dbeafe', overflow: 'hidden' },
  actionCardHover: { transform: 'translateY(-4px)', boxShadow: '0 12px 28px rgba(15,52,96,0.15)' },
  actionBar: { height: '4px', borderRadius: '2px', marginBottom: '16px' },
  actionTitle: { color: '#0f3460', margin: '0 0 6px 0', fontSize: '18px', fontWeight: '600' },
  actionDesc: { color: '#4a7fa5', margin: 0, fontSize: '13px' },
  actionArrow: { position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', color: '#1a6fc4', fontSize: '20px', fontWeight: '700' },
  loading: { textAlign: 'center', marginTop: '100px', color: '#4a7fa5', fontSize: '16px' },
  error: { color: '#e74c3c', marginBottom: '12px', fontSize: '14px' },
};

export default CowPage;
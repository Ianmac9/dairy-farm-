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
  const [hoveredAction, setHoveredAction] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);

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
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>DairyFarm</h2>
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
              style={{ ...styles.navItem, ...(hoveredNav === item.key ? styles.navItemHover : {}) }}
              onClick={() => navigate(item.path)}
              onMouseEnter={() => setHoveredNav(item.key)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              {item.label}
            </div>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbLink} onClick={() => navigate('/dashboard')}>My Herd</span>
          <span style={styles.breadcrumbSep}> › </span>
          <span style={styles.breadcrumbCurrent}>{cow.cow_id}</span>
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
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.actionsGrid}>
          {[
            { key: 'milk', title: 'Milk Log', desc: 'Track daily milk production', path: `/cow/${id}/milk` },
            { key: 'breeding', title: 'Breeding', desc: 'Insemination & calving records', path: `/cow/${id}/breeding` },
          ].map(action => (
            <div
              key={action.key}
              style={{ ...styles.actionCard, ...(hoveredAction === action.key ? styles.actionCardHover : {}) }}
              onClick={() => navigate(action.path)}
              onMouseEnter={() => setHoveredAction(action.key)}
              onMouseLeave={() => setHoveredAction(null)}
            >
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
    Healthy: '#2d6a2d',
    Sick: '#c0392b',
    Pregnant: '#8e44ad',
    Recovering: '#e67e22',
    Dry: '#7f8c8d',
  };
  return colors[status] || '#2d6a2d';
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', backgroundColor: '#f5f0e8', fontFamily: 'Georgia, serif' },
  sidebar: { width: '240px', backgroundColor: '#3d2b1f', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', top: 0, bottom: 0, left: 0 },
  sidebarHeader: { padding: '0 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  sidebarTitle: { color: '#d4a855', margin: 0, fontSize: '22px', fontWeight: 'bold' },
  farmInfo: { padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  farmName: { color: '#e8d5b7', margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px' },
  farmerName: { color: '#a08060', margin: 0, fontSize: '13px' },
  nav: { flex: 1, padding: '16px 0' },
  navItem: { padding: '12px 24px', color: '#c4a882', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', borderRight: '3px solid transparent' },
  navItemHover: { backgroundColor: 'rgba(212,168,85,0.1)', color: '#d4a855', borderRight: '3px solid #d4a855' },
  logoutBtn: { margin: '0 24px 24px', padding: '10px', backgroundColor: 'rgba(231,76,60,0.15)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  main: { flex: 1, marginLeft: '240px', padding: '32px' },
  breadcrumb: { marginBottom: '24px', fontSize: '14px' },
  breadcrumbLink: { color: '#8b6f47', cursor: 'pointer', textDecoration: 'underline' },
  breadcrumbSep: { color: '#c4a882', margin: '0 4px' },
  breadcrumbCurrent: { color: '#3d2b1f', fontWeight: 'bold' },
  heroCard: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(61,43,31,0.08)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  heroLeft: { display: 'flex', alignItems: 'center', gap: '20px' },
  cowAvatar: { fontSize: '32px', fontWeight: 'bold', backgroundColor: '#3d2b1f', color: '#d4a855', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cowId: { color: '#3d2b1f', margin: '0 0 4px 0', fontSize: '28px', fontWeight: 'bold' },
  cowName: { color: '#8b6f47', margin: '0 0 10px 0', fontSize: '15px' },
  statusBadge: { padding: '4px 14px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' },
  heroActions: { display: 'flex', gap: '12px' },
  editBtn: { padding: '10px 20px', backgroundColor: '#3d2b1f', color: '#d4a855', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: 'all 0.2s' },
  editBtnHover: { backgroundColor: '#5a3d28', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(61,43,31,0.3)' },
  deleteBtn: { padding: '10px 20px', backgroundColor: 'rgba(231,76,60,0.1)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' },
  deleteBtnHover: { backgroundColor: '#e74c3c', color: 'white', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(231,76,60,0.3)' },
  detailsCard: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(61,43,31,0.08)', marginBottom: '20px' },
  sectionTitle: { color: '#3d2b1f', margin: '0 0 20px 0', fontSize: '18px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  fieldLabel: { fontSize: '11px', color: '#a08060', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 'bold' },
  fieldValue: { fontSize: '15px', color: '#3d2b1f', fontWeight: '500' },
  actionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  actionCard: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(61,43,31,0.08)', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' },
  actionCardHover: { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(61,43,31,0.15)', borderLeft: '4px solid #d4a855' },
  actionTitle: { color: '#3d2b1f', margin: '0 0 6px 0', fontSize: '18px' },
  actionDesc: { color: '#8b6f47', margin: 0, fontSize: '13px' },
  actionArrow: { position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', color: '#d4a855', fontSize: '20px', fontWeight: 'bold' },
  loading: { textAlign: 'center', marginTop: '100px', color: '#8b6f47', fontSize: '18px' },
  error: { color: 'red', marginBottom: '12px' },
};

export default CowPage;
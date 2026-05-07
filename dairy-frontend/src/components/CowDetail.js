import React from 'react';

function CowDetail({ cow, onClose, onEdit, onDelete }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>{cow.cow_id}</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.grid}>
          <div style={styles.field}>
            <span style={styles.label}>Name</span>
            <span style={styles.value}>{cow.name || '—'}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Breed</span>
            <span style={styles.value}>{cow.breed || '—'}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Color</span>
            <span style={styles.value}>{cow.color || '—'}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Date of Birth</span>
            <span style={styles.value}>{cow.date_of_birth ? new Date(cow.date_of_birth).toLocaleDateString() : '—'}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Health Status</span>
            <span style={{ ...styles.badge, backgroundColor: getBadgeColor(cow.health_status) }}>
              {cow.health_status}
            </span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Added On</span>
            <span style={styles.value}>{new Date(cow.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div style={styles.actions}>
          <button style={styles.editBtn} onClick={onEdit}>✏️ Edit</button>
          <button style={styles.deleteBtn} onClick={onDelete}>🗑 Delete</button>
        </div>
      </div>
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
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', width: '420px', maxWidth: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { color: '#2d6a2d', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' },
  value: { fontSize: '15px', color: '#333', fontWeight: '500' },
  badge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '12px', display: 'inline-block' },
  actions: { display: 'flex', gap: '12px' },
  editBtn: { flex: 1, padding: '10px', backgroundColor: '#2d6a2d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  deleteBtn: { flex: 1, padding: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
};

export default CowDetail;
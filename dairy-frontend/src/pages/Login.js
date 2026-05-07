import React, { useState } from 'react';
import API from '../services/api';

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', farm_name: '', phone: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const res = await API.post(endpoint, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('farmer', JSON.stringify(res.data.farmer));
      onLogin(res.data.farmer);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div style={styles.container}>
      {/* Dark overlay */}
      <div style={styles.overlay} />

      {/* Login Card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardIcon}>🐄</span>
          <h1 style={styles.cardTitle}>DairyFarm</h1>
          <p style={styles.cardSubtitle}>{isRegister ? 'Create your account' : 'Sign in to your farm'}</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <input style={styles.input} name="name" placeholder="👤 Full Name" onChange={handleChange} required />
              <input style={styles.input} name="farm_name" placeholder="🌿 Farm Name" onChange={handleChange} />
              <input style={styles.input} name="phone" placeholder="📱 Phone (+254...)" onChange={handleChange} />
            </>
          )}
          <input style={styles.input} name="email" type="email" placeholder="✉️ Email Address" onChange={handleChange} required />
          <input style={styles.input} name="password" type="password" placeholder="🔒 Password" onChange={handleChange} required />
          <button style={styles.button} type="submit">
            {isRegister ? '🌱 Create Account' : '🐄 Enter Farm'}
          </button>
        </form>

        <p style={styles.toggle}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <span style={styles.link} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? ' Sign In' : ' Register Free'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Georgia, serif',
    backgroundImage: 'url(https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1600&auto=format&fit=crop)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'rgba(255,253,244,0.96)',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
    width: '100%',
    maxWidth: '380px',
    backdropFilter: 'blur(12px)',
  },
  cardHeader: { textAlign: 'center', marginBottom: '28px' },
  cardIcon: { fontSize: '48px', display: 'block' },
  cardTitle: { color: '#3d2b1f', margin: '8px 0 4px', fontSize: '28px', fontWeight: 'bold' },
  cardSubtitle: { color: '#8b6f47', margin: 0, fontSize: '14px' },
  input: {
    width: '100%',
    padding: '12px 14px',
    marginBottom: '12px',
    borderRadius: '8px',
    border: '2px solid #e8d5b7',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: '#fffdf9',
    fontFamily: 'inherit',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#3d2b1f',
    color: '#d4a855',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '4px',
    letterSpacing: '0.5px',
  },
  errorBox: {
    backgroundColor: '#fde8e8',
    color: '#c0392b',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '13px',
  },
  toggle: { textAlign: 'center', marginTop: '20px', color: '#8b6f47', fontSize: '13px' },
  link: { color: '#3d2b1f', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' },
};

export default Login;
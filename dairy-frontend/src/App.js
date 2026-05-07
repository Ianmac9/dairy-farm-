import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CowPage from './pages/CowPage';
import MilkPage from './pages/MilkPage';
import BreedingPage from './pages/BreedingPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  const [farmer, setFarmer] = useState(() => {
    const saved = localStorage.getItem('farmer');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (farmerData) => {
    setFarmer(farmerData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('farmer');
    setFarmer(null);
  };

  const handleUpdateFarmer = (updatedFarmer) => {
    localStorage.setItem('farmer', JSON.stringify(updatedFarmer));
    setFarmer(updatedFarmer);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={farmer ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
        <Route path="/dashboard" element={farmer ? <Dashboard farmer={farmer} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/cow/:id" element={farmer ? <CowPage farmer={farmer} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/cow/:id/milk" element={farmer ? <MilkPage farmer={farmer} /> : <Navigate to="/" />} />
        <Route path="/cow/:id/breeding" element={farmer ? <BreedingPage farmer={farmer} /> : <Navigate to="/" />} />
        <Route path="/profile" element={farmer ? <ProfilePage farmer={farmer} onLogout={handleLogout} onUpdate={handleUpdateFarmer} /> : <Navigate to="/" />} />        <Route path="/notifications" element={farmer ? <NotificationsPage farmer={farmer} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
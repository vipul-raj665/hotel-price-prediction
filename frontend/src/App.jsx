import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Predictor from './pages/Predictor';
import Analytics from './pages/Analytics';
import Model from './pages/Model';
import { getHealth } from './services/api';
import './App.css';

export default function App() {
  const [backendStatus, setBackendStatus] = useState(null);
  const location = useLocation();

  useEffect(() => {
    async function checkHealth() {
      try {
        const health = await getHealth();
        setBackendStatus(health);
      } catch (err) {
        console.error('Health check failed:', err);
        setBackendStatus(null);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Dashboard';
      case '/predictor':
        return 'Price Predictor';
      case '/analytics':
        return 'Analytics';
      case '/model':
        return 'ML Model';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="layout-root">
      <Sidebar backendStatus={backendStatus} />
      <div className="layout-main">
        {/* Subtle, minimal topbar as specified in Section 2 */}
        <header className="minimal-topbar">
          <div className="topbar-left">
            <span className="topbar-brand">Hotel Analytics</span>
            <span className="topbar-slash">/</span>
            <span className="topbar-page">{getPageTitle(location.pathname)}</span>
          </div>
          <div className="topbar-right">
            <span className="topbar-period-tag">2022–2024</span>
          </div>
        </header>

        <main className="content-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predictor" element={<Predictor />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/model" element={<Model />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

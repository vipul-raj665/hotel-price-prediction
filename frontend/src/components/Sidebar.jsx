import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ backendStatus }) {
  const navItems = [
    { to: '/', label: 'Dashboard', end: true },
    { to: '/predictor', label: 'Price Predictor', end: false },
    { to: '/analytics', label: 'Analytics', end: false },
    { to: '/model', label: 'ML Model', end: false },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand-area">
        <div className="brand-title">Hotel Price Predictor</div>
        <div className="brand-subtitle">Hotel Analytics</div>
      </div>

      <nav className="sidebar-menu">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="link-indicator" />
            <span className="link-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-status-bar">
        <span
          className={`system-status-dot ${
            backendStatus?.model_loaded ? 'online' : 'offline'
          }`}
        />
        <span className="system-status-text">
          {backendStatus?.model_loaded ? 'Model Active' : 'Connecting...'}
        </span>
      </div>
    </aside>
  );
}

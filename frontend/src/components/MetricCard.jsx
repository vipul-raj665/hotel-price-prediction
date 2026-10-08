import React from 'react';

export default function MetricCard({ label, value, hint, highlight }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className={`metric-value ${highlight ? 'highlight' : ''}`}>
        {value ?? '—'}
      </div>
      {hint && <div className="metric-hint">{hint}</div>}
    </div>
  );
}

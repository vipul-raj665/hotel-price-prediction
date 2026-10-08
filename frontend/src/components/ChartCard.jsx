import React from 'react';

export default function ChartCard({ title, subtitle, insight, children }) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      </div>
      <div className="chart-body">{children}</div>
      {insight && <div className="insight-box">{insight}</div>}
    </div>
  );
}

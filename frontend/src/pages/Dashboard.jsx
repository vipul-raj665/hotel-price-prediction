import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { getMetrics, getModelInfo, getStatistics } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [modelInfo, setModelInfo] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Hotel Price Prediction | Dashboard';
    async function fetchData() {
      try {
        setLoading(true);
        const [infoRes, metricsRes, statsRes] = await Promise.all([
          getModelInfo(),
          getMetrics(),
          getStatistics(),
        ]);
        setModelInfo(infoRes);
        setMetrics(metricsRes);
        setStats(statsRes);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Unable to connect to backend server. Make sure the API is active.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatCurrency = (val) => `₹${(Number(val) / 1000).toFixed(0)}K`;
  const formatTooltipVal = (val) => [`₹${Number(val).toLocaleString()}`, 'Average Price (INR)'];

  return (
    <div className="dashboard-view">
      {error && <div className="system-error-banner">{error}</div>}

      {loading ? (
        <div className="page-loading-state">
          <div className="loading-spinner-ring" />
          <span>Loading dashboard analytics...</span>
        </div>
      ) : (
        <>
          {/* 1. HERO SECTION WITH FOCAL PRICE BLOCK (Section 3) */}
          <section className="dashboard-hero-section">
            <div className="hero-text-content">
              <h1 className="hero-main-title">Hotel Price Prediction</h1>
              <p className="hero-sub-description">
                Estimate the expected nightly hotel price from booking details using machine learning.
              </p>
              <div className="hero-cta-row">
                <button
                  className="btn-hero-primary"
                  onClick={() => navigate('/predictor')}
                >
                  Estimate a Room Rate &rarr;
                </button>
                <button
                  className="btn-hero-secondary"
                  onClick={() => navigate('/analytics')}
                >
                  Explore Analytics
                </button>
              </div>
            </div>

            {/* Prominent Focal Price Block */}
            <div className="hero-price-focal-block">
              <div className="price-block-label">AVERAGE NIGHTLY RATE</div>
              <div className="price-block-number">
                ₹{modelInfo?.average_nightly_rate_inr ? modelInfo.average_nightly_rate_inr.toLocaleString() : '10,349'}
              </div>
              <div className="price-block-subtext">Dataset average • 2022–2024</div>
            </div>
          </section>

          {/* 2. COMPACT HORIZONTAL QUICK STATS ROW (Section 4) */}
          <div className="horizontal-stats-bar">
            <div className="stat-bar-item">
              <div className="stat-bar-val">
                {modelInfo?.cleaned_records ? `${Math.round(modelInfo.cleaned_records / 1000)}K+` : '119K+'}
              </div>
              <div className="stat-bar-lbl">Bookings Analyzed</div>
            </div>
            <div className="stat-bar-divider" />
            <div className="stat-bar-item">
              <div className="stat-bar-val">{modelInfo?.year_range || '2022–2024'}</div>
              <div className="stat-bar-lbl">Data Period</div>
            </div>
            <div className="stat-bar-divider" />
            <div className="stat-bar-item">
              <div className="stat-bar-val">{modelInfo?.hotels_count || '2'}</div>
              <div className="stat-bar-lbl">Hotel Types (City & Resort)</div>
            </div>
            <div className="stat-bar-divider" />
            <div className="stat-bar-item">
              <div className="stat-bar-val">{modelInfo?.num_features || '27'}</div>
              <div className="stat-bar-lbl">Predictive Features</div>
            </div>
          </div>

          {/* 3. PRIMARY PRICE TREND SECTION (Section 5) */}
          <section className="primary-chart-section">
            <div className="chart-header-row">
              <div>
                <h2 className="chart-title">Average Hotel Price</h2>
                <p className="chart-subtitle">
                  Average daily rate across the reservation period (2022 ─ 2023 ─ 2024).
                </p>
              </div>
              <div className="chart-badge">Annual Rate Trend</div>
            </div>

            <div className="primary-chart-wrapper">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={stats?.by_year || []}
                  margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="priceTrendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="year"
                    stroke="#64748B"
                    tick={{ fill: '#64748B', fontSize: 13 }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    tick={{ fill: '#64748B', fontSize: 13 }}
                    tickFormatter={formatCurrency}
                    domain={['dataMin - 1500', 'dataMax + 1500']}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={formatTooltipVal}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#0F172A',
                      borderRadius: 6,
                      color: '#FFFFFF',
                      fontSize: 13,
                    }}
                    itemStyle={{ color: '#FFFFFF' }}
                    labelStyle={{ color: '#93C5FD', fontWeight: 600, marginBottom: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="avg_price_inr"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#priceTrendGradient)"
                    dot={{ r: 5, fill: '#4F46E5', strokeWidth: 2, stroke: '#FFFFFF' }}
                    activeDot={{ r: 7, fill: '#4F46E5' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* 4. SECONDARY ANALYTICS (Section 6) */}
          <section className="secondary-charts-grid">
            {/* Monthly Seasonal Trend */}
            <div className="secondary-chart-panel">
              <div className="panel-header">
                <h3 className="panel-title">Average Price by Month</h3>
                <p className="panel-subtitle">Monthly pricing cycle across the calendar year</p>
              </div>
              <div className="panel-chart-container">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={stats?.by_month || []}
                    margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="month_short"
                      stroke="#64748B"
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748B"
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      tickFormatter={formatCurrency}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={formatTooltipVal}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: 6,
                        color: '#FFFFFF',
                        fontSize: 12,
                      }}
                      itemStyle={{ color: '#FFFFFF' }}
                    />
                    <Bar
                      dataKey="avg_price_inr"
                      fill="#4F46E5"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hotel Type Comparison */}
            <div className="secondary-chart-panel">
              <div className="panel-header">
                <h3 className="panel-title">Average Price by Hotel Type</h3>
                <p className="panel-subtitle">Nightly rate comparison between City & Resort properties</p>
              </div>
              <div className="panel-chart-container">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={stats?.by_hotel_type || []}
                    margin={{ top: 10, right: 20, left: -5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="hotel_type"
                      stroke="#64748B"
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748B"
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      tickFormatter={formatCurrency}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={formatTooltipVal}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: 6,
                        color: '#FFFFFF',
                        fontSize: 12,
                      }}
                      itemStyle={{ color: '#FFFFFF' }}
                    />
                    <Bar
                      dataKey="avg_price_inr"
                      fill="#16A34A"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* 5. MODEL PERFORMANCE (Section 7 - Compact horizontal row) */}
          <section className="model-performance-compact-row">
            <div className="perf-header-col">
              <div className="perf-tag">EVALUATION METRICS</div>
              <div className="perf-title">Model Performance</div>
              <button
                className="perf-link-btn"
                onClick={() => navigate('/model')}
              >
                View model details &rarr;
              </button>
            </div>

            <div className="perf-metrics-strip">
              <div className="perf-metric-cell">
                <div className="perf-metric-lbl">MAE</div>
                <div className="perf-metric-val">₹{metrics?.mae_inr ? metrics.mae_inr.toLocaleString() : (metrics ? Math.round(metrics.MAE * 100).toLocaleString() : '2,019')}</div>
                <div className="perf-metric-sub">
                  Mean Absolute Error (Rs)
                </div>
              </div>

              <div className="perf-metric-cell">
                <div className="perf-metric-lbl">RMSE</div>
                <div className="perf-metric-val">₹{metrics?.rmse_inr ? metrics.rmse_inr.toLocaleString() : (metrics ? Math.round(metrics.RMSE * 100).toLocaleString() : '3,057')}</div>
                <div className="perf-metric-sub">
                  Root Mean Squared Error (Rs)
                </div>
              </div>

              <div className="perf-metric-cell">
                <div className="perf-metric-lbl">R² SCORE</div>
                <div className="perf-metric-val accent">
                  {metrics ? metrics.R2.toFixed(4) : '0.5753'}
                </div>
                <div className="perf-metric-sub">Variance explained</div>
              </div>

              <div className="perf-metric-cell">
                <div className="perf-metric-lbl">MAPE</div>
                <div className="perf-metric-val">
                  {metrics ? `${metrics.MAPE.toFixed(2)}%` : '25.83%'}
                </div>
                <div className="perf-metric-sub">Avg % error</div>
              </div>
            </div>
          </section>

          {/* 6. DATASET INFORMATION (Section 8 - Compact footer) */}
          <footer className="dataset-footer-strip">
            <div className="dataset-meta-item">
              <span className="dataset-label">Dataset:</span>
              <span className="dataset-value">Hotel Booking Reservation — Updated 2024</span>
            </div>
            <div className="dataset-meta-sep">•</div>
            <div className="dataset-meta-item">
              <span className="dataset-label">Coverage:</span>
              <span className="dataset-value">{modelInfo?.year_range || '2022–2024'}</span>
            </div>
            <div className="dataset-meta-sep">•</div>
            <div className="dataset-meta-item">
              <span className="dataset-label">Records:</span>
              <span className="dataset-value">
                {modelInfo?.cleaned_records ? modelInfo.cleaned_records.toLocaleString() : '117,429'} Cleaned (119K+ Total)
              </span>
            </div>
            <div className="dataset-meta-sep">•</div>
            <div className="dataset-meta-item">
              <span className="dataset-label">Source:</span>
              <span className="dataset-value">Kaggle</span>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

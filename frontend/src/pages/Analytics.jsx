import React, { useEffect, useState } from 'react';
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
import { getStatistics, getFeatureImportance } from '../services/api';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Hotel Price Prediction | Analytics';
    async function loadData() {
      try {
        setLoading(true);
        const [statsData, featData] = await Promise.all([
          getStatistics(),
          getFeatureImportance(),
        ]);
        setStats(statsData);
        setFeatures(featData || []);
        setError(null);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Failed to load dataset statistics.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatCurrency = (val) => `₹${(Number(val) / 1000).toFixed(0)}K`;
  const formatTooltipVal = (val) => [`₹${Number(val).toLocaleString()}`, 'Avg Price (INR)'];

  // Dynamically derive Key Observations from actual backend statistics (Section 13)
  const getObservations = () => {
    if (!stats) return [];
    const obs = [];

    // 1. Month with peak and lowest price
    if (stats.by_month && stats.by_month.length > 0) {
      const sortedMonths = [...stats.by_month].sort(
        (a, b) => b.avg_price_inr - a.avg_price_inr
      );
      const peakMonth = sortedMonths[0];
      const lowMonth = sortedMonths[sortedMonths.length - 1];
      obs.push({
        title: 'Peak Pricing Period',
        text: `${peakMonth.month} exhibits the highest average room rate at ₹${peakMonth.avg_price_inr.toLocaleString()}/night, while ${lowMonth.month} records the lowest rate at ₹${lowMonth.avg_price_inr.toLocaleString()}/night.`,
      });
    }

    // 2. City Hotel vs Resort Hotel comparison
    if (stats.by_hotel_type && stats.by_hotel_type.length >= 2) {
      const city = stats.by_hotel_type.find((h) => h.hotel_type.includes('City'));
      const resort = stats.by_hotel_type.find((h) => h.hotel_type.includes('Resort'));
      if (city && resort) {
        const diff = Math.abs(city.avg_price_inr - resort.avg_price_inr);
        const higher = city.avg_price_inr > resort.avg_price_inr ? 'City Hotel' : 'Resort Hotel';
        obs.push({
          title: 'Property Type Differential',
          text: `${higher} commands a higher average price by ₹${diff.toLocaleString()}/night (City: ₹${city.avg_price_inr.toLocaleString()} vs Resort: ₹${resort.avg_price_inr.toLocaleString()}).`,
        });
      }
    }

    // 3. Market segment observation
    if (stats.by_market_segment && stats.by_market_segment.length > 0) {
      const sortedSegs = [...stats.by_market_segment].sort(
        (a, b) => b.avg_price_inr - a.avg_price_inr
      );
      const topSeg = sortedSegs[0];
      obs.push({
        title: 'Market Segment Spread',
        text: `The "${topSeg.segment}" channel yields the highest average rate at ₹${topSeg.avg_price_inr.toLocaleString()}/night, reflecting premium room allocations.`,
      });
    }

    return obs;
  };

  const observations = getObservations();

  return (
    <div className="analytics-view">
      <div className="view-header">
        <h1 className="view-title">Hotel Price Analytics</h1>
        <p className="view-subtitle">
          Explore pricing patterns across the booking dataset.
        </p>
      </div>

      {error && <div className="system-error-banner">{error}</div>}

      {loading ? (
        <div className="page-loading-state">
          <div className="loading-spinner-ring" />
          <span>Loading analytics data...</span>
        </div>
      ) : (
        <>
          {/* KEY OBSERVATIONS SECTION (Section 13) */}
          {observations.length > 0 && (
            <div className="observations-banner-grid">
              {observations.map((item, idx) => (
                <div key={idx} className="observation-pill-item">
                  <span className="obs-badge">Insight</span>
                  <div className="obs-content">
                    <strong className="obs-title">{item.title}:</strong> {item.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ROW 1: Year & Month Trends */}
          <div className="analytics-charts-row">
            <div className="analytics-chart-cell">
              <div className="cell-header">
                <h3 className="cell-title">Average Price by Year</h3>
                <span className="cell-subtitle">2022 ─ 2024 annual progression</span>
              </div>
              <div className="cell-chart-body">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart
                    data={stats?.by_year || []}
                    margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="year"
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
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: 6, color: '#fff', fontSize: 12 }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="avg_price_inr"
                      stroke="#4F46E5"
                      strokeWidth={2.5}
                      fill="#EEF2FF"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="analytics-chart-cell">
              <div className="cell-header">
                <h3 className="cell-title">Average Price by Month</h3>
                <span className="cell-subtitle">Seasonal rate curve across all 12 calendar months</span>
              </div>
              <div className="cell-chart-body">
                <ResponsiveContainer width="100%" height={260}>
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
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: 6, color: '#fff', fontSize: 12 }}
                      itemStyle={{ color: '#fff' }}
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
          </div>

          {/* ROW 2: Hotel Type & Market Segment */}
          <div className="analytics-charts-row">
            <div className="analytics-chart-cell">
              <div className="cell-header">
                <h3 className="cell-title">Average Price by Hotel Type</h3>
                <span className="cell-subtitle">City Hotel vs Resort Hotel comparison</span>
              </div>
              <div className="cell-chart-body">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={stats?.by_hotel_type || []}
                    margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
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
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: 6, color: '#fff', fontSize: 12 }}
                      itemStyle={{ color: '#fff' }}
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

            <div className="analytics-chart-cell">
              <div className="cell-header">
                <h3 className="cell-title">Average Price by Market Segment</h3>
                <span className="cell-subtitle">Online TA, Direct, Corporate, Groups</span>
              </div>
              <div className="cell-chart-body">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={stats?.by_market_segment || []}
                    margin={{ top: 10, right: 15, left: -10, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="segment"
                      stroke="#64748B"
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      angle={-15}
                      textAnchor="end"
                      interval={0}
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
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: 6, color: '#fff', fontSize: 12 }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar
                      dataKey="avg_price_inr"
                      fill="#0284C7"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ROW 3: Room Type & Customer Type */}
          <div className="analytics-charts-row">
            <div className="analytics-chart-cell">
              <div className="cell-header">
                <h3 className="cell-title">Average Price by Room Category</h3>
                <span className="cell-subtitle">Room categories A through L</span>
              </div>
              <div className="cell-chart-body">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={stats?.by_room_type || []}
                    margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="room_type"
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
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: 6, color: '#fff', fontSize: 12 }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar
                      dataKey="avg_price_inr"
                      fill="#8B5CF6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="analytics-chart-cell">
              <div className="cell-header">
                <h3 className="cell-title">Average Price by Customer Type</h3>
                <span className="cell-subtitle">Transient, Contract, Group reservations</span>
              </div>
              <div className="cell-chart-body">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={stats?.by_customer_type || []}
                    margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="customer_type"
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
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: 6, color: '#fff', fontSize: 12 }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar
                      dataKey="avg_price_inr"
                      fill="#EC4899"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

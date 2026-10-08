import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { getMetrics, getModelInfo, getFeatureImportance } from '../services/api';

export default function Model() {
  const [modelInfo, setModelInfo] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Hotel Price Prediction | ML Model';
    async function loadModelData() {
      try {
        setLoading(true);
        const [infoRes, metricsRes, featRes] = await Promise.all([
          getModelInfo(),
          getMetrics(),
          getFeatureImportance(),
        ]);
        setModelInfo(infoRes);
        setMetrics(metricsRes);
        setFeatureImportance(featRes || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching model specs:', err);
        setError('Failed to load model specifications.');
      } finally {
        setLoading(false);
      }
    }
    loadModelData();
  }, []);

  // Format feature importance for horizontal bar chart
  const chartData = [...featureImportance].reverse().map((f) => ({
    feature: f.feature,
    percentage: Number((f.importance * 100).toFixed(1)),
    raw: f.importance,
  }));

  return (
    <div className="model-view">
      <div className="view-header">
        <h1 className="view-title">Machine Learning Model</h1>
        <p className="view-subtitle">
          How the hotel price prediction model works.
        </p>
      </div>

      {error && <div className="system-error-banner">{error}</div>}

      {loading ? (
        <div className="page-loading-state">
          <div className="loading-spinner-ring" />
          <span>Loading model architecture & metrics...</span>
        </div>
      ) : (
        <>
          {/* 1. MODEL SUMMARY SPECIFICATIONS (Section 14) */}
          <section className="tech-spec-section">
            <h2 className="tech-section-title">Model Specifications</h2>
            <div className="specs-horizontal-grid">
              <div className="spec-card-cell">
                <span className="spec-lbl">Algorithm</span>
                <span className="spec-val">Random Forest Regressor</span>
              </div>
              <div className="spec-card-cell">
                <span className="spec-lbl">Task</span>
                <span className="spec-val">Regression</span>
              </div>
              <div className="spec-card-cell">
                <span className="spec-lbl">Target</span>
                <span className="spec-val">ADR (Average Daily Rate)</span>
              </div>
              <div className="spec-card-cell">
                <span className="spec-lbl">Training Records</span>
                <span className="spec-val">
                  {modelInfo?.training_records ? modelInfo.training_records.toLocaleString() : '93,943'} (80%)
                </span>
              </div>
              <div className="spec-card-cell">
                <span className="spec-lbl">Testing Records</span>
                <span className="spec-val">
                  {modelInfo?.testing_records ? modelInfo.testing_records.toLocaleString() : '23,486'} (20%)
                </span>
              </div>
              <div className="spec-card-cell">
                <span className="spec-lbl">Trees</span>
                <span className="spec-val">100 Estimators</span>
              </div>
            </div>
          </section>

          {/* 2. EVALUATION METRICS (Section 14) */}
          <section className="tech-spec-section">
            <h2 className="tech-section-title">Evaluation Metrics (Independent Test Set)</h2>
            <div className="eval-metrics-row">
              <div className="eval-metric-box">
                <div className="eval-metric-name">MAE</div>
                <div className="eval-metric-number">
                  €{metrics ? metrics.MAE.toFixed(2) : '20.19'}
                </div>
                <div className="eval-metric-inr">
                  ≈ ₹{metrics?.mae_inr ? metrics.mae_inr.toLocaleString() : '2,019'}
                </div>
                <div className="eval-metric-desc">Mean Absolute Error</div>
              </div>

              <div className="eval-metric-box">
                <div className="eval-metric-name">RMSE</div>
                <div className="eval-metric-number">
                  €{metrics ? metrics.RMSE.toFixed(2) : '30.57'}
                </div>
                <div className="eval-metric-inr">
                  ≈ ₹{metrics?.rmse_inr ? metrics.rmse_inr.toLocaleString() : '3,057'}
                </div>
                <div className="eval-metric-desc">Root Mean Squared Error</div>
              </div>

              <div className="eval-metric-box highlight">
                <div className="eval-metric-name">R² SCORE</div>
                <div className="eval-metric-number accent">
                  {metrics ? metrics.R2.toFixed(4) : '0.5753'}
                </div>
                <div className="eval-metric-inr">57.5% Variance</div>
                <div className="eval-metric-desc">Coefficient of Determination</div>
              </div>

              <div className="eval-metric-box">
                <div className="eval-metric-name">MAPE</div>
                <div className="eval-metric-number">
                  {metrics ? `${metrics.MAPE.toFixed(2)}%` : '25.83%'}
                </div>
                <div className="eval-metric-inr">Relative Error</div>
                <div className="eval-metric-desc">Mean Absolute Percentage Error</div>
              </div>
            </div>
          </section>

          {/* 3. FEATURE IMPORTANCE HORIZONTAL BAR CHART (Section 14) */}
          <section className="tech-spec-section">
            <div className="chart-header-row">
              <div>
                <h2 className="tech-section-title">Feature Importance</h2>
                <p className="tech-section-desc">
                  Contribution share of predictive variables in the Random Forest ensemble
                </p>
              </div>
            </div>
            <div className="feature-chart-container">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 130, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis
                    type="number"
                    unit="%"
                    stroke="#64748B"
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    domain={[0, 'dataMax + 2']}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="feature"
                    stroke="#111827"
                    tick={{ fill: '#111827', fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Importance Weight']}
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: 6, color: '#fff', fontSize: 12 }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar
                    dataKey="percentage"
                    fill="#4F46E5"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* 4. HOW IT WORKS 4-STEP WORKFLOW (Section 14) */}
          <section className="tech-spec-section">
            <h2 className="tech-section-title">How It Works</h2>
            <div className="workflow-steps-grid">
              <div className="step-card">
                <div className="step-number">Step 1</div>
                <div className="step-title">Booking Information</div>
                <p className="step-text">
                  Reservation parameters are collected from the client, including stay dates, party size, lead time, room tiers, and customer category.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">Step 2</div>
                <div className="step-title">Feature Preprocessing</div>
                <p className="step-text">
                  Numerical features are imputed with medians; categorical fields are one-hot encoded using a scikit-learn ColumnTransformer fitted exclusively on training data.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">Step 3</div>
                <div className="step-title">Random Forest Inference</div>
                <p className="step-text">
                  An ensemble of 100 decision trees evaluates the feature vector and averages their predictions to determine the expected ADR in EUR.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">Step 4</div>
                <div className="step-title">Currency & Total Cost</div>
                <p className="step-text">
                  The predicted rate is converted to INR (at 1 EUR = ₹100), and stay totals are calculated across weekend and weekday nights for intuitive presentation.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

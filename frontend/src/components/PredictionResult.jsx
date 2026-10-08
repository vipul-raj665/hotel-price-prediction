import React from 'react';

export default function PredictionResult({ result, bookingDetails }) {
  if (!result) return null;

  const totalGuests = (bookingDetails?.adults || 1) + (bookingDetails?.children || 0) + (bookingDetails?.babies || 0);

  return (
    <div className="prediction-result-wrapper" id="prediction-result">
      {/* Primary Result Box */}
      <div className="prediction-result-card">
        <div className="prediction-result-header">
          <div className="result-tag">Estimated Price</div>
          <div className="price-inr-headline">
            ₹{result.predicted_price_inr.toLocaleString()}
            <span className="price-inr-subtext"> / night</span>
          </div>
          <div className="model-adr-eur-tag">
            Source ADR: €{result.predicted_adr_eur.toFixed(2)}
          </div>
        </div>

        <div className="prediction-metrics-row">
          <div className="prediction-metric-box">
            <div className="prediction-metric-title">Estimated Range</div>
            <div className="prediction-metric-val">
              ₹{result.lower_price_inr.toLocaleString()} – ₹{result.upper_price_inr.toLocaleString()}
            </div>
            <div className="metric-subnote">per night</div>
          </div>

          <div className="prediction-metric-box highlight-total">
            <div className="prediction-metric-title">Estimated Stay Cost</div>
            <div className="prediction-metric-val green">
              ₹{result.estimated_total_stay_cost.toLocaleString()}
            </div>
            <div className="metric-subnote">
              for {result.total_nights} {result.total_nights === 1 ? 'night' : 'nights'}
            </div>
          </div>

          <div className="prediction-metric-box">
            <div className="prediction-metric-title">Total Nights</div>
            <div className="prediction-metric-val">
              {result.total_nights}
            </div>
            <div className="metric-subnote">stay duration</div>
          </div>
        </div>

        {/* Visual Booking Summary as specified in Section 20 */}
        <div className="booking-summary-block">
          <div className="summary-title">Booking Summary</div>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Hotel Type:</span>
              <span className="summary-val">{bookingDetails?.hotel_type || 'City Hotel'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Destination City:</span>
              <span className="summary-val">{bookingDetails?.city || 'Mumbai'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Arrival:</span>
              <span className="summary-val">{bookingDetails?.arrival_date_month || 'July'} {bookingDetails?.arrival_date_year || 2024}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Guests:</span>
              <span className="summary-val">{bookingDetails?.adults || 2} Adult{bookingDetails?.adults === 1 ? '' : 's'}{bookingDetails?.children ? `, ${bookingDetails.children} Child` : ''}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Stay:</span>
              <span className="summary-val">{result.total_nights} Nights ({bookingDetails?.stays_in_weekend_nights || 0} w/e, {bookingDetails?.stays_in_week_nights || 0} w/d)</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Room Category:</span>
              <span className="summary-val">Category {bookingDetails?.reserved_room_type || 'A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

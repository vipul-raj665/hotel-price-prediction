import React, { useState, useEffect } from 'react';
import { predictPrice } from '../services/api';

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Goa', 'Jaipur', 'Hyderabad',
  'Pune', 'Kolkata', 'Chennai', 'Ahmedabad', 'Chandigarh',
  'Kochi', 'Lucknow', 'Bhopal', 'Indore'
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PRESETS = [
  {
    label: '🏖️ Vacation in Goa',
    data: {
      hotel_type: 'Resort Hotel',
      city: 'Goa',
      arrival_date_year: 2024,
      arrival_date_month: 'July',
      lead_time: 45,
      stays_in_weekend_nights: 2,
      stays_in_week_nights: 3,
      adults: 2,
      children: 1,
      babies: 0,
      meal: 'HB',
      country: 'IND',
      market_segment: 'Online TA',
      distribution_channel: 'TA/TO',
      is_repeated_guest: 0,
      previous_cancellations: 0,
      previous_bookings_not_canceled: 0,
      reserved_room_type: 'D',
      assigned_room_type: 'D',
      booking_changes: 0,
      deposit_type: 'No Deposit',
      days_in_waiting_list: 0,
      customer_type: 'Transient',
      required_car_parking_spaces: 1,
      total_of_special_requests: 2,
    }
  },
  {
    label: '💼 Business in Mumbai',
    data: {
      hotel_type: 'City Hotel',
      city: 'Mumbai',
      arrival_date_year: 2024,
      arrival_date_month: 'September',
      lead_time: 14,
      stays_in_weekend_nights: 0,
      stays_in_week_nights: 2,
      adults: 1,
      children: 0,
      babies: 0,
      meal: 'BB',
      country: 'IND',
      market_segment: 'Corporate',
      distribution_channel: 'Corporate',
      is_repeated_guest: 1,
      previous_cancellations: 0,
      previous_bookings_not_canceled: 2,
      reserved_room_type: 'A',
      assigned_room_type: 'A',
      booking_changes: 0,
      deposit_type: 'No Deposit',
      days_in_waiting_list: 0,
      customer_type: 'Transient',
      required_car_parking_spaces: 1,
      total_of_special_requests: 1,
    }
  },
  {
    label: '🏰 Tourism in Jaipur',
    data: {
      hotel_type: 'Resort Hotel',
      city: 'Jaipur',
      arrival_date_year: 2024,
      arrival_date_month: 'December',
      lead_time: 60,
      stays_in_weekend_nights: 2,
      stays_in_week_nights: 2,
      adults: 2,
      children: 0,
      babies: 0,
      meal: 'BB',
      country: 'GBR',
      market_segment: 'Direct',
      distribution_channel: 'Direct',
      is_repeated_guest: 0,
      previous_cancellations: 0,
      previous_bookings_not_canceled: 0,
      reserved_room_type: 'E',
      assigned_room_type: 'E',
      booking_changes: 0,
      deposit_type: 'No Deposit',
      days_in_waiting_list: 0,
      customer_type: 'Transient',
      required_car_parking_spaces: 0,
      total_of_special_requests: 3,
    }
  }
];

const INITIAL_FORM = {
  hotel_type: 'City Hotel',
  city: 'Mumbai',
  arrival_date_year: 2024,
  arrival_date_month: 'July',
  lead_time: 30,
  stays_in_weekend_nights: 1,
  stays_in_week_nights: 2,
  adults: 2,
  children: 0,
  babies: 0,
  meal: 'BB',
  country: 'IND',
  market_segment: 'Online TA',
  distribution_channel: 'TA/TO',
  is_repeated_guest: 0,
  previous_cancellations: 0,
  previous_bookings_not_canceled: 0,
  reserved_room_type: 'A',
  assigned_room_type: 'A',
  booking_changes: 0,
  deposit_type: 'No Deposit',
  days_in_waiting_list: 0,
  customer_type: 'Transient',
  required_car_parking_spaces: 0,
  total_of_special_requests: 1,
};

export default function Predictor() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [result, setResult] = useState(null);
  const [lastSubmitted, setLastSubmitted] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  useEffect(() => {
    document.title = 'Hotel Price Prediction | Predictor';
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
    setActivePreset(null);
  };

  const handleApplyPreset = (preset, index) => {
    setFormData({ ...preset.data });
    setActivePreset(index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const data = await predictPrice(formData);
      setResult(data);
      setLastSubmitted({ ...formData });
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.message || 'Unable to generate prediction. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setResult(null);
    setLastSubmitted(null);
    setActivePreset(null);
    setError(null);
  };

  return (
    <div className="predictor-view">
      <div className="view-header">
        <h1 className="view-title">Hotel Price Predictor</h1>
        <p className="view-subtitle">
          Configure booking parameters to generate an instant nightly room price estimate.
        </p>
      </div>

      {error && <div className="system-error-banner">{error}</div>}

      {/* TWO-COLUMN LAYOUT (Section 9) */}
      <div className="predictor-two-column-layout">
        {/* LEFT COLUMN: Booking Information Form */}
        <div className="predictor-form-column">
          {/* Quick Presets Bar */}
          <div className="sample-presets-bar">
            <span className="presets-label">Quick Scenarios:</span>
            <div className="presets-list">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`preset-pill ${activePreset === idx ? 'active' : ''}`}
                  onClick={() => handleApplyPreset(preset, idx)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="booking-info-form">
            {/* SECTION 1: Stay Details */}
            <div className="form-sub-section">
              <div className="form-sub-section-title">Stay Details</div>
              <div className="form-fields-grid-3">
                <div className="input-group">
                  <label htmlFor="hotel_type">Hotel Type</label>
                  <select
                    id="hotel_type"
                    name="hotel_type"
                    value={formData.hotel_type}
                    onChange={handleChange}
                  >
                    <option value="City Hotel">City Hotel</option>
                    <option value="Resort Hotel">Resort Hotel</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="city">Destination City</label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="arrival_date_year">Arrival Year</label>
                  <select
                    id="arrival_date_year"
                    name="arrival_date_year"
                    value={formData.arrival_date_year}
                    onChange={handleChange}
                  >
                    <option value={2024}>2024</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="arrival_date_month">Arrival Month</label>
                  <select
                    id="arrival_date_month"
                    name="arrival_date_month"
                    value={formData.arrival_date_month}
                    onChange={handleChange}
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="stays_in_weekend_nights">Weekend Nights</label>
                  <input
                    id="stays_in_weekend_nights"
                    name="stays_in_weekend_nights"
                    type="number"
                    min="0"
                    max="14"
                    value={formData.stays_in_weekend_nights}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="stays_in_week_nights">Week Nights</label>
                  <input
                    id="stays_in_week_nights"
                    name="stays_in_week_nights"
                    type="number"
                    min="0"
                    max="30"
                    value={formData.stays_in_week_nights}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Guests */}
            <div className="form-sub-section">
              <div className="form-sub-section-title">Guests</div>
              <div className="form-fields-grid-4">
                <div className="input-group">
                  <label htmlFor="adults">Adults</label>
                  <input
                    id="adults"
                    name="adults"
                    type="number"
                    min="1"
                    max="6"
                    value={formData.adults}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="children">Children</label>
                  <input
                    id="children"
                    name="children"
                    type="number"
                    min="0"
                    max="6"
                    value={formData.children}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="babies">Babies</label>
                  <input
                    id="babies"
                    name="babies"
                    type="number"
                    min="0"
                    max="4"
                    value={formData.babies}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="is_repeated_guest">Repeated Guest</label>
                  <select
                    id="is_repeated_guest"
                    name="is_repeated_guest"
                    value={formData.is_repeated_guest}
                    onChange={handleChange}
                  >
                    <option value={0}>No (First Visit)</option>
                    <option value={1}>Yes (Returning)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3: Booking */}
            <div className="form-sub-section">
              <div className="form-sub-section-title">Booking</div>
              <div className="form-fields-grid-3">
                <div className="input-group">
                  <label htmlFor="lead_time">Lead Time (Days)</label>
                  <input
                    id="lead_time"
                    name="lead_time"
                    type="number"
                    min="0"
                    max="700"
                    value={formData.lead_time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="meal">Meal</label>
                  <select
                    id="meal"
                    name="meal"
                    value={formData.meal}
                    onChange={handleChange}
                  >
                    <option value="BB">Bed & Breakfast (BB)</option>
                    <option value="HB">Half Board (HB)</option>
                    <option value="FB">Full Board (FB)</option>
                    <option value="SC">Self Catering (SC)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="market_segment">Market Segment</label>
                  <select
                    id="market_segment"
                    name="market_segment"
                    value={formData.market_segment}
                    onChange={handleChange}
                  >
                    <option value="Online TA">Online TA</option>
                    <option value="Offline TA/TO">Offline TA/TO</option>
                    <option value="Direct">Direct</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Groups">Groups</option>
                    <option value="Aviation">Aviation</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="distribution_channel">Distribution Channel</label>
                  <select
                    id="distribution_channel"
                    name="distribution_channel"
                    value={formData.distribution_channel}
                    onChange={handleChange}
                  >
                    <option value="TA/TO">TA/TO</option>
                    <option value="Direct">Direct</option>
                    <option value="Corporate">Corporate</option>
                    <option value="GDS">GDS</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="customer_type">Customer Type</label>
                  <select
                    id="customer_type"
                    name="customer_type"
                    value={formData.customer_type}
                    onChange={handleChange}
                  >
                    <option value="Transient">Transient</option>
                    <option value="Contract">Contract</option>
                    <option value="Transient-Party">Transient-Party</option>
                    <option value="Group">Group</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="deposit_type">Deposit Type</label>
                  <select
                    id="deposit_type"
                    name="deposit_type"
                    value={formData.deposit_type}
                    onChange={handleChange}
                  >
                    <option value="No Deposit">No Deposit</option>
                    <option value="Non Refund">Non Refundable</option>
                    <option value="Refundable">Refundable</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 4: Room */}
            <div className="form-sub-section">
              <div className="form-sub-section-title">Room & Requests</div>
              <div className="form-fields-grid-3">
                <div className="input-group">
                  <label htmlFor="reserved_room_type">Reserved Room Type</label>
                  <select
                    id="reserved_room_type"
                    name="reserved_room_type"
                    value={formData.reserved_room_type}
                    onChange={handleChange}
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'L'].map((r) => (
                      <option key={r} value={r}>Category {r}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="assigned_room_type">Assigned Room Type</label>
                  <select
                    id="assigned_room_type"
                    name="assigned_room_type"
                    value={formData.assigned_room_type}
                    onChange={handleChange}
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L'].map((r) => (
                      <option key={r} value={r}>Category {r}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="booking_changes">Booking Changes</label>
                  <input
                    id="booking_changes"
                    name="booking_changes"
                    type="number"
                    min="0"
                    max="20"
                    value={formData.booking_changes}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="required_car_parking_spaces">Parking Spaces</label>
                  <input
                    id="required_car_parking_spaces"
                    name="required_car_parking_spaces"
                    type="number"
                    min="0"
                    max="5"
                    value={formData.required_car_parking_spaces}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="total_of_special_requests">Special Requests</label>
                  <input
                    id="total_of_special_requests"
                    name="total_of_special_requests"
                    type="number"
                    min="0"
                    max="5"
                    value={formData.total_of_special_requests}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* FULL-WIDTH PROMINENT PREDICT BUTTON (Section 10) */}
            <div className="form-submit-row">
              <button
                type="submit"
                id="btn-predict-action"
                className="btn-predict-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="button-spinner" />
                    Calculating Rate...
                  </>
                ) : (
                  'Predict Hotel Price'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Sticky Prediction Result Panel (Section 9) */}
        <div className="predictor-result-column">
          <div className="sticky-prediction-panel">
            {!result ? (
              <div className="prediction-placeholder-state">
                <div className="placeholder-icon">🏨</div>
                <div className="placeholder-title">Hotel Price Estimate</div>
                <p className="placeholder-text">
                  Enter booking details on the left and click <strong>Predict Hotel Price</strong> to generate a machine learning estimate.
                </p>
                <div className="placeholder-tips">
                  <div className="tip-header">Quick tip:</div>
                  <div className="tip-body">
                    Choose one of the sample scenarios above to populate typical booking configurations.
                  </div>
                </div>
              </div>
            ) : (
              <div className="prediction-active-result animate-fade-in">
                <div className="result-headline-card">
                  <div className="result-super-label">ESTIMATED NIGHTLY PRICE</div>
                  <div className="result-big-price">
                    ₹{result.predicted_price_inr.toLocaleString()}
                    <span className="result-per-night"> /night</span>
                  </div>
                  <div className="result-source-eur">
                    Source ADR: €{result.predicted_adr_eur.toFixed(2)}
                  </div>
                </div>

                <div className="result-details-grid">
                  <div className="result-detail-box">
                    <div className="detail-box-label">ESTIMATED RANGE</div>
                    <div className="detail-box-val">
                      ₹{result.lower_price_inr.toLocaleString()} – ₹{result.upper_price_inr.toLocaleString()}
                    </div>
                    <div className="detail-box-note">per night</div>
                  </div>

                  <div className="result-detail-box highlight">
                    <div className="detail-box-label">ESTIMATED STAY</div>
                    <div className="detail-box-val green">
                      ₹{result.estimated_total_stay_cost.toLocaleString()}
                    </div>
                    <div className="detail-box-note">
                      for {result.total_nights} {result.total_nights === 1 ? 'night' : 'nights'}
                    </div>
                  </div>
                </div>

                {/* BOOKING SUMMARY BLOCK */}
                <div className="result-summary-card">
                  <div className="summary-card-title">Booking Summary</div>
                  <div className="summary-items-list">
                    <div className="summary-item-row">
                      <span className="summary-lbl">Hotel:</span>
                      <span className="summary-val">{lastSubmitted?.hotel_type} ({lastSubmitted?.city})</span>
                    </div>
                    <div className="summary-item-row">
                      <span className="summary-lbl">Arrival:</span>
                      <span className="summary-val">{lastSubmitted?.arrival_date_month} {lastSubmitted?.arrival_date_year}</span>
                    </div>
                    <div className="summary-item-row">
                      <span className="summary-lbl">Guests:</span>
                      <span className="summary-val">
                        {lastSubmitted?.adults} Adult{lastSubmitted?.adults > 1 ? 's' : ''}
                        {lastSubmitted?.children ? `, ${lastSubmitted.children} Child` : ''}
                      </span>
                    </div>
                    <div className="summary-item-row">
                      <span className="summary-lbl">Stay Duration:</span>
                      <span className="summary-val">
                        {result.total_nights} Nights ({lastSubmitted?.stays_in_weekend_nights} w/e, {lastSubmitted?.stays_in_week_nights} w/d)
                      </span>
                    </div>
                    <div className="summary-item-row">
                      <span className="summary-lbl">Room:</span>
                      <span className="summary-val">Category {lastSubmitted?.reserved_room_type}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-reset-light"
                  onClick={handleReset}
                >
                  Reset Form & Values
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';

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
    label: '💼 Business Trip (Mumbai)',
    data: {
      hotel_type: 'City Hotel',
      city: 'Mumbai',
      arrival_date_year: 2024,
      arrival_date_month: 'September',
      lead_time: 15,
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
    label: '🏖️ Family Vacation (Goa)',
    data: {
      hotel_type: 'Resort Hotel',
      city: 'Goa',
      arrival_date_year: 2024,
      arrival_date_month: 'July',
      lead_time: 60,
      stays_in_weekend_nights: 2,
      stays_in_week_nights: 4,
      adults: 2,
      children: 2,
      babies: 0,
      meal: 'HB',
      country: 'IND',
      market_segment: 'Online TA',
      distribution_channel: 'TA/TO',
      is_repeated_guest: 0,
      previous_cancellations: 0,
      previous_bookings_not_canceled: 0,
      reserved_room_type: 'E',
      assigned_room_type: 'E',
      booking_changes: 1,
      deposit_type: 'No Deposit',
      days_in_waiting_list: 0,
      customer_type: 'Transient',
      required_car_parking_spaces: 1,
      total_of_special_requests: 2,
    }
  },
  {
    label: '🏰 Heritage Tourism (Jaipur)',
    data: {
      hotel_type: 'Resort Hotel',
      city: 'Jaipur',
      arrival_date_year: 2024,
      arrival_date_month: 'December',
      lead_time: 45,
      stays_in_weekend_nights: 2,
      stays_in_week_nights: 1,
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
      reserved_room_type: 'D',
      assigned_room_type: 'D',
      booking_changes: 0,
      deposit_type: 'No Deposit',
      days_in_waiting_list: 0,
      customer_type: 'Transient',
      required_car_parking_spaces: 0,
      total_of_special_requests: 3,
    }
  },
  {
    label: '🏢 Conference / Group (Delhi)',
    data: {
      hotel_type: 'City Hotel',
      city: 'Delhi',
      arrival_date_year: 2024,
      arrival_date_month: 'November',
      lead_time: 90,
      stays_in_weekend_nights: 1,
      stays_in_week_nights: 3,
      adults: 2,
      children: 0,
      babies: 0,
      meal: 'BB',
      country: 'IND',
      market_segment: 'Groups',
      distribution_channel: 'TA/TO',
      is_repeated_guest: 0,
      previous_cancellations: 0,
      previous_bookings_not_canceled: 0,
      reserved_room_type: 'A',
      assigned_room_type: 'A',
      booking_changes: 2,
      deposit_type: 'Non Refund',
      days_in_waiting_list: 0,
      customer_type: 'Group',
      required_car_parking_spaces: 0,
      total_of_special_requests: 0,
    }
  }
];

const INITIAL_FORM_STATE = {
  hotel_type: 'City Hotel',
  city: 'Mumbai',
  arrival_date_year: 2024,
  arrival_date_month: 'July',
  lead_time: 50,
  stays_in_weekend_nights: 1,
  stays_in_week_nights: 3,
  adults: 2,
  children: 0,
  babies: 0,
  meal: 'BB',
  country: 'PRT',
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

export default function PredictionForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [activePreset, setActivePreset] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setActivePreset(null);
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleApplyPreset = (preset, index) => {
    setFormData(preset.data);
    setActivePreset(index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      hotel: `${formData.hotel_type} - ${formData.city}`,
    };
    onSubmit(payload);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setActivePreset(null);
  };

  return (
    <form onSubmit={handleSubmit} id="prediction-form">
      {/* Quick Sample Presets */}
      <div className="preset-bar">
        <span className="preset-label">Quick Sample Scenarios:</span>
        <div className="preset-chips">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              className={`preset-chip ${activePreset === i ? 'active' : ''}`}
              onClick={() => handleApplyPreset(p, i)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: Stay Details */}
      <div className="form-section-card">
        <div className="form-section-header">
          <div className="form-section-step">1</div>
          <div>
            <div className="form-section-title">Stay Details</div>
            <div className="form-section-desc">Hotel type, destination city, arrival period, and nights</div>
          </div>
        </div>
        <div className="form-grid-3">
          <div className="form-group">
            <label htmlFor="hotel_type">Hotel Property Type</label>
            <select
              id="hotel_type"
              name="hotel_type"
              value={formData.hotel_type}
              onChange={handleChange}
            >
              <option value="City Hotel">City Hotel (Urban Business)</option>
              <option value="Resort Hotel">Resort Hotel (Holiday & Leisure)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="city">Destination City (15 Dataset Cities)</label>
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

          <div className="form-group">
            <label htmlFor="arrival_date_year">Arrival Year</label>
            <select
              id="arrival_date_year"
              name="arrival_date_year"
              value={formData.arrival_date_year}
              onChange={handleChange}
            >
              <option value={2024}>2024 (Updated Dataset)</option>
            </select>
          </div>

          <div className="form-group">
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

          <div className="form-group">
            <label htmlFor="stays_in_weekend_nights">Weekend Nights (Sat / Sun)</label>
            <input
              id="stays_in_weekend_nights"
              name="stays_in_weekend_nights"
              type="number"
              min="0"
              max="20"
              value={formData.stays_in_weekend_nights}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stays_in_week_nights">Weekday Nights (Mon – Fri)</label>
            <input
              id="stays_in_week_nights"
              name="stays_in_week_nights"
              type="number"
              min="0"
              max="50"
              value={formData.stays_in_week_nights}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Guest Details */}
      <div className="form-section-card">
        <div className="form-section-header">
          <div className="form-section-step">2</div>
          <div>
            <div className="form-section-title">Guest Details</div>
            <div className="form-section-desc">Occupancy headcount and guest loyalty history</div>
          </div>
        </div>
        <div className="form-grid-3">
          <div className="form-group">
            <label htmlFor="adults">Adult Guests</label>
            <input
              id="adults"
              name="adults"
              type="number"
              min="1"
              max="10"
              value={formData.adults}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="children">Children</label>
            <input
              id="children"
              name="children"
              type="number"
              min="0"
              max="10"
              value={formData.children}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="babies">Babies</label>
            <input
              id="babies"
              name="babies"
              type="number"
              min="0"
              max="10"
              value={formData.babies}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="is_repeated_guest">Guest Loyalty Status</label>
            <select
              id="is_repeated_guest"
              name="is_repeated_guest"
              value={formData.is_repeated_guest}
              onChange={handleChange}
            >
              <option value={0}>First-time Guest (0)</option>
              <option value={1}>Repeated Returning Guest (1)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="previous_cancellations">Previous Cancellations</label>
            <input
              id="previous_cancellations"
              name="previous_cancellations"
              type="number"
              min="0"
              max="30"
              value={formData.previous_cancellations}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="previous_bookings_not_canceled">Previous Completed Bookings</label>
            <input
              id="previous_bookings_not_canceled"
              name="previous_bookings_not_canceled"
              type="number"
              min="0"
              max="80"
              value={formData.previous_bookings_not_canceled}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Booking Details */}
      <div className="form-section-card">
        <div className="form-section-header">
          <div className="form-section-step">3</div>
          <div>
            <div className="form-section-title">Booking Details</div>
            <div className="form-section-desc">Lead time, meal plan, market segment, and deposit policy</div>
          </div>
        </div>
        <div className="form-grid-3">
          <div className="form-group">
            <label htmlFor="lead_time">Lead Time (Days Booked in Advance)</label>
            <input
              id="lead_time"
              name="lead_time"
              type="number"
              min="0"
              max="737"
              value={formData.lead_time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="meal">Meal Board Plan</label>
            <select
              id="meal"
              name="meal"
              value={formData.meal}
              onChange={handleChange}
            >
              <option value="BB">Bed & Breakfast (BB)</option>
              <option value="HB">Half Board (HB - Breakfast & Dinner)</option>
              <option value="FB">Full Board (FB - All Meals)</option>
              <option value="SC">Self Catering (SC - Room Only)</option>
              <option value="Undefined">Undefined</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="market_segment">Market Segment</label>
            <select
              id="market_segment"
              name="market_segment"
              value={formData.market_segment}
              onChange={handleChange}
            >
              <option value="Online TA">Online Travel Agent (Online TA)</option>
              <option value="Offline TA/TO">Offline Travel Agency / Tour Operator</option>
              <option value="Direct">Direct Reservation</option>
              <option value="Corporate">Corporate Business Contract</option>
              <option value="Groups">Tour Group Booking</option>
              <option value="Aviation">Aviation Crew</option>
              <option value="Complementary">Complementary</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="distribution_channel">Distribution Channel</label>
            <select
              id="distribution_channel"
              name="distribution_channel"
              value={formData.distribution_channel}
              onChange={handleChange}
            >
              <option value="TA/TO">Travel Agent / Tour Operator (TA/TO)</option>
              <option value="Direct">Direct Channel</option>
              <option value="Corporate">Corporate Channel</option>
              <option value="GDS">Global Distribution System (GDS)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="customer_type">Customer Type</label>
            <select
              id="customer_type"
              name="customer_type"
              value={formData.customer_type}
              onChange={handleChange}
            >
              <option value="Transient">Transient (Individual)</option>
              <option value="Contract">Contract Allotment</option>
              <option value="Transient-Party">Transient Party</option>
              <option value="Group">Group Booking</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="deposit_type">Deposit Policy</label>
            <select
              id="deposit_type"
              name="deposit_type"
              value={formData.deposit_type}
              onChange={handleChange}
            >
              <option value="No Deposit">No Deposit Required</option>
              <option value="Non Refund">Non Refundable Deposit</option>
              <option value="Refundable">Refundable Deposit</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 4: Room & Requests */}
      <div className="form-section-card">
        <div className="form-section-header">
          <div className="form-section-step">4</div>
          <div>
            <div className="form-section-title">Room & Requests</div>
            <div className="form-section-desc">Room categories, booking changes, parking spaces, and requests</div>
          </div>
        </div>
        <div className="form-grid-3">
          <div className="form-group">
            <label htmlFor="reserved_room_type">Reserved Room Category</label>
            <select
              id="reserved_room_type"
              name="reserved_room_type"
              value={formData.reserved_room_type}
              onChange={handleChange}
            >
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'L'].map((r) => (
                <option key={r} value={r}>Category {r} {r === 'A' ? '(Standard)' : r === 'D' ? '(Deluxe)' : r === 'E' ? '(Suite)' : ''}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="assigned_room_type">Assigned Room Category</label>
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

          <div className="form-group">
            <label htmlFor="booking_changes">Booking Changes Count</label>
            <input
              id="booking_changes"
              name="booking_changes"
              type="number"
              min="0"
              max="25"
              value={formData.booking_changes}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="required_car_parking_spaces">Car Parking Spaces</label>
            <input
              id="required_car_parking_spaces"
              name="required_car_parking_spaces"
              type="number"
              min="0"
              max="8"
              value={formData.required_car_parking_spaces}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="total_of_special_requests">Special Requests Count</label>
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

      <div className="form-action-bar">
        <button
          type="submit"
          id="btn-predict"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading && <span className="spinner" />}
          {isLoading ? 'Estimating Price...' : 'Predict Hotel Price (₹)'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset to Defaults
        </button>
      </div>
    </form>
  );
}

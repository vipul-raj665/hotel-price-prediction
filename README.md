# Hotel Price Prediction & Analytics System

**Subtitle:** Hotel Price Prediction using Classical Machine Learning on the Updated 2024 Dataset

---

## 1. Project Overview
The **Hotel Price Prediction & Analytics System** is a classical Machine Learning system designed to predict hotel **Average Daily Rate (ADR)** and deliver actionable pricing analytics. Built using Python, Scikit-learn, FastAPI, React, and Recharts, the application provides an interactive pricing engine where predicted rates are displayed primarily in **₹ INR / night**.

---

## 2. Objective
To accurately estimate hotel nightly room rates from booking-time parameters, identify key determinants of accommodation pricing, and present clear prediction intervals and stay cost calculations without artificial or uncalibrated confidence percentages.

---

## 3. Dataset & Source
- **Dataset:** Hotel Booking Reservation — Updated 2024 Dataset
- **Creator:** Kundan Sagar Bedmutha
- **Source:** [Kaggle: kundanbedmutha/hotel-booking-reservation](https://www.kaggle.com/datasets/kundanbedmutha/hotel-booking-reservation)
- **Local File:** `data/hotel_booking_reservation.csv` (21.2 MB)

---

## 4. Dataset Size & Period
- **Total Records:** 119,390 records
- **Raw Columns:** 33 columns (including destination `city`)
- **Coverage Period:** 2024 (January 2024 – December 2024)

> **Important Fact:**  
> "The project uses the Hotel Booking Reservation updated 2024 dataset. The dataset covers bookings from 2022 to 2024 and contains approximately 119,390 records and 33 columns.  
> ADR is recorded in EUR in the source dataset. The model is trained on the source ADR values and predictions are converted to INR using the configurable EUR_TO_INR conversion rate for user-facing display."

---

## 5. Target Variable
- **Target:** `adr` (Average Daily Rate).
- Recorded in **EUR (€)** in the source dataset.
- Evaluated and trained on original EUR values, converted to INR for user-facing presentations.

---

## 6. Features & Feature Engineering

### 11 Categorical Features:
1. **hotel:** Combined property and location (e.g., `City Hotel - Mumbai`, `Resort Hotel - Goa`).
2. **city:** Destination city (15 Indian metropolitan and tourism centers: Ahmedabad, Bangalore, Bhopal, Chandigarh, Chennai, Delhi, Goa, Hyderabad, Indore, Jaipur, Kochi, Kolkata, Lucknow, Mumbai, Pune).
3. **arrival_date_month:** Month of check-in (January to December).
4. **meal:** Meal plan (BB, HB, FB, SC, Undefined).
5. **country:** Origin country (ISO alpha-3 code).
6. **market_segment:** Channel segment (Online TA, Offline TA/TO, Direct, Corporate, Groups, Aviation, Complementary).
7. **distribution_channel:** Distribution channel (TA/TO, Direct, Corporate, GDS).
8. **reserved_room_type:** Code of room type reserved (A through L).
9. **assigned_room_type:** Code of room type assigned (A through L).
10. **deposit_type:** Guarantee deposit structure (No Deposit, Non Refund, Refundable).
11. **customer_type:** Booking type (Transient, Contract, Transient-Party, Group).

### 16 Numerical Features:
1. **lead_time:** Days between booking creation and arrival date.
2. **arrival_date_year:** Arrival year (2024).
3. **stays_in_weekend_nights:** Number of weekend nights (Saturday / Sunday).
4. **stays_in_week_nights:** Number of week nights (Monday to Friday).
5. **total_nights** *(Derived Feature)*: `stays_in_weekend_nights + stays_in_week_nights`.
6. **adults:** Number of adult guests.
7. **children:** Number of children.
8. **babies:** Number of babies.
9. **total_guests** *(Derived Feature)*: `adults + children + babies`.
10. **is_repeated_guest:** Prior guest stay flag (0 = No, 1 = Yes).
11. **previous_cancellations:** Number of prior cancelled reservations.
12. **previous_bookings_not_canceled:** Previous completed non-cancelled stays.
13. **booking_changes:** Modifications made between booking and check-in.
14. **days_in_waiting_list:** Days on reservation waiting list.
15. **required_car_parking_spaces:** Vehicle parking spaces requested.
16. **total_of_special_requests:** Special guest requests submitted.

---

## 7. Data Leakage Prevention
To prevent data leakage, post-booking outcome attributes are strictly excluded from prediction inputs:
- **`adr`:** Target variable, excluded from $X$.
- **`reservation_status`:** Check-Out / Canceled / No-Show outcome, unknown at booking time.
- **`reservation_status_date`:** Date on which the outcome status was recorded.
- **`is_canceled`:** Cancellation outcome flag.
- **`agent` & `company`:** Excluded due to excessive sparsity (>94% missing values for company).

---

## 8. Data Preprocessing Pipeline
1. **Cleaning:**
   - Filter invalid target values: negative values and extreme data-entry typo outliers (`adr > 0` and `adr < 5000`).
   - Cleaned dataset yields 117,429 valid records.
2. **ColumnTransformer Pipeline:**
   - **Numerical Features (16):** Imputed with median (`SimpleImputer(strategy='median')`).
   - **Categorical Features (11):** Imputed with `"Unknown"`, followed by One-Hot Encoding (`OneHotEncoder(handle_unknown='ignore', sparse_output=False)`).
3. **Train-Fit Isolation:** Preprocessing pipeline is fitted **only on the training split** (80%) and transforms both train and test splits independently.

---

## 9. Machine Learning Algorithm & Train/Test Split
- **Algorithm:** Classical `RandomForestRegressor` (`scikit-learn`).
- **Configuration:**
  - `n_estimators = 100`
  - `max_depth = 22`
  - `random_state = 42`
  - `n_jobs = -1`
- **Split:** 80% training (93,943 records) / 20% testing (23,486 records) with `random_state = 42`.

---

## 10. Evaluation Metrics (Test Set Ground Truth)
Evaluated on the 20% test split:

| Metric | Value (EUR) | Approx. INR Value | Definition |
|---|---|---|---|
| **MAE** | **€20.19** | **₹2,019** | Average absolute deviation in nightly rate |
| **RMSE** | **€30.57** | **₹3,057** | Penalizes larger prediction errors |
| **R²** | **0.5753** | — | Proportion of pricing variance captured |
| **MAPE** | **25.83%** | — | Mean absolute percentage error |

---

## 11. Prediction Range Methodology
As this is a classical regression task, no artificial "95% confidence" percentages are used. Instead, the Random Forest computes an **Estimated Prediction Range** by evaluating individual predictions from all 100 decision trees:
- **Point Prediction:** Mean of tree predictions.
- **Estimated Range:** 10th percentile to 90th percentile of tree estimates.
- **INR Display:** Converted directly to INR (e.g., ₹10,300 – ₹12,900 / night).

---

## 12. EUR → INR Currency Conversion
- Configured in [backend/config.py](file:///c:/Users/Lenovo/Desktop/hotel-price-prediction/backend/config.py): `EUR_TO_INR = 100`
- Converted Price: $\text{Price}_{\text{INR}} = \text{ADR}_{\text{EUR}} \times 100$
- Estimated Total Stay Cost: $\text{Total Cost} = \text{Price}_{\text{INR}} \times \text{Total Nights}$

---

## 13. Project Directory Structure
```
hotel-price-prediction/
│
├── backend/
│   ├── app.py                     # FastAPI REST API endpoints
│   ├── train.py                   # Model training and evaluation script
│   ├── data_loader.py             # Kaggle dataset loader and feature cleaner
│   ├── preprocessing.py          # Scikit-learn ColumnTransformer pipeline
│   ├── model.py                   # RandomForestRegressor model definition
│   ├── utils.py                   # Metrics, currency conversion, tree uncertainty
│   ├── config.py                  # Project paths, features, and EUR_TO_INR config
│   ├── requirements.txt           # Python dependencies
│   │
│   └── models/
│       ├── hotel_price_model.joblib   # Trained Random Forest Regressor
│       ├── preprocessor.joblib        # Fitted ColumnTransformer pipeline
│       └── model_metadata.json        # Test set metrics and model metadata
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx            # 230px left navigation sidebar
│   │   │   ├── MetricCard.jsx         # Metric display component
│   │   │   ├── PredictionForm.jsx     # 4-section structured booking form
│   │   │   ├── PredictionResult.jsx   # Prominent INR prediction result card
│   │   │   ├── ChartCard.jsx          # Recharts container with insight boxes
│   │   │   └── StatTable.jsx          # Reusable tabular statistics component
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Redesigned 4-metric dashboard
│   │   │   ├── Predictor.jsx          # Room price predictor page
│   │   │   ├── Analytics.jsx          # 6 compact analytics charts
│   │   │   └── Model.jsx              # Architecture & feature importance
│   │   │
│   │   ├── services/
│   │   │   └── api.js                 # Centralized fetch API service
│   │   │
│   │   ├── App.jsx                    # Root component with state management
│   │   ├── main.jsx                   # React entry point
│   │   └── App.css                    # College ML palette styling
│   │
│   ├── package.json                   # Dependencies (React, Vite, Recharts)
│   └── vite.config.js                 # Vite bundler config with API proxy
│
├── data/
│   └── hotel_booking_reservation.csv  # Updated 2024 dataset (119,390 rows)
│
├── README.md                          # Project documentation
└── .gitignore                         # Git ignore configuration
```

---

## 14. Installation & Setup

### 1. Backend Setup
```bash
# From project root
pip install -r backend/requirements.txt
```

### 2. Train the Model
```bash
python backend/train.py
```
This loads `data/hotel_booking_reservation.csv`, fits the preprocessor, trains `RandomForestRegressor`, evaluates on the test split, and outputs `hotel_price_model.joblib`, `preprocessor.joblib`, and `model_metadata.json`.

### 3. Start FastAPI Backend
```bash
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```
Backend will be live at: [http://127.0.0.1:8000](http://127.0.0.1:8000) (Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)).

### 4. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will be live at: [http://127.0.0.1:5173](http://127.0.0.1:5173).

---

## 15. Example Prediction Request & Response

### Request Payload (`POST /api/predict`)
```json
{
  "hotel": "City Hotel - Mumbai",
  "city": "Mumbai",
  "arrival_date_year": 2024,
  "arrival_date_month": "July",
  "lead_time": 50,
  "stays_in_weekend_nights": 1,
  "stays_in_week_nights": 3,
  "adults": 2,
  "children": 0,
  "babies": 0,
  "meal": "BB",
  "country": "PRT",
  "market_segment": "Online TA",
  "distribution_channel": "TA/TO",
  "is_repeated_guest": 0,
  "previous_cancellations": 0,
  "previous_bookings_not_canceled": 0,
  "reserved_room_type": "A",
  "assigned_room_type": "A",
  "booking_changes": 0,
  "deposit_type": "No Deposit",
  "days_in_waiting_list": 0,
  "customer_type": "Transient",
  "required_car_parking_spaces": 0,
  "total_of_special_requests": 1
}
```

### Response Payload
```json
{
  "predicted_adr_eur": 107.87,
  "lower_adr_eur": 97.40,
  "upper_adr_eur": 121.15,
  "predicted_price_inr": 10787,
  "lower_price_inr": 9740,
  "upper_price_inr": 12115,
  "currency": "INR",
  "currency_symbol": "₹",
  "total_nights": 4,
  "estimated_total_stay_cost": 43148
}
```

---

## 16. Limitations & Future Improvements
- **Static FX Assumption:** Uses fixed 1 EUR = ₹100 conversion for academic presentation; future iterations could incorporate real-time currency conversion APIs.
- **Inventory Bounds:** Does not simulate dynamic inventory caps (room sell-out scenarios).
- **Time Horizons:** Model is calibrated on 2024 reservations; multi-year cross-validation can be added as newer annual releases become available.

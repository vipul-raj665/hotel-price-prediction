import os
import sys
import json
import joblib
import pandas as pd
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure backend package imports correctly
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.config import (
    MODEL_PATH,
    PREPROCESSOR_PATH,
    METADATA_PATH,
    EUR_TO_INR,
    CURRENCY_CODE,
    CURRENCY_SYMBOL,
    CATEGORICAL_FEATURES,
    NUMERICAL_FEATURES,
)
from backend.utils import calculate_prediction_range, convert_eur_to_inr

app = FastAPI(
    title="Hotel Price Prediction & Analytics API",
    description="Classical ML API for predicting hotel Average Daily Rate (ADR)",
    version="2.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_model = None
_preprocessor = None
_metadata = None


def load_artifacts():
    global _model, _preprocessor, _metadata
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(PREPROCESSOR_PATH):
            _model = joblib.load(MODEL_PATH)
            _preprocessor = joblib.load(PREPROCESSOR_PATH)
            if os.path.exists(METADATA_PATH):
                with open(METADATA_PATH, "r", encoding="utf-8") as f:
                    _metadata = json.load(f)
            else:
                _metadata = {}
            print("Model artifacts and metadata loaded successfully.")
        else:
            print("Model files not found. Run 'python train.py' to generate artifacts.")
    except Exception as e:
        print(f"Error loading artifacts: {e}")


@app.on_event("startup")
def startup_event():
    load_artifacts()


# Preload on module import
load_artifacts()


class PredictionInput(BaseModel):
    hotel: str = Field("City Hotel - Mumbai", example="City Hotel - Mumbai")
    city: str = Field("Mumbai", example="Mumbai")
    arrival_date_year: int = Field(2024, example=2024)
    arrival_date_month: str = Field("July", example="July")
    lead_time: int = Field(50, example=50)
    stays_in_weekend_nights: int = Field(1, example=1)
    stays_in_week_nights: int = Field(3, example=3)
    adults: int = Field(2, example=2)
    children: float = Field(0.0, example=0.0)
    babies: int = Field(0, example=0)
    meal: str = Field("BB", example="BB")
    country: str = Field("PRT", example="PRT")
    market_segment: str = Field("Online TA", example="Online TA")
    distribution_channel: str = Field("TA/TO", example="TA/TO")
    is_repeated_guest: int = Field(0, example=0)
    previous_cancellations: int = Field(0, example=0)
    previous_bookings_not_canceled: int = Field(0, example=0)
    reserved_room_type: str = Field("A", example="A")
    assigned_room_type: str = Field("A", example="A")
    booking_changes: int = Field(0, example=0)
    deposit_type: str = Field("No Deposit", example="No Deposit")
    days_in_waiting_list: int = Field(0, example=0)
    customer_type: str = Field("Transient", example="Transient")
    required_car_parking_spaces: int = Field(0, example=0)
    total_of_special_requests: int = Field(1, example=1)


@app.get("/")
def root():
    return {
        "message": "Hotel Price Prediction & Analytics API is running",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get("/api/health")
def get_health():
    """
    Health check endpoint returning system status and model readiness.
    """
    global _model, _preprocessor
    if _model is None or _preprocessor is None:
        load_artifacts()
    is_ready = _model is not None and _preprocessor is not None
    return {
        "status": "ok",
        "model_loaded": is_ready,
    }


@app.get("/api/model-info")
def get_model_info():
    """
    Returns model specifications, dataset metrics, feature counts, and conversion parameters.
    """
    if _metadata is None:
        load_artifacts()

    if _metadata is None:
        raise HTTPException(
            status_code=503,
            detail="Model metadata is unavailable. Please run backend/train.py first."
        )

    return {
        "model_name": _metadata.get("model_name", "RandomForestRegressor"),
        "model_type": "Regression",
        "target": "ADR",
        "dataset_name": _metadata.get("dataset_name", "Hotel Booking Reservation — Updated 2024"),
        "dataset_records": _metadata.get("dataset_records", 119390),
        "cleaned_records": _metadata.get("cleaned_records", 117429),
        "training_records": _metadata.get("training_records", 93943),
        "testing_records": _metadata.get("testing_records", 23486),
        "num_features": _metadata.get("num_features", len(CATEGORICAL_FEATURES) + len(NUMERICAL_FEATURES)),
        "currency": CURRENCY_CODE,
        "currency_symbol": CURRENCY_SYMBOL,
        "eur_to_inr": EUR_TO_INR,
        "year_range": _metadata.get("year_range", "2022 – 2024"),
        "average_nightly_rate_inr": _metadata.get("average_nightly_rate_inr", 10349),
        "average_adr_eur": _metadata.get("average_adr_eur", 103.49),
        "hotels_count": _metadata.get("hotels_count", 2),
        "trained_at": _metadata.get("trained_at", "N/A"),
    }


@app.get("/api/metrics")
def get_metrics():
    """
    Returns real evaluation metrics calculated from the test set: MAE, RMSE, R2, MAPE.
    """
    if _metadata is None:
        load_artifacts()

    if not _metadata or "mae" not in _metadata:
        raise HTTPException(
            status_code=503,
            detail="Model metrics not found. Please train the model first."
        )

    mae_val = _metadata["mae"]
    rmse_val = _metadata["rmse"]

    return {
        "MAE": mae_val,
        "RMSE": rmse_val,
        "R2": _metadata["r2"],
        "MAPE": _metadata["mape"],
        "mae_inr": round(mae_val * EUR_TO_INR),
        "rmse_inr": round(rmse_val * EUR_TO_INR),
    }


@app.get("/api/feature-importance")
def get_feature_importance():
    """
    Returns top 10 most important features from RandomForestRegressor.feature_importances_.
    """
    if _metadata is None:
        load_artifacts()

    if not _metadata or "feature_importance" not in _metadata:
        raise HTTPException(
            status_code=503,
            detail="Feature importance not found. Please train the model first."
        )

    return _metadata["feature_importance"]


@app.get("/api/statistics")
def get_statistics():
    """
    Returns aggregated real statistics for dashboard and analytics charts:
    - Average ADR by hotel type
    - Average ADR by year (2022, 2023, 2024)
    - Average ADR by month
    - Average ADR by city
    - Average ADR by room type
    - Average ADR by market segment
    - Average ADR by customer type
    - Actual vs Predicted sample
    """
    if _metadata is None:
        load_artifacts()

    if not _metadata or "statistics" not in _metadata:
        raise HTTPException(
            status_code=503,
            detail="Dataset statistics not found. Please train the model first."
        )

    return _metadata["statistics"]


@app.post("/api/predict")
def predict_price(payload: PredictionInput):
    """
    Predicts Average Daily Rate (ADR) and converts to INR with estimated prediction range.
    Calculates total stay cost based on nights booked.
    """
    global _model, _preprocessor
    if _model is None or _preprocessor is None:
        load_artifacts()

    if _model is None or _preprocessor is None:
        raise HTTPException(
            status_code=503,
            detail="Unable to generate prediction. Model is not loaded or missing."
        )

    try:
        input_data = payload.model_dump()

        # Format hotel name if city provided and not in hotel
        hotel_val = input_data.get("hotel", "")
        city_val = input_data.get("city", "")
        if city_val and " - " not in hotel_val:
            input_data["hotel"] = f"{hotel_val} - {city_val}"

        # Feature Engineering: derived features
        weekend = input_data.get("stays_in_weekend_nights", 0)
        week = input_data.get("stays_in_week_nights", 0)
        total_nights = max(1, weekend + week)
        input_data["total_nights"] = total_nights

        adults = input_data.get("adults", 1)
        children = input_data.get("children", 0)
        babies = input_data.get("babies", 0)
        input_data["total_guests"] = adults + children + babies

        # Preprocess features
        df_row = pd.DataFrame([input_data])
        X_trans = _preprocessor.transform(df_row)

        # Calculate prediction range and point estimate from forest trees
        range_info = calculate_prediction_range(_model, X_trans)

        predicted_inr = range_info["predicted_price_inr"]
        estimated_total_cost = int(predicted_inr * total_nights)

        return {
            "predicted_adr_eur": range_info["predicted_adr_eur"],
            "lower_adr_eur": range_info["lower_adr_eur"],
            "upper_adr_eur": range_info["upper_adr_eur"],
            "predicted_price_inr": predicted_inr,
            "lower_price_inr": range_info["lower_price_inr"],
            "upper_price_inr": range_info["upper_price_inr"],
            "currency": CURRENCY_CODE,
            "currency_symbol": CURRENCY_SYMBOL,
            "eur_to_inr": EUR_TO_INR,
            "total_nights": total_nights,
            "estimated_total_stay_cost": estimated_total_cost,
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to generate prediction. Please check the entered booking details: {str(e)}"
        )

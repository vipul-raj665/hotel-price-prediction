import os
import sys
import json
import time
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Ensure backend package can be imported directly
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.config import (
    DATA_PATH,
    MODEL_PATH,
    PREPROCESSOR_PATH,
    METADATA_PATH,
    MODELS_DIR,
    TEST_SIZE,
    RANDOM_STATE,
    N_ESTIMATORS,
    MAX_DEPTH,
    EUR_TO_INR,
    CURRENCY_CODE,
    CURRENCY_SYMBOL,
    CATEGORICAL_FEATURES,
    NUMERICAL_FEATURES,
    ALL_FEATURES,
)
from backend.data_loader import load_raw_data, clean_data
from backend.preprocessing import build_preprocessor
from backend.model import build_model
from backend.utils import (
    calculate_metrics,
    extract_feature_importance,
    compute_statistics_from_data,
    convert_eur_to_inr,
)


def train():
    print("=" * 40)
    print("HOTEL PRICE PREDICTION MODEL")
    print("=" * 40)

    # 1. Load dataset
    df_raw = load_raw_data(DATA_PATH)
    total_raw_records = len(df_raw)

    # Calculate actual year range from dataset
    years = sorted(df_raw["arrival_date_year"].dropna().unique().tolist())
    if len(years) > 1:
        year_range = f"{int(years[0])}–{int(years[-1])}"
    elif len(years) == 1:
        year_range = f"{int(years[0])}"
    else:
        year_range = "2024"

    # 2. Clean data and engineer features
    X, y = clean_data(df_raw)
    valid_records = len(X)

    print(f"Dataset records:\n{total_raw_records}")
    print(f"\nCleaned records:\n{valid_records}")
    print(f"\nYear range:\n{year_range}")
    print(f"\nFeatures ({len(X.columns)}):\n{list(X.columns)}")

    # 3. Train/Test split (80% / 20%)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    print(f"\nTraining records:\n{len(X_train)}")
    print(f"\nTesting records:\n{len(X_test)}")

    # 4. Fit preprocessing pipeline on training set only
    preprocessor = build_preprocessor(CATEGORICAL_FEATURES, NUMERICAL_FEATURES)
    X_train_proc = preprocessor.fit_transform(X_train)
    X_test_proc = preprocessor.transform(X_test)

    # 5. Train Random Forest
    print("\nTraining Random Forest...")
    t0 = time.time()
    model = build_model(
        n_estimators=N_ESTIMATORS,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        max_depth=MAX_DEPTH
    )
    model.fit(X_train_proc, y_train)
    elapsed = time.time() - t0
    print(f"Training completed in {elapsed:.2f}s.")

    # 6. Evaluation on test set
    y_pred = model.predict(X_test_proc)
    metrics = calculate_metrics(y_test, y_pred)

    print("\n" + "-" * 40)
    print("MODEL PERFORMANCE")
    print("-" * 40)
    print(f"MAE:\n€{metrics['MAE']} (approx INR {convert_eur_to_inr(metrics['MAE']):,.0f})")
    print(f"\nRMSE:\n€{metrics['RMSE']} (approx INR {convert_eur_to_inr(metrics['RMSE']):,.0f})")
    print(f"\nR²:\n{metrics['R2']}")
    print(f"\nMAPE:\n{metrics['MAPE']}%")
    print("-" * 40)

    # 7. Extract Feature Importance
    top_features = extract_feature_importance(model, preprocessor, top_n=10)

    # 8. Sample actual vs predicted points for charts
    sample_indices = np.linspace(0, len(y_test) - 1, 60, dtype=int)
    y_test_array = np.array(y_test)
    sample_chart = [
        {
            "id": int(i + 1),
            "actual_eur": round(float(y_test_array[idx]), 2),
            "predicted_eur": round(float(y_pred[idx]), 2),
            "actual_inr": round(convert_eur_to_inr(y_test_array[idx])),
            "predicted_inr": round(convert_eur_to_inr(y_pred[idx])),
        }
        for i, idx in enumerate(sample_indices)
    ]

    statistics = compute_statistics_from_data(df_raw, sample_test_data=sample_chart)

    # 9. Save artifacts
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH, compress=3)
    joblib.dump(preprocessor, PREPROCESSOR_PATH, compress=3)

    # Save model metadata in JSON format as required
    metadata = {
        "dataset_name": "Hotel Booking Reservation — Updated 2024",
        "dataset_records": total_raw_records,
        "cleaned_records": valid_records,
        "year_range": year_range,
        "features": list(X.columns),
        "num_features": len(X.columns),
        "training_records": len(X_train),
        "testing_records": len(X_test),
        "model_name": "RandomForestRegressor",
        "n_estimators": N_ESTIMATORS,
        "max_depth": MAX_DEPTH,
        "random_state": RANDOM_STATE,
        "mae": metrics["MAE"],
        "rmse": metrics["RMSE"],
        "r2": metrics["R2"],
        "mape": metrics["MAPE"],
        "currency": CURRENCY_CODE,
        "currency_symbol": CURRENCY_SYMBOL,
        "eur_to_inr": EUR_TO_INR,
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "feature_importance": top_features,
        "statistics": statistics,
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("\nModel saved successfully.")
    print(f"Artifacts saved to {MODELS_DIR}/:")
    print(f" - {os.path.basename(MODEL_PATH)}")
    print(f" - {os.path.basename(PREPROCESSOR_PATH)}")
    print(f" - {os.path.basename(METADATA_PATH)}")


if __name__ == "__main__":
    train()

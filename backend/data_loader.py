import os
import shutil
import pandas as pd
import numpy as np
from backend.config import DATA_PATH, TARGET_COLUMN, CATEGORICAL_FEATURES, NUMERICAL_FEATURES


def download_dataset_if_missing(dest_path=DATA_PATH):
    """
    Ensures the updated 2024 Hotel Booking Reservation dataset exists.
    Downloads from Kaggle via kagglehub if not present.
    """
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1000000:
        return dest_path

    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    print(f"Dataset not found at {dest_path}. Downloading from Kaggle (kundanbedmutha/hotel-booking-reservation)...")
    
    try:
        import kagglehub
        download_dir = kagglehub.dataset_download("kundanbedmutha/hotel-booking-reservation")
        # Find csv in downloaded folder
        csv_file = None
        for root, _, files in os.walk(download_dir):
            for file in files:
                if file.endswith(".csv"):
                    csv_file = os.path.join(root, file)
                    break
            if csv_file:
                break
                
        if csv_file and os.path.exists(csv_file):
            shutil.copyfile(csv_file, dest_path)
            print(f"Downloaded and copied successfully to {dest_path} ({os.path.getsize(dest_path)} bytes)")
        else:
            raise FileNotFoundError("Could not find CSV file in downloaded Kaggle archive.")
    except Exception as e:
        raise RuntimeError(f"Failed to obtain dataset: {e}")
        
    return dest_path


def load_raw_data(dest_path=DATA_PATH) -> pd.DataFrame:
    """
    Ensures dataset exists and loads it into a pandas DataFrame.
    """
    download_dataset_if_missing(dest_path)
    df = pd.read_csv(dest_path)
    return df


def clean_data(df: pd.DataFrame):
    """
    Cleans the updated 2024 hotel booking dataset:
    - Filters out impossible / erroneous ADR records (ADR <= 0 or extreme outlier > 5000)
    - Feature engineering:
        * total_nights = stays_in_weekend_nights + stays_in_week_nights
        * total_guests = adults + children + babies
    - Explicitly excludes data leakage columns: reservation_status, reservation_status_date, is_canceled
    - Excludes high-cardinality/missing columns: agent, company (>94% missing)
    - Returns X (DataFrame with 27 features) and y (Series of ADR in EUR)
    """
    data = df.copy()

    # Filter invalid/extreme target values
    # adr <= 0 represents complimentary, cancelled or refund errors.
    # 5400 is an extreme single data-entry typo outlier.
    data = data[(data[TARGET_COLUMN] > 0) & (data[TARGET_COLUMN] < 5000)].copy()

    # Feature Engineering (booking-time derived attributes)
    data["total_nights"] = (
        pd.to_numeric(data["stays_in_weekend_nights"], errors="coerce").fillna(0) +
        pd.to_numeric(data["stays_in_week_nights"], errors="coerce").fillna(0)
    )
    data["total_guests"] = (
        pd.to_numeric(data["adults"], errors="coerce").fillna(0) +
        pd.to_numeric(data["children"], errors="coerce").fillna(0) +
        pd.to_numeric(data["babies"], errors="coerce").fillna(0)
    )

    # Clean numeric columns (fill NaNs with median/0)
    for col in NUMERICAL_FEATURES:
        if col in data.columns:
            data[col] = pd.to_numeric(data[col], errors="coerce").fillna(0)

    # Clean categorical columns (strip strings and handle NaNs)
    for col in CATEGORICAL_FEATURES:
        if col in data.columns:
            data[col] = data[col].fillna("Unknown").astype(str).str.strip()

    # Select explicit features
    X = data[CATEGORICAL_FEATURES + NUMERICAL_FEATURES].copy()
    y = data[TARGET_COLUMN].copy()

    return X, y

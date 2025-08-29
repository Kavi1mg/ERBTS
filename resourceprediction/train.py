import os
import pickle
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

# ==============================
# CONFIG
# ==============================
DATASET_PATH = "synthetic_hospital_resource_data.csv"
ARTIFACTS_DIR = "artifacts"
RESOURCES = ["oxygen", "ventilator", "bed", "ambulance"]

if not os.path.exists(ARTIFACTS_DIR):
    os.makedirs(ARTIFACTS_DIR)

# ==============================
# BUILD SEQUENCES FOR LSTM
# ==============================
def create_sequences(data, seq_length=10):
    X, y = [], []
    for i in range(len(data) - seq_length):
        X.append(data[i:i+seq_length])
        y.append(data[i+seq_length])
    return np.array(X), np.array(y)

# ==============================
# TRAINING PER RESOURCE
# ==============================
df = pd.read_csv(DATASET_PATH)

for resource in RESOURCES:
    print(f"\n🔹 Training model for: {resource}...")

    # Filter resource data
    resource_df = df[df["resourceType"] == resource].copy()

    if resource_df.empty:
        print(f"⚠️ No data found for {resource}, skipping...")
        continue

    # Fix date parsing: your dataset uses DD-MM-YYYY
    resource_df["ts"] = pd.to_datetime(resource_df["ts"], format="%d-%m-%Y", errors="coerce")
    resource_df.dropna(subset=["ts"], inplace=True)
    resource_df.sort_values("ts", inplace=True)

    # Target = "used"
    values = resource_df["used"].values.reshape(-1, 1)

    # Normalize data
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled = scaler.fit_transform(values)

    # Create sequences
    X, y = create_sequences(scaled, seq_length=10)
    X = X.reshape((X.shape[0], X.shape[1], 1))

    # Train-test split
    split = int(0.8 * len(X))
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    # ==============================
    # LSTM Model
    # ==============================
    model = Sequential([
        LSTM(64, activation="relu", input_shape=(X_train.shape[1], 1), return_sequences=True),
        Dropout(0.2),
        LSTM(32, activation="relu"),
        Dropout(0.2),
        Dense(1)
    ])

    model.compile(optimizer="adam", loss="mse")

    model.fit(X_train, y_train, epochs=20, batch_size=16, validation_split=0.1, verbose=1)

    # Predictions
    y_pred = model.predict(X_test, verbose=0)

    # Inverse transform
    y_test_inv = scaler.inverse_transform(y_test.reshape(-1, 1))
    y_pred_inv = scaler.inverse_transform(y_pred)

    # ==============================
    # ACCURACY METRICS
    # ==============================
    mae = mean_absolute_error(y_test_inv, y_pred_inv)
    rmse = np.sqrt(mean_squared_error(y_test_inv, y_pred_inv))
    r2 = r2_score(y_test_inv, y_pred_inv)

    print(f"✅ {resource} Model Accuracy:")
    print(f"   MAE  = {mae:.2f}")
    print(f"   RMSE = {rmse:.2f}")
    print(f"   R²   = {r2:.2f}")

    # ==============================
    # SAVE MODEL + SCALER
    # ==============================
    model.save(f"{ARTIFACTS_DIR}/{resource}_lstm.h5")
    with open(f"{ARTIFACTS_DIR}/{resource}_scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)

    print(f"💾 Saved {resource} model and scaler.")

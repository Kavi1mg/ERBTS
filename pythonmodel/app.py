import os
import numpy as np
import pandas as pd
import pickle
from datetime import datetime
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping

# ==============================
# CONFIGURATION
# ==============================
DATASET_PATH = "hospital_resource_dataset.csv"  # your generated dataset path
ARTIFACTS_DIR = "artifacts"
SEQUENCE_LENGTH = 20
FEATURE_COLUMNS = ["used", "on_hand", "available", "borrow_quantity", "transfer_in_qty", "transfer_out_qty"]
TARGET_COLUMN = "used"
EPOCHS = 50
BATCH_SIZE = 32

# Ensure artifacts directory exists
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# Load dataset
df = pd.read_csv(DATASET_PATH)

# Parse dates
df["ts"] = pd.to_datetime(df["ts"], format="%d-%m-%Y", errors="coerce")
df.dropna(subset=["ts"], inplace=True)

# Get all unique hospital-resource pairs
hospital_resource_pairs = df[["hospitalId", "resourceType"]].drop_duplicates()

# ==============================
# Function to create sequences
# ==============================
def create_sequences(data, seq_length):
    X, y = [], []
    for i in range(len(data) - seq_length):
        X.append(data[i:i+seq_length])
        y.append(data[i+seq_length][FEATURE_COLUMNS.index(TARGET_COLUMN)])
    return np.array(X), np.array(y)

# ==============================
# Training for each hospital and resource
# ==============================
for _, row in hospital_resource_pairs.iterrows():
    hospital = row["hospitalId"]
    resource = row["resourceType"]
    print(f"\n🔹 Training for {hospital} - {resource}")

    # Filter data
    resource_df = df[(df["hospitalId"] == hospital) & (df["resourceType"] == resource)].copy()
    resource_df.sort_values("ts", inplace=True)

    if resource_df.shape[0] < SEQUENCE_LENGTH + 1:
        print(f"⚠️ Not enough data for {hospital}-{resource}, skipping...")
        continue

    # Extract features
    data = resource_df[FEATURE_COLUMNS].values

    # Scale data
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(data)

    # Create sequences
    X, y = create_sequences(scaled_data, SEQUENCE_LENGTH)
    X = X.reshape((X.shape[0], SEQUENCE_LENGTH, len(FEATURE_COLUMNS)))

    # Train-test split
    split_idx = int(0.8 * len(X))
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]

    # Build the LSTM model
    model = Sequential([
        LSTM(64, activation='relu', return_sequences=True, input_shape=(SEQUENCE_LENGTH, len(FEATURE_COLUMNS))),
        Dropout(0.2),
        LSTM(32, activation='relu'),
        Dropout(0.2),
        Dense(1)
    ])

    model.compile(optimizer='adam', loss='mse')

    # Early stopping to prevent overfitting
    early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

    # Train the model
    history = model.fit(X_train, y_train, epochs=EPOCHS, batch_size=BATCH_SIZE,
                        validation_split=0.1, callbacks=[early_stop], verbose=1)

    # Evaluate
    y_pred = model.predict(X_test, verbose=0)
    y_test_inv = scaler.inverse_transform(
        np.concatenate((np.zeros((len(y_test), len(FEATURE_COLUMNS)-1)), y_test.reshape(-1,1)), axis=1)
    )[:, -1]
    y_pred_inv = scaler.inverse_transform(
        np.concatenate((np.zeros((len(y_pred), len(FEATURE_COLUMNS)-1)), y_pred), axis=1)
    )[:, -1]

    mae = mean_absolute_error(y_test_inv, y_pred_inv)
    rmse = np.sqrt(mean_squared_error(y_test_inv, y_pred_inv))
    r2 = r2_score(y_test_inv, y_pred_inv)

    print(f"✅ Results for {hospital}-{resource}: MAE={mae:.2f}, RMSE={rmse:.2f}, R²={r2:.2f}")

    # Save model and scaler
    model_file = f"{ARTIFACTS_DIR}/{hospital}_{resource}_lstm.h5"
    scaler_file = f"{ARTIFACTS_DIR}/{hospital}_{resource}_scaler.pkl"

    model.save(model_file)
    with open(scaler_file, "wb") as f:
        pickle.dump(scaler, f)

    print(f"💾 Saved model and scaler for {hospital}-{resource}")

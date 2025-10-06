# import os
# import pickle
# import numpy as np
# import pandas as pd
# from sklearn.preprocessing import MinMaxScaler
# from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import LSTM, Dense, Dropout

# # ==============================
# # CONFIG
# # ==============================
# DATASET_PATH = "synthetic_hospital_resource_data.csv"
# ARTIFACTS_DIR = "artifacts"
# RESOURCES = ["oxygen", "ventilator", "bed", "ambulance"]

# if not os.path.exists(ARTIFACTS_DIR):
#     os.makedirs(ARTIFACTS_DIR)

# # ==============================
# # BUILD SEQUENCES FOR LSTM
# # ==============================
# def create_sequences(data, seq_length=10):
#     X, y = [], []
#     for i in range(len(data) - seq_length):
#         X.append(data[i:i+seq_length])
#         y.append(data[i+seq_length])
#     return np.array(X), np.array(y)

# # ==============================
# # TRAINING PER RESOURCE
# # ==============================
# df = pd.read_csv(DATASET_PATH)

# for resource in RESOURCES:
#     print(f"\n🔹 Training model for: {resource}...")

#     # Filter resource data
#     resource_df = df[df["resourceType"] == resource].copy()

#     if resource_df.empty:
#         print(f"⚠️ No data found for {resource}, skipping...")
#         continue

#     # Fix date parsing: your dataset uses DD-MM-YYYY
#     resource_df["ts"] = pd.to_datetime(resource_df["ts"], format="%d-%m-%Y", errors="coerce")
#     resource_df.dropna(subset=["ts"], inplace=True)
#     resource_df.sort_values("ts", inplace=True)

#     # Target = "used"
#     values = resource_df["used"].values.reshape(-1, 1)

#     # Normalize data
#     scaler = MinMaxScaler(feature_range=(0, 1))
#     scaled = scaler.fit_transform(values)

#     # Create sequences
#     X, y = create_sequences(scaled, seq_length=10)
#     X = X.reshape((X.shape[0], X.shape[1], 1))

#     # Train-test split
#     split = int(0.8 * len(X))
#     X_train, X_test = X[:split], X[split:]
#     y_train, y_test = y[:split], y[split:]

#     # ==============================
#     # LSTM Model
#     # ==============================
#     model = Sequential([
#         LSTM(64, activation="relu", input_shape=(X_train.shape[1], 1), return_sequences=True),
#         Dropout(0.2),
#         LSTM(32, activation="relu"),
#         Dropout(0.2),
#         Dense(1)
#     ])

#     model.compile(optimizer="adam", loss="mse")

#     model.fit(X_train, y_train, epochs=20, batch_size=16, validation_split=0.1, verbose=1)

#     # Predictions
#     y_pred = model.predict(X_test, verbose=0)

#     # Inverse transform
#     y_test_inv = scaler.inverse_transform(y_test.reshape(-1, 1))
#     y_pred_inv = scaler.inverse_transform(y_pred)

#     # ==============================
#     # ACCURACY METRICS
#     # ==============================
#     mae = mean_absolute_error(y_test_inv, y_pred_inv)
#     rmse = np.sqrt(mean_squared_error(y_test_inv, y_pred_inv))
#     r2 = r2_score(y_test_inv, y_pred_inv)

#     print(f"✅ {resource} Model Accuracy:")
#     print(f"   MAE  = {mae:.2f}")
#     print(f"   RMSE = {rmse:.2f}")
#     print(f"   R²   = {r2:.2f}")

#     # ==============================
#     # SAVE MODEL + SCALER
#     # ==============================
#     model.save(f"{ARTIFACTS_DIR}/{resource}_lstm.h5")
#     with open(f"{ARTIFACTS_DIR}/{resource}_scaler.pkl", "wb") as f:
#         pickle.dump(scaler, f)

#     print(f"💾 Saved {resource} model and scaler.")














import os
import pickle
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping

# ==============================
# CONFIG
# ==============================
DATASET_PATH = "synthetic_hospital_resource_data.csv"
ARTIFACTS_DIR = "artifacts"
RESOURCES = ["oxygen", "ventilator", "bed", "ambulance"]

if not os.path.exists(ARTIFACTS_DIR):
    os.makedirs(ARTIFACTS_DIR)

# ==============================
# FUNCTION TO CREATE SEQUENCES
# ==============================
def create_sequences(data, seq_length=10):
    X, y = [], []
    for i in range(len(data) - seq_length):
        X.append(data[i:i+seq_length])
        y.append(data[i+seq_length])
    return np.array(X), np.array(y)

# ==============================
# TRAINING FOR EACH RESOURCE
# ==============================
df = pd.read_csv(DATASET_PATH)
resource_accuracies = {}

for resource in RESOURCES:
    print(f"\n🔹 Training model for: {resource}...")

    # Filter dataset for this resource
    resource_df = df[df["resourceType"] == resource].copy()

    if resource_df.empty:
        print(f"⚠️ No data found for {resource}, skipping...")
        continue

    # Parse date
    resource_df["ts"] = pd.to_datetime(resource_df["ts"], format="%d-%m-%Y", errors="coerce")
    resource_df.dropna(subset=["ts"], inplace=True)
    resource_df.sort_values("ts", inplace=True)
    resource_df = resource_df.drop_duplicates(subset=["ts"])
    resource_df = resource_df.set_index("ts").resample("D").interpolate().reset_index()

    # Target column
    values = resource_df["used"].values.reshape(-1, 1)

    # Normalize target
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled = scaler.fit_transform(values)

    # Create sequences
    X, y = create_sequences(scaled, seq_length=10)
    X = X.reshape((X.shape[0], X.shape[1], 1))

    # ==============================
    # Split into Train / Val / Test
    # ==============================
    train_size = int(0.7 * len(X))
    val_size = int(0.15 * len(X))

    X_train, y_train = X[:train_size], y[:train_size]
    X_val, y_val = X[train_size:train_size + val_size], y[train_size:train_size + val_size]
    X_test, y_test = X[train_size + val_size:], y[train_size + val_size:]

    # ==============================
    # LSTM MODEL
    # ==============================
    model = Sequential([
        LSTM(128, activation="relu", return_sequences=True, input_shape=(X_train.shape[1], 1)),
        Dropout(0.2),
        LSTM(64, activation="relu", return_sequences=True),
        Dropout(0.2),
        LSTM(32, activation="relu"),
        Dense(1)
    ])

    model.compile(optimizer="adam", loss="mse")
    early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

    # Train model
    history = model.fit(
        X_train, y_train,
        epochs=100,
        batch_size=8,
        validation_data=(X_val, y_val),
        callbacks=[early_stop],
        verbose=1
    )

    # ==============================
    # PREDICTIONS
    # ==============================
    y_train_pred = model.predict(X_train, verbose=0)
    y_val_pred = model.predict(X_val, verbose=0)
    y_test_pred = model.predict(X_test, verbose=0)

    # Inverse transform
    y_train_inv = scaler.inverse_transform(y_train.reshape(-1, 1))
    y_val_inv = scaler.inverse_transform(y_val.reshape(-1, 1))
    y_test_inv = scaler.inverse_transform(y_test.reshape(-1, 1))
    y_train_pred_inv = scaler.inverse_transform(y_train_pred)
    y_val_pred_inv = scaler.inverse_transform(y_val_pred)
    y_test_pred_inv = scaler.inverse_transform(y_test_pred)

    # ==============================
    # ACCURACY METRICS
    # ==============================
    train_acc = r2_score(y_train_inv, y_train_pred_inv) * 100
    val_acc = r2_score(y_val_inv, y_val_pred_inv) * 100
    test_acc = r2_score(y_test_inv, y_test_pred_inv) * 100

    mae = mean_absolute_error(y_test_inv, y_test_pred_inv)
    rmse = np.sqrt(mean_squared_error(y_test_inv, y_test_pred_inv))

    print(f"\n✅ {resource.upper()} MODEL PERFORMANCE:")
    print(f"   Training Accuracy : {train_acc:.2f}%")
    print(f"   Validation Accuracy: {val_acc:.2f}%")
    print(f"   Test Accuracy      : {test_acc:.2f}%")
    print(f"   MAE  = {mae:.2f}")
    print(f"   RMSE = {rmse:.2f}")

    resource_accuracies[resource] = test_acc

    # ==============================
    # 📊 PLOT 1: Training vs Validation Loss
    # ==============================
    plt.figure(figsize=(8, 5))
    plt.plot(history.history['loss'], label='Training Loss', color='blue')
    plt.plot(history.history['val_loss'], label='Validation Loss', color='orange')
    plt.title(f'{resource.upper()} - Training vs Validation Loss')
    plt.xlabel('Epochs')
    plt.ylabel('MSE Loss')
    plt.legend()
    plt.grid(True)
    loss_plot_path = os.path.join(ARTIFACTS_DIR, f"{resource}_loss_curve.png")
    plt.savefig(loss_plot_path)
    plt.show()

    # ==============================
    # 📊 PLOT 2: Train / Val / Test Accuracy Comparison
    # ==============================
    plt.figure(figsize=(7, 5))
    bars = plt.bar(["Training", "Validation", "Test"],
                   [train_acc, val_acc, test_acc],
                   color=['skyblue', 'lightgreen', 'salmon'])
    plt.title(f"{resource.upper()} - Accuracy Comparison")
    plt.ylabel("Approx. Accuracy (%)")
    plt.ylim(0, 100)
    for bar in bars:
        plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height() - 5,
                 f"{bar.get_height():.1f}%", ha='center', color='black', fontweight='bold')
    plt.grid(axis='y')
    acc_plot_path = os.path.join(ARTIFACTS_DIR, f"{resource}_accuracy_comparison.png")
    plt.savefig(acc_plot_path)
    plt.show()

    # ==============================
    # SAVE MODEL + SCALER
    # ==============================
    model.save(f"{ARTIFACTS_DIR}/{resource}_lstm.h5")
    with open(f"{ARTIFACTS_DIR}/{resource}_scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)

    print(f"💾 Saved {resource} model, scaler, and plots to '{ARTIFACTS_DIR}/'.")

# ==============================
# 📊 FINAL COMPARISON BAR CHART (Test Accuracy)
# ==============================
plt.figure(figsize=(7, 5))
bars = plt.bar(resource_accuracies.keys(), resource_accuracies.values(),
               color=['skyblue', 'salmon', 'lightgreen', 'violet'])
plt.title("Resource Prediction Test Accuracy Comparison")
plt.xlabel("Resource Type")
plt.ylabel("Approx. Test Accuracy (%)")
plt.ylim(0, 100)
plt.grid(axis='y')

for resource, acc in resource_accuracies.items():
    plt.text(resource, acc - 5, f"{acc:.1f}%", ha='center', color='black', fontweight='bold')

final_plot_path = os.path.join(ARTIFACTS_DIR, "final_accuracy_comparison.png")
plt.savefig(final_plot_path)
plt.show()

print("\n🎯 Training complete for all resources.")
print(f"📁 All graphs and models saved in '{ARTIFACTS_DIR}/'")

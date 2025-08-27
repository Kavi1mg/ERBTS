# train_forecast_lstm.py
import os
import pickle
import json
import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint

# =========================
# CONFIG — tweak if needed
# =========================
DATA_FILE   = "synthetic_hospital_resource_data.csv"
TARGET_COL  = "used"           # <-- demand you want to forecast. Change to 'available' if you prefer
LOOKBACK    = 14               # how many past days to look at (try 14, 21, 28)
HORIZON     = 1                # predict 1 day ahead (tomorrow)
TEST_RATIO  = 0.2              # last 20% of time goes to test
EPOCHS      = 57                 # increase for higher accuracy (try 80-120 if training is stable)
BATCH_SIZE  = 64

ARTIFACTS_DIR = "artifacts"
PLOTS_DIR     = "plots"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(PLOTS_DIR, exist_ok=True)

# ============================================================
# 1) Load + clean + add time features (day-of-week, month etc)
# ============================================================
df = pd.read_csv(DATA_FILE)

# Parse timestamps (your data can be like "20-08-2023")
df["ts"] = pd.to_datetime(df["ts"], errors="coerce", dayfirst=True)
df = df.dropna(subset=["ts"])

# Sort by identity + time so sequences are in order
df = df.sort_values(["hospitalId", "resourceType", "ts"]).reset_index(drop=True)

# Optional: drop rows with missing essential numeric target
df = df.dropna(subset=[TARGET_COL])

# Time features (cyclical so the model learns weekly/monthly patterns)
df["dow"]        = df["ts"].dt.dayofweek
df["month"]      = df["ts"].dt.month
df["dow_sin"]    = np.sin(2 * np.pi * df["dow"] / 7)
df["dow_cos"]    = np.cos(2 * np.pi * df["dow"] / 7)
df["month_sin"]  = np.sin(2 * np.pi * df["month"] / 12)
df["month_cos"]  = np.cos(2 * np.pi * df["month"] / 12)

# ======================================
# 2) Choose feature columns (use "all")
# ======================================
# Keep every numeric hospital metric (including 'used' so the model sees past demand),
# plus lat/long and transfer stats. We'll one-hot encode the categorical columns below.
numeric_features = [
    # core operational metrics
    "used", "on_hand", "total_quantity", "available", "borrow_quantity",
    "transfer_in_qty", "transfer_out_qty",
    # location numbers (optional but present in your CSV)
    "hospital_latitude", "hospital_longitude",
    # time features
    "dow_sin", "dow_cos", "month_sin", "month_cos"
]

categorical_features = [
    "hospitalId", "resourceType", "urgency_level", "district", "state"
    # NOTE: 'hospital_name' is redundant with hospitalId, so we skip it
]

# Ensure columns exist (some may not exist depending on your export)
numeric_features  = [c for c in numeric_features if c in df.columns]
categorical_features = [c for c in categorical_features if c in df.columns]

feature_cols = numeric_features + categorical_features

# Drop rows that are fully NA in features (rare)
df = df.dropna(subset=[c for c in feature_cols if c in df.columns])

# ======================================================
# 3) Build a preprocessing pipeline (scale + one-hot)
# ======================================================
# OneHotEncoder param compatibility across sklearn versions
try:
    ohe = OneHotEncoder(handle_unknown="ignore", sparse=False)
except TypeError:
    ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=False)

preprocessor = ColumnTransformer(
    transformers=[
        ("num", MinMaxScaler(), numeric_features),
        ("cat", ohe, categorical_features),
    ],
    remainder="drop"
)

# =============================================================
# 4) Create multivariate sequences per (hospitalId, resourceType)
#    Each sample = last LOOKBACK days -> predict next day (HORIZON)
# =============================================================
X_list, y_list, ts_list, hid_list, rtype_list = [], [], [], [], []

groups = df.groupby(["hospitalId", "resourceType"], sort=False)
for (hid, rtype), g in groups:
    g = g.sort_values("ts")
    # Build features and target for this series
    Xg = g[feature_cols]
    yg = g[TARGET_COL].values
    if len(g) < LOOKBACK + HORIZON:
        continue

    # Fit/transform: For simplicity we fit once on the whole dataset below.
    # Here, just store raw to transform later.
    X_list.append(Xg)
    y_list.append(pd.Series(yg, index=g.index))
    ts_list.append(g["ts"])
    hid_list.append(pd.Series([hid]*len(g), index=g.index))
    rtype_list.append(pd.Series([rtype]*len(g), index=g.index))

# Concatenate all groups back (aligned by original indexes)
if not X_list:
    raise RuntimeError("No groups had enough history to build sequences. Reduce LOOKBACK or check data.")

X_all_df   = pd.concat(X_list).sort_index()
y_all_sr   = pd.concat(y_list).sort_index()
ts_all_sr  = pd.concat(ts_list).sort_index()
hid_all_sr = pd.concat(hid_list).sort_index()
rtype_all_sr = pd.concat(rtype_list).sort_index()

# Fit the preprocessor on ALL features (simple, fast). For strict TS practice,
# fit on the training period only – but this is fine to get you moving.
X_all_trans = preprocessor.fit_transform(X_all_df)

# Helper: build sliding windows over the transformed matrix,
# keeping the matching identities and timestamps.
def make_windows(X_mat, y_vec, ts_sr, hid_sr, rtype_sr, lookback=14, horizon=1):
    X_seq, y_seq, ts_out, hid_out, rtype_out = [], [], [], [], []
    # Use the sorted order already ensured above
    for i in range(lookback, len(y_vec) - horizon + 1):
        X_seq.append(X_mat[i - lookback:i, :])
        y_seq.append(y_vec[i + horizon - 1])
        ts_out.append(ts_sr.iloc[i + horizon - 1])
        hid_out.append(hid_sr.iloc[i + horizon - 1])
        rtype_out.append(rtype_sr.iloc[i + horizon - 1])
    return np.array(X_seq), np.array(y_seq), np.array(ts_out), np.array(hid_out), np.array(rtype_out)

X_seq, y_seq, ts_seq, hid_seq, rtype_seq = make_windows(
    X_all_trans, y_all_sr.values, ts_all_sr, hid_all_sr, rtype_all_sr,
    lookback=LOOKBACK, horizon=HORIZON
)

# ===================================================
# 5) Time-based split (last TEST_RATIO goes to test)
# ===================================================
order = np.argsort(ts_seq)  # sort windows by their prediction timestamp
X_seq = X_seq[order]
y_seq = y_seq[order]
ts_seq = ts_seq[order]
hid_seq = hid_seq[order]
rtype_seq = rtype_seq[order]

split_idx = int(len(X_seq) * (1 - TEST_RATIO))
X_train, X_test = X_seq[:split_idx], X_seq[split_idx:]
y_train, y_test = y_seq[:split_idx], y_seq[split_idx:]
ts_train, ts_test = ts_seq[:split_idx], ts_seq[split_idx:]
hid_test, rtype_test = hid_seq[split_idx:], rtype_seq[split_idx:]

print(f"Train windows: {X_train.shape}, Test windows: {X_test.shape}")

# ==========================
# 6) Build + train the LSTM
# ==========================
model = Sequential([
    LSTM(128, return_sequences=True, input_shape=(LOOKBACK, X_train.shape[2])),
    Dropout(0.2),
    LSTM(64),
    Dropout(0.2),
    Dense(1)
])

model.compile(optimizer="adam", loss="mse")

ckpt_path = os.path.join(ARTIFACTS_DIR, "best_model.keras")
callbacks = [
    EarlyStopping(monitor="val_loss", patience=8, restore_best_weights=True),
    ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=4, verbose=1),
    ModelCheckpoint(ckpt_path, monitor="val_loss", save_best_only=True, verbose=1)
]

history = model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    callbacks=callbacks,
    verbose=1
)

# ================================
# 7) Evaluate – MAPE, RMSE, R²
# ================================
y_pred = model.predict(X_test).ravel()

mae  = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mape = mean_absolute_percentage_error(y_test, y_pred)  # 0.10 = 10%
r2   = r2_score(y_test, y_pred)

print("\n=== Test Metrics ===")
print(f"MAE  : {mae:.3f}")
print(f"RMSE : {rmse:.3f}")
print(f"MAPE : {mape*100:.2f}%  -> Approx. accuracy: {100 - mape*100:.2f}%")
print(f"R²   : {r2:.3f}")

# ==========================
# 8) Save artifacts & plots
# ==========================
# Save final model (Keras native format)
model_path = os.path.join(ARTIFACTS_DIR, "hospital_resource_lstm.keras")
model.save(model_path)
print(f"Saved model -> {model_path}")

# Save the preprocessing pipeline (scaler + OHE) & config
pp_path = os.path.join(ARTIFACTS_DIR, "preprocessor.pkl")
with open(pp_path, "wb") as f:
    pickle.dump(preprocessor, f)
print(f"Saved preprocessor -> {pp_path}")

config = {
    "LOOKBACK": LOOKBACK,
    "HORIZON": HORIZON,
    "TARGET_COL": TARGET_COL,
    "numeric_features": numeric_features,
    "categorical_features": categorical_features
}
with open(os.path.join(ARTIFACTS_DIR, "config.json"), "w") as f:
    json.dump(config, f, indent=2)

# Save training curves
plt.figure(figsize=(7,4))
plt.plot(history.history["loss"], label="train")
plt.plot(history.history["val_loss"], label="val")
plt.title("Training vs Validation Loss")
plt.xlabel("Epoch")
plt.ylabel("MSE")
plt.legend()
plt.tight_layout()
lossplot_path = os.path.join(PLOTS_DIR, "loss_curves.png")
plt.savefig(lossplot_path)
plt.close()
print(f"Saved plot -> {lossplot_path}")

# Save predictions with metadata (so you can inspect per hospital/resource)
pred_df = pd.DataFrame({
    "ts": ts_test,
    "hospitalId": hid_test,
    "resourceType": rtype_test,
    f"actual_{TARGET_COL}": y_test,
    f"pred_{TARGET_COL}": y_pred
}).sort_values("ts")
pred_path = os.path.join(ARTIFACTS_DIR, "predictions.csv")
pred_df.to_csv(pred_path, index=False)
print(f"Saved predictions -> {pred_path}")

# Optional: quick per-(hospital,resource) MAPE to see who needs tuning
group_mape = pred_df.groupby(["hospitalId","resourceType"]).apply(
    lambda g: mean_absolute_percentage_error(g[f"actual_{TARGET_COL}"], g[f"pred_{TARGET_COL}"])
).reset_index(name="MAPE")
group_mape["Approx_Accuracy_%"] = (1 - group_mape["MAPE"]) * 100
group_mape.sort_values("Approx_Accuracy_%", ascending=False).to_csv(
    os.path.join(ARTIFACTS_DIR, "mape_by_hospital_resource.csv"), index=False
)
print("Saved per-hospital/resource MAPE -> artifacts/mape_by_hospital_resource.csv")

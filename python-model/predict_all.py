import json
import pickle
import numpy as np
import pandas as pd
from datetime import date, timedelta
from tensorflow.keras.models import load_model
import mysql.connector

from build_features import build_features, get_connection, RESOURCES_TO_PREDICT

ARTIFACTS_DIR = "artifacts"

def load_artifacts():
    with open(f"{ARTIFACTS_DIR}/preprocessor.pkl","rb") as f:
        preproc = pickle.load(f)
    with open(f"{ARTIFACTS_DIR}/config.json","r") as f:
        cfg = json.load(f)
    model = load_model(f"{ARTIFACTS_DIR}/best_model.keras")
    lookback = int(cfg.get("LOOKBACK", 4))
    return preproc, model, lookback, cfg

def ensure_lookback_window(X_df: pd.DataFrame, lookback: int) -> pd.DataFrame:
    """Pad last row to reach lookback using last available row (avoid all zeros)."""
    if len(X_df) >= lookback:
        return X_df.tail(lookback).copy()
    if X_df.empty:
        # No historical data: create small epsilon values
        X_df = pd.DataFrame({c: [1e-6] for c in X_df.columns})
    last = X_df.tail(1).copy()
    needed = lookback - len(X_df)
    pad = pd.concat([last]*needed, ignore_index=True)
    return pd.concat([X_df, pad], ignore_index=True).tail(lookback)

def upsert_prediction(conn, hospitalId: str, resourceType: str, qty: float, for_date: date):
    qty_int = int(round(max(qty, 0)))
    sql = """
        INSERT INTO predictions (hospitalId, resourceType, predicted_for, predicted_quantity)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE predicted_quantity = VALUES(predicted_quantity),
                                predicted_at = CURRENT_TIMESTAMP
    """
    with conn.cursor() as cur:
        cur.execute(sql, (hospitalId, resourceType, for_date, qty_int))
    conn.commit()

def predict_for_hospital(hospitalId: str):
    preproc, model, lookback, cfg = load_artifacts()

    # Build features for this hospital
    df = build_features(hospitalId)
    tomorrow = date.today() + timedelta(days=1)
    results = []

    for rtype in RESOURCES_TO_PREDICT:
        g = df[df["resourceType"] == rtype].sort_values("ts")

        if g.empty:
            # No historical data: create a fallback row with small values
            fallback = pd.DataFrame({c: [1e-6] for c in preproc.feature_names_in_})
            Xwin_df = ensure_lookback_window(fallback, lookback)
        else:
            # Preprocess features
            try:
                Xmat = preproc.transform(g)
                Xwin_df = ensure_lookback_window(pd.DataFrame(Xmat, index=g.index), lookback)
            except Exception as e:
                print(f"⚠ Preprocessing failed for {rtype}: {e}")
                results.append((rtype, None, "preproc_fail"))
                continue

        Xwin = Xwin_df.values.reshape(1, lookback, Xwin_df.shape[1])

        # Predict
        y_hat = model.predict(Xwin, verbose=0).ravel()[0]
        y_hat = max(y_hat, 0)  # Avoid negative predictions
        results.append((rtype, float(y_hat), "ok"))

    # Save predictions to DB
    conn = get_connection()
    try:
        for rtype, yhat, status in results:
            if status == "ok" and yhat is not None:
                upsert_prediction(conn, hospitalId, rtype, yhat, tomorrow)
    finally:
        conn.close()

    summary = {rtype: (None if yhat is None else round(yhat, 2)) for rtype, yhat, _ in results}
    print(f"✅ Predictions for {hospitalId} (for {tomorrow}): {summary}")
    return summary

if __name__ == "__main__":
    predict_for_hospital("DL_AIIMS")

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
    """Pad last row to reach lookback if needed (works but less accurate than real history)."""
    if len(X_df) >= lookback:
        return X_df.tail(lookback).copy()
    if X_df.empty:
        # create a single zero row with correct columns, then tile
        X_df = pd.DataFrame({c: [0] for c in X_df.columns})
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

    # Build features (includes ts, all columns; preprocessor will pick what it needs)
    df = build_features(hospitalId)
    if df.empty:
        raise RuntimeError(f"No data found for hospitalId={hospitalId}. Insert historical_usage first.")

    # Tomorrow date
    tomorrow = date.today() + timedelta(days=1)

    results = []
    for rtype in RESOURCES_TO_PREDICT:
        g = df[df["resourceType"] == rtype].sort_values("ts")
        if g.empty:
            results.append((rtype, None, "no_data"))
            continue

        # Preprocess using saved pipeline (it selects cols by name)
        Xmat = preproc.transform(g)

        # Build last LOOKBACK window
        Xwin_df = pd.DataFrame(Xmat, index=g.index)  # just to slice easily
        Xwin_df = ensure_lookback_window(Xwin_df, lookback)
        Xwin = Xwin_df.values.reshape(1, lookback, Xwin_df.shape[1])

        # Predict
        y_hat = model.predict(Xwin, verbose=0).ravel()[0]

        results.append((rtype, float(y_hat), "ok"))

    # Upsert to DB
    conn = get_connection()
    try:
        for rtype, yhat, status in results:
            if status == "ok" and yhat is not None:
                upsert_prediction(conn, hospitalId, rtype, yhat, tomorrow)
    finally:
        conn.close()

    # Print a friendly summary (dashboard can call a proper API later)
    summary = {rtype: (None if yhat is None else round(yhat, 2)) for rtype, yhat, _ in results}
    print(f"✅ Predictions for {hospitalId} (for {tomorrow}): {summary}")
    return summary

if __name__ == "__main__":
    # Example: DL_AIIMS (matches your seed data)
    predict_for_hospital("DL_AIIMS")

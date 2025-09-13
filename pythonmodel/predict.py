import os
import numpy as np
import pandas as pd
import pickle
import mysql.connector
from datetime import datetime
from tensorflow.keras.models import load_model

# ==============================
# CONFIGURATION
# ==============================
ARTIFACTS_DIR = "artifacts"
SEQUENCE_LENGTH = 20
FEATURE_COLUMNS = ["used", "on_hand", "available", "borrow_quantity", "transfer_in_qty", "transfer_out_qty"]
TARGET_COLUMN = "used"

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'KAVI@123mg',
    'database': 'erbts'
}

# ==============================
# Connect to the database
# ==============================
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor(dictionary=True)

# ==============================
# Get all hospital-resource pairs
# ==============================
cursor.execute("SELECT DISTINCT hospitalId, resourceType FROM historical_usage")
hospital_resources = cursor.fetchall()

print(f"🔍 Found {len(hospital_resources)} hospital-resource combinations.")

# ==============================
# Loop through each hospital-resource pair
# ==============================
for hr in hospital_resources:
    hospital = hr['hospitalId']
    resource = hr['resourceType']
    print(f"\n🔹 Predicting for {hospital} - {resource}")

    # Load model and scaler
    model_path = f"{ARTIFACTS_DIR}/{hospital}_{resource}_lstm.h5"
    scaler_path = f"{ARTIFACTS_DIR}/{hospital}_{resource}_scaler.pkl"

    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        print(f"⚠️ Model or scaler not found for {hospital}-{resource}, skipping...")
        continue

    with open(scaler_path, "rb") as f:
        scaler = pickle.load(f)

    model = load_model(model_path, compile=False)

    # Fetch last SEQUENCE_LENGTH days of data
    query = f"""
        SELECT used, on_hand, available, borrow_quantity, transfer_in_qty, transfer_out_qty
        FROM historical_usage
        WHERE hospitalId = %s AND resourceType = %s
        ORDER BY ts DESC
        LIMIT {SEQUENCE_LENGTH}
    """
    cursor.execute(query, (hospital, resource))
    rows = cursor.fetchall()

    if len(rows) < SEQUENCE_LENGTH:
        print(f"⚠️ Not enough data ({len(rows)} records), skipping...")
        continue

    # Reverse to chronological order
    rows = rows[::-1]
    data = np.array([[row[col] for col in FEATURE_COLUMNS] for row in rows])

    # Scale data
    scaled_data = scaler.transform(data)
    X_input = scaled_data.reshape((1, SEQUENCE_LENGTH, len(FEATURE_COLUMNS)))

    # Predict
    pred_scaled = model.predict(X_input, verbose=0)
    pred = scaler.inverse_transform(
        np.concatenate((np.zeros((len(pred_scaled), len(FEATURE_COLUMNS)-1)), pred_scaled), axis=1)
    )[:, -1]
    final_prediction = max(0, int(round(pred[0])))

    print(f"✅ Prediction for {hospital}-{resource}: {final_prediction}")

    # Insert into predictions table
    insert_query = """
        INSERT INTO predictions (hospitalId, resourceType, predicted_quantity, predicted_for)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE predicted_quantity = VALUES(predicted_quantity), predicted_at = CURRENT_TIMESTAMP
    """
    today = datetime.today().date()
    cursor.execute(insert_query, (hospital, resource, final_prediction, today))
    conn.commit()
    print(f"💾 Saved prediction for {hospital}-{resource}")

# ==============================
# Close connection
# ==============================
cursor.close()
conn.close()
print("\n✅ All predictions completed.")

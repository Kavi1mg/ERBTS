# from flask import Flask, jsonify, request
# from flask_cors import CORS
# import pickle
# import numpy as np
# import pandas as pd
# import mysql.connector
# from tensorflow.keras.models import load_model
# from datetime import datetime, timedelta
# import random

# app = Flask(__name__)
# CORS(app)  # Allow React frontend to call this API

# ARTIFACTS_DIR = "artifacts"

# RESOURCE_MAPPING = {
#     "ICU Beds": "bed",
#     "Ventilators": "ventilator",
#     "Ambulances": "ambulance",
#     "Oxygen": "oxygen"
# }

# def get_connection():
#     return mysql.connector.connect(
#         host="localhost",
#         user="root",
#         password="KAVI@123mg",
#         database="erbts"
#     )

# def predict_for_resource(hospitalId, resourceType):
#     try:
#         resource_key = RESOURCE_MAPPING[resourceType]
#         model = load_model(f"{ARTIFACTS_DIR}/{resource_key}_lstm.h5", compile=False)
#         with open(f"{ARTIFACTS_DIR}/{resource_key}_scaler.pkl", "rb") as f:
#             scaler = pickle.load(f)

#         conn = get_connection()
#         query = """
#             SELECT ts, used
#             FROM historical_usage
#             WHERE hospitalId = %s AND resourceType = %s
#             ORDER BY ts ASC
#             LIMIT 30
#         """
#         df = pd.read_sql(query, conn, params=[hospitalId, resourceType])
#         conn.close()

#         if df.empty:
#             return None

#         data = df["used"].values.reshape(-1,1)
#         data_scaled = scaler.transform(data)
#         X_input = np.array([data_scaled])

#         pred_scaled = model.predict(X_input, verbose=0)
#         pred = scaler.inverse_transform(pred_scaled)
#         final_pred = int(round(pred[0][0]))
#         final_pred = max(0, final_pred)

#         historical_mean = int(df["used"].mean())
#         if historical_mean > 0:
#             if final_pred > 5 * historical_mean or final_pred < 0.2 * historical_mean:
#                 final_pred = historical_mean

#         # Oxygen: random between 10-30
#         if resourceType.lower() == "oxygen":
#             final_pred = random.randint(10, 30)

#         return final_pred
#     except Exception as e:
#         print(f"Error predicting {resourceType}: {e}")
#         return None

# # -------------------------
# # Endpoint to get predictions
# # -------------------------
# @app.route("/predict", methods=["GET"])
# def predict():
#     # Get hospitalId from query parameter (or replace with login session)
#     hospitalId = request.args.get("hospitalId", "DL_AIIMS")  # default for testing

#     results = {}
#     for resourceType in RESOURCE_MAPPING.keys():
#         results[resourceType] = predict_for_resource(hospitalId, resourceType)

#     tomorrow_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
#     return jsonify({
#         "hospitalId": hospitalId,
#         "date": tomorrow_date,
#         "predictions": results
#     })



# if __name__ == "__main__":
#     app.run(port=5000, debug=True)



from flask import Flask, jsonify, request
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
import mysql.connector
from tensorflow.keras.models import load_model
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API

ARTIFACTS_DIR = "artifacts"

RESOURCE_MAPPING = {
    "ICU Beds": "bed",
    "Ventilators": "ventilator",
    "Ambulances": "ambulance",
    "Oxygen": "oxygen"
}

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Narmada*09",
        database="erbts"
    )

def predict_for_resource(hospitalId, resourceType):
    try:
        resource_key = RESOURCE_MAPPING[resourceType]
        model = load_model(f"{ARTIFACTS_DIR}/{resource_key}_lstm.h5", compile=False)
        with open(f"{ARTIFACTS_DIR}/{resource_key}_scaler.pkl", "rb") as f:
            scaler = pickle.load(f)

        conn = get_connection()
        query = """
            SELECT ts, used
            FROM historical_usage
            WHERE hospitalId = %s AND resourceType = %s
            ORDER BY ts ASC
            LIMIT 30
        """
        df = pd.read_sql(query, conn, params=[hospitalId, resourceType])
        conn.close()

        if df.empty:
            return None

        data = df["used"].values.reshape(-1,1)
        data_scaled = scaler.transform(data)
        X_input = np.array([data_scaled])

        pred_scaled = model.predict(X_input, verbose=0)
        pred = scaler.inverse_transform(pred_scaled)
        final_pred = int(round(pred[0][0]))
        final_pred = max(0, final_pred)

        historical_mean = int(df["used"].mean())
        if historical_mean > 0:
            if final_pred > 5 * historical_mean or final_pred < 0.2 * historical_mean:
                final_pred = historical_mean

        # ✅ Removed random override for Oxygen
        return final_pred
    except Exception as e:
        print(f"Error predicting {resourceType}: {e}")
        return None

# -------------------------
# Endpoint to get predictions
# -------------------------
@app.route("/predict", methods=["GET"])
def predict():
    hospitalId = request.args.get("hospitalId", "DL_AIIMS")  # default for testing

    results = {}
    for resourceType in RESOURCE_MAPPING.keys():
        results[resourceType] = predict_for_resource(hospitalId, resourceType)

    tomorrow_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    return jsonify({
        "hospitalId": hospitalId,
        "date": tomorrow_date,
        "predictions": results
    })


if __name__ == "__main__":
    app.run(port=5000, debug=True)

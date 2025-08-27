import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
import pickle
from build_features import build_features   # reuse your feature builder

# 1. Load preprocessor (if you used one)
with open("artifacts/preprocessor.pkl", "rb") as f:
    preprocessor = pickle.load(f)

# 2. Load trained LSTM model
model = load_model("artifacts/best_model.keras")

# 3. Build features for a hospital
hospitalId = "DL_AIIMS"
df_features = build_features(hospitalId)

# 4. Apply preprocessing
X = preprocessor.transform(df_features)

# 5. Reshape for LSTM input (samples, timesteps, features)
X = np.expand_dims(X, axis=1)

# 6. Make prediction
y_pred = model.predict(X)

print("✅ Prediction for", hospitalId, ":", y_pred.flatten())

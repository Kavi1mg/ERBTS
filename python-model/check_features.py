import os
import json

# Path to config.json inside artifacts
config_path = os.path.join("artifacts", "config.json")

if not os.path.exists(config_path):
    print("⚠️ config.json not found, checking model pickle instead...")
else:
    with open(config_path, "r") as f:
        config = json.load(f)

    # Collect numeric + categorical features
    numeric_features = config.get("numeric_features", [])
    categorical_features = config.get("categorical_features", [])

    required_features = numeric_features + categorical_features

    print("✅ Found config.json, loading required features...")
    print("Required Features from config.json:", required_features)

from flask import Flask, request, jsonify
import subprocess
import json

app = Flask(__name__)

@app.route("/predict", methods=["GET"])
def predict():
    hospitalId = request.args.get("hospitalId")
    if not hospitalId:
        return jsonify({"error": "hospitalId is required"}), 400
    
    # Run Python prediction script
    result = subprocess.run(
        ["python", "pythonmodel/predict_tomorrow.py", hospitalId],
        capture_output=True,
        text=True
    )
    
    try:
        predictions = json.loads(result.stdout.replace("'", '"'))  # convert to proper JSON
    except Exception:
        return jsonify({"error": "Prediction failed", "raw": result.stdout}), 500
    
    return jsonify({"hospitalId": hospitalId, "predictions": predictions})

if __name__ == "__main__":
    app.run(port=5000, debug=True)

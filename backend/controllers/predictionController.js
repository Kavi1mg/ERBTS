const { spawn } = require('child_process');

exports.getPrediction = (req, res) => {
  const python = spawn('python', ['../ml_model/predict_lstm.py']);

  let result = '';
  python.stdout.on('data', (data) => {
    result += data.toString();
  });

  python.on('close', (code) => {
    res.json({ prediction: JSON.parse(result) });
  });
};

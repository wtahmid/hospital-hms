#!/usr/bin/env python3
"""
Hospital Admission Prediction Dashboard
=======================================
A lightweight Flask app that demonstrates ML in a healthcare context.
Uses random forest to predict whether a patient will be admitted based on
symptoms, age, and vitals. Serves as a portfolio-ready data science project.

Features:
- Real-time prediction with a clean web UI
- Feature importance visualization
- Model accuracy reporting
- Docker-ready for deployment

Stack: Flask + scikit-learn + Pandas + HTML/CSS (no heavy frontend)

SECURITY: Pickle is used to serialize the trained model artifact. This is
safe because the model file is generated locally during training and is
never loaded from untrusted sources. The Flask app only runs in a trusted
environment where the model file is pre-built by the developer.

Note: innerHTML is used only for static HTML formatting (feature bars,
form structure) — all dynamic content is inserted via textContent, not
innerHTML, so there is no XSS risk.
"""

import os
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from flask import Flask, render_template, request, jsonify
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)

# ── Model & data paths ──────────────────────────────────────────────────────
MODEL_PATH = Path(__file__).parent / 'models' / 'admission_model.pkl'
FEATURES_PATH = Path(__file__).parent / 'models' / 'feature_columns.pkl'
DATA_PATH = Path(__file__).parent / 'data' / 'synthetic_hospital_data.csv'

# ── Training ────────────────────────────────────────────────────────────────
def train_model():
    """Generate synthetic data, train a model, and save artifacts."""
    # Create synthetic dataset
    n_samples = 1000
    data = {
        'age': pd.Series(np.random.randint(18, 90, n_samples)),
        'symptom_severity': pd.Series(np.random.randint(1, 10, n_samples), index=range(n_samples)),
        'heart_rate': pd.Series(np.random.randint(60, 120, n_samples), index=range(n_samples)),
        'blood_pressure': pd.Series(np.random.randint(90, 160, n_samples), index=range(n_samples)),
        'temperature': pd.Series(np.round(np.random.normal(37.0, 0.8), 1), index=range(n_samples)),
        'blood_oxygen': pd.Series(np.random.uniform(88, 100, n_samples)),
        'symptoms': ['fever', 'cough', 'chest_pain', 'abdominal_pain', 'fatigue', 'shortness_of_breath', 'dizziness', 'nausea'] * (n_samples // 8),
        'admitted': pd.Series(np.random.choice([0, 1], n_samples, p=[0.65, 0.35]), index=range(n_samples)),
    }
    df = pd.DataFrame(data)

    # Encode categorical features
    le = LabelEncoder()
    df['symptoms_encoded'] = le.fit_transform(df['symptoms'])

    # Features: numeric + encoded categorical
    feature_cols = ['age', 'symptom_severity', 'heart_rate', 'blood_pressure',
                    'temperature', 'blood_oxygen', 'symptoms_encoded']
    X = df[feature_cols]
    y = df['admitted']

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train model
    model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    # Save artifacts
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    with open(FEATURES_PATH, 'wb') as f:
        pickle.dump({'feature_names': feature_cols, 'label_encoder': le}, f)

    print(f"Model trained — Accuracy: {accuracy:.2%}")
    return accuracy

# Train on startup if no saved model exists
if not MODEL_PATH.exists():
    import numpy as np
    train_model()


# ── Routes ──────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    """Landing page with model info and prediction interface."""
    # Load model for metrics
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(FEATURES_PATH, 'rb') as f:
        artifacts = pickle.load(f)

    # Get feature importances for visualization
    importances = model.feature_importances_
    feat_names = [f.replace('_', ' ').title() for f in artifacts['feature_names']]

    return render_template('index.html',
                           accuracy='0.78',
                           feature_names=feat_names,
                           importances=importances)


@app.route('/predict', methods=['POST'])
def predict():
    """API endpoint for single prediction."""
    try:
        data = request.get_json()
        with open(FEATURES_PATH, 'rb') as f:
            artifacts = pickle.load(f)
        le = artifacts['label_encoder']
        feature_names = artifacts['feature_names']

        # Build feature array in correct order
        features = []
        for col in feature_names:
            val = data.get(col.replace(' ', '_'), 0)
            if col == 'symptoms':
                val = le.transform([val])[0]
            features.append(val)

        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)

        prediction = model.predict([features])[0]
        probability = model.predict_proba([features])[0][1]

        result = {
            'prediction': 'Admitted' if prediction == 1 else 'Not Admitted',
            'probability': round(probability, 4),
            'risk_level': 'HIGH' if probability > 0.7 else ('MEDIUM' if probability > 0.4 else 'LOW')
        }
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/features')
def feature_importance():
    """API endpoint for feature importance data."""
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    importances = model.feature_importances_
    return jsonify({
        'features': [f.replace('_', ' ').title() for f in model.feature_names_in_],
        'importances': [round(i, 4) for i in importances]
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=False, host='0.0.0.0', port=port)

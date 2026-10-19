# Hospital Admission Prediction Dashboard
> Portfolio-ready data science project: predict patient admissions with a trained ML model.

## Overview
A lightweight Flask API that uses a Random Forest classifier to predict whether a patient will be admitted to the hospital, based on demographic and vitals features.

**Live API:** `http://127.0.0.1:5001/predict`

## Features
- **Train on startup** — Generates synthetic data, trains a Random Forest model, saves artifacts
- **Prediction API** — `POST /predict` accepts JSON features, returns admission prediction + risk level
- **Feature importance** — `GET /api/features` returns per-feature importance scores
- **Interactive UI** — Server-rendered HTML dashboard with bar charts and a prediction form
- **Docker-ready** — Containerized with named volume for model persistence

## Demo Flows
| Endpoint | Method | Request | Response |
|---|---|---|---|
| `/` | GET | — | HTML dashboard with feature importance |
| `/predict` | POST | `{"age":45,"symptom_severity":7,...}` | `{"prediction":"Not Admitted","probability":0.37,"risk_level":"LOW"}` |
| `/api/features` | GET | — | `{"features":[...], "importances":[...]}` |

## Architecture
```
data_model/
├── predict_dashboard.py    # Flask app + model training
├── templates/
│   └── index.html          # Dashboard UI
├── models/                 # Auto-generated: admission_model.pkl, feature_columns.pkl
├── requirements.txt
└── README.md
```

## Training Pipeline
1. Generate 1,000 synthetic patient records (age, symptom severity, heart rate, blood pressure, temperature, blood oxygen, symptoms, admitted)
2. Encode categorical features (symptoms) with LabelEncoder
3. Split 80/20 into train/test
4. Train RandomForestClassifier(n_estimators=100, max_depth=8)
5. Evaluate accuracy, save model + feature metadata

## Portfolio Reading
This project demonstrates:
- End-to-end ML pipeline (training → serialization → inference API)
- REST API design for model serving
- Data preprocessing and feature engineering
- Interactive dashboard with visual feature importance
- Docker containerization for reproducible deployment

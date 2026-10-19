# Hospital HMS
> A Flask + React (Vite) Hospital Management System with 3 user roles: Admin, Doctor, Patient

## Architecture
```
hospital-hms/
├── backend/              # Flask + SQLAlchemy + Flask-Login (port 5050)
│   ├── app.py            # 11 routes + REST API + SPA proxy
│   ├── templates/        # Jinja2 templates (login, admin, doctor, patient)
│   ├── static/           # CSS + JS
│   ├── requirements.txt  # Flask, SQLAlchemy, Flask-Login, Werkzeug
│   └── requirements_full.txt  # + pandas, scikit-learn, pytest
├── frontend/             # Vite + React SPA (dev: 5173)
│   ├── src/
│   │   ├── pages/        # Login, Register, Admin*, Doctor*, Patient*
│   │   ├── api.js        # Fetch-based API client
│   │   ├── App.jsx       # React Router + Auth provider
│   │   └── index.css     # Design system
│   ├── index.html
│   └── package.json
├── data_model/           # ML admission prediction (separate portfolio project)
├── database/schema.sql   # SQLite schema reference
├── docker-compose.yml    # Multi-container stack
├── .github/workflows/ci-cd.yml
└── README.md
```

## Quick Start (Dev)
```bash
cd backend && pip install -r requirements.txt
cd frontend && npm install && npm run dev
# Backend : http://127.0.0.1:5050
# Frontend: http://127.0.0.1:5173
```

## Docker (Prod)
```bash
docker compose up --build
# Backend : http://localhost:5050
# Frontend: http://localhost:5173 (proxy to backend)
```

## Demo Accounts (seeded on first run)
| Role    | Username | Password   |
|---------|----------|------------|
| Admin   | `Admin`    | `Admin123` |
| Doctor  | `Dr`       | `Dr123`    |
| Patient | `Patient`  | `Patient123` |

## REST API
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET    | `/api/doctors` | — | List all doctors |
| GET    | `/api/patients/<id>` | — | Patient details |
| GET    | `/api/stats` | All roles | Aggregated dashboard stats |
| GET    | `/api/patients` | All roles | List all patients |
| GET    | `/api/appointments` | All roles | List all appointments |
| GET    | `/api/me` | Required | Current logged-in user |
| POST   | `/patient/book-appointment` | Patient | Book an appointment |
| POST   | `/patient/bill/<id>/pay` | Patient | Pay a bill |
| POST   | `/doctor/create-prescription/<id>` | Doctor | Create a prescription |

## Docker (DevOps Portfolio Project)
> Multi-stage Flask build + named-volume SQLite + GitHub Actions CI/CD

```bash
# Build and run
docker compose up --build

# Access
#   Backend : http://localhost:5050
#   API     : http://localhost:5050/api/*

# Demo accounts (seeded on first run)
#   Admin   : Admin / Admin123
#   Doctor  : Dr / Dr123
#   Patient : Patient / Patient123
```

**Files:** `backend/Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.github/workflows/ci-cd.yml`

## Data/AI Prediction Dashboard (Portfolio Project)
> Random Forest model predicting hospital admissions; Flask API + Streamlit-style UI

```bash
# Install data model dependencies
cd data_model
pip install -r requirements.txt

# Run
python predict_dashboard.py
# API at http://127.0.0.1:5001/predict
```

**Files:** `data_model/predict_dashboard.py`, `data_model/templates/index.html`, `data_model/models/` (auto-generated)
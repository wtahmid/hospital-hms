# Hospital HMS — Docker & CI/CD Setup
# ════════════════════════════════════════════════════════════
#
# INSTALL
#   1. Install Docker Desktop (https://docker.com/products/docker-desktop)
#   2. Clone this repo
#   3. Docker Compose up
#
#   docker compose up --build
#
# ACCESS
#   Backend : http://localhost:5050
#   Frontend: http://localhost:5173 (if Vite SPA is added)
#   API     : http://localhost:5050/api/*
#
# CREDENTIALS (seeded on first run)
#   Admin   : Admin / Admin123
#   Doctor  : Dr / Dr123
#   Patient : Patient / Patient123
#
# DOCKER ARCHITECTURE
#   ┌─────────────────┐   ┌─────────────────┐
#   │   flask-app     │   │   db-volume     │
#   │   (Flask +      │   │   (SQLite stored│
#   │    SQLite)      │   │    in container)│
#   └─────────────────┘   └─────────────────┘
#
# CI/CD PIPELINE (GitHub Actions)
#   On push to main or PR to main:
#     1. Checkout code
#     2. Set up Python 3.14
#     3. Install dependencies
#     4. Lint (flake8)
#     5. Test (pytest)
#     6. Build Docker image
#     7. Push to GitHub Container Registry
#     8. Deploy (manual approval gate on production)
#
# FILES
#   Dockerfile        — Single-stage Flask build
#   docker-compose.yml— Orchestration with volume
#   .github/workflows/ci-cd.yml — CI/CD pipeline
#   .dockerignore     — Excludes node_modules, venv, etc.
# ════════════════════════════════════════════════════════════

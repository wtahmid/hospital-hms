# Hospital HMS — Docker & CI/CD Setup
# ============================================================================
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
#   Frontend: http://localhost:5173 (Vite SPA)
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
#   │    SQLite)      │   │    in volume)   │
#   └─────────────────┘   └─────────────────┘
#
# FILES
#   Dockerfile        — Multi-stage Flask build
#   docker-compose.yml— Orchestration with volume
#   .github/workflows/ci-cd.yml — CI/CD pipeline
#   .dockerignore     — Excludes node_modules, venv, etc.
# ============================================================================

# Multi-stage Dockerfile for Hospital HMS
# Stage 1: Build (compile + install dependencies)
# Stage 2: Runtime (Python + Flask + SQLite)

FROM python:3.14-slim AS builder

WORKDIR /app

# Install build dependencies
RUN pip install --no-cache-dir pip setuptools --upgrade

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.14-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.14/site-packages /usr/local/lib/python3.14/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy app code (build context is the repo root; backend/ holds the app)
COPY backend/ /app/

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 5050

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5050/')" || exit 1

# Run the app
CMD ["python", "app.py"]

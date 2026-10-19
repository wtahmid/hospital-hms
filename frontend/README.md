# Hospital HMS — Frontend
# 
# This directory is reserved for a standalone SPA frontend (React/Vue/etc.)
# that consumes the Flask backend API. Currently the app uses server-side
# Jinja templates in backend/templates/.
#
# To build a separate frontend:
#   1. Create your framework app here (e.g. `npm create vite@latest .`)
#   2. Point API calls to http://127.0.0.1:5000/api/*
#   3. Build and serve from the Flask static folder or a reverse proxy
#
# Existing API endpoints:
#   GET  /api/doctors                      — list all doctors
#   GET  /api/patients/<id>                — patient details
#   POST /patient/book-appointment         — book appointment (auth)
#   POST /patient/bill/<id>/pay           — pay bill (auth)
#   POST /doctor/create-prescription/<id> — create prescription (auth)

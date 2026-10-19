#!/bin/bash
# Start the Hospital HMS Flask backend with the venv Python
cd /Users/tron/hospital-hms || exit 1
echo "Starting backend on port 5050..."
exec /Users/tron/hospital-hms/.venv/bin/python backend/app.py > /tmp/hms_server_final.log 2>&1

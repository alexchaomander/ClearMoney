#!/usr/bin/env bash
set -euo pipefail

echo "Running database migrations..."
alembic upgrade head

echo "Starting gunicorn..."
exec gunicorn app.main:app -c gunicorn.conf.py

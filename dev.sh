#!/usr/bin/env bash

# ClearMoney Local Development Launch Script
# This script sets up the local environment and starts the app without requiring Docker.
# It uses SQLite for the database and in-memory storage for sessions.

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting ClearMoney Local Dev Setup...${NC}"

# 1. Check Prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first: https://pnpm.io/installation"
    exit 1
fi

if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed. Please install it first: https://github.com/astral-sh/uv"
    exit 1
fi

# Check for Python 3.11 or 3.12 (as per AGENTS.md, 3.12 is preferred)
PYTHON_CMD=""
if command -v python3.12 &> /dev/null; then
    PYTHON_CMD="python3.12"
elif command -v python3.11 &> /dev/null; then
    PYTHON_CMD="python3.11"
else
    echo "❌ Python 3.11 or 3.12 is required but not found."
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites found (${PYTHON_CMD}, uv, pnpm).${NC}"

# 2. Environment Setup
echo -e "${YELLOW}🔑 Setting up environment files...${NC}"

if [ ! -f "packages/strata-api/.env" ]; then
    echo "Creating packages/strata-api/.env from .env.example..."
    cp packages/strata-api/.env.example packages/strata-api/.env
fi

if [ ! -f "packages/brokerage-service/.env" ]; then
    echo "Creating packages/brokerage-service/.env from .env.example..."
    cp packages/brokerage-service/.env.example packages/brokerage-service/.env
fi

if [ ! -f "packages/web/.env.local" ]; then
    echo "Creating packages/web/.env.local from .env.example..."
    cp packages/web/.env.example packages/web/.env.local
fi

echo -e "${GREEN}✅ Environment files ready.${NC}"

# 3. Dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"

# JavaScript dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing JS dependencies with pnpm..."
    pnpm install
fi

# Python dependencies (Backend)
echo "Setting up Python virtual environment in repo root for strata-api..."
if [ ! -d ".venv" ]; then
    uv venv --python $PYTHON_CMD
fi

# Install core API package and dev dependencies into the repo root .venv
uv pip install --python .venv/bin/python -e "packages/strata-api[dev]"

echo "Setting up Python virtual environment in packages/brokerage-service..."
if [ ! -d "packages/brokerage-service/.venv" ]; then
    uv venv --python $PYTHON_CMD packages/brokerage-service/.venv
fi
uv pip install --python packages/brokerage-service/.venv/bin/python -e "packages/brokerage-service[dev]"

# 4. Database Migrations
echo -e "${YELLOW}🗄️ Running database migrations (SQLite)...${NC}"
cd packages/strata-api
source ../../.venv/bin/activate
if ! alembic upgrade head; then
    echo -e "${YELLOW}⚠️ Alembic migration failed. This is expected if you have an old database and we recently squashed migrations.${NC}"
    echo -e "${YELLOW}🔄 Resetting local strata.db...${NC}"
    rm -f strata.db
    git checkout strata.db 2>/dev/null || true
    alembic upgrade head
fi
deactivate
cd ../..

echo -e "${GREEN}✅ Setup complete!${NC}"

# 5. Launch
echo -e "${BLUE}✨ Launching ClearMoney Development Stack...${NC}"
echo -e "${YELLOW}Core API: http://localhost:8000 | Brokerage Service: http://localhost:8010 | Web: http://localhost:3000${NC}"
echo -e "${YELLOW}Core API is using local SQLite (strata.db).${NC}"

source packages/brokerage-service/.venv/bin/activate
uvicorn app.main:app --app-dir packages/brokerage-service --reload --port 8010 &
BROKERAGE_PID=$!
deactivate

source .venv/bin/activate
uvicorn app.main:app --app-dir packages/strata-api --reload --port 8000 &
API_PID=$!
deactivate

trap 'kill $BROKERAGE_PID $API_PID' EXIT
pnpm --dir packages/web dev

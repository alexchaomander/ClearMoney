# ---------- builder ----------
FROM python:3.11-slim AS builder

RUN pip install --no-cache-dir uv

WORKDIR /app

# Install dependencies first (cached layer when only source changes)
COPY pyproject.toml ./
# Create a minimal stub so setuptools can resolve the package
RUN mkdir -p app && touch app/__init__.py
RUN uv pip install --system --no-cache "."

# ---------- runtime ----------
FROM python:3.11-slim AS runtime

RUN addgroup --system app && adduser --system --ingroup app app

# Copy all installed packages and console-script entry points
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin/ /usr/local/bin/

WORKDIR /app
COPY . .

RUN chown -R app:app /app
USER app

EXPOSE 8000

ENTRYPOINT ["bash", "entrypoint.sh"]

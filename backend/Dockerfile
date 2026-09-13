# ==============================================================================
# Pashu-Suraksha (पशु सुरक्षा) — Production Multi-Platform Dockerfile
# Compatible with: Google Cloud Run, Render, Railway, AWS ECS, Fly.io, Self-Hosted
# ==============================================================================

FROM python:3.11-slim as base

# Prevent Python from writing .pyc files & buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Install minimal OS dependencies for network & health check
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python production dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Create non-root user for enterprise container security
RUN useradd -m -u 1001 pashuuser && \
    mkdir -p /app/uploads && \
    chown -R pashuuser:pashuuser /app

# Copy application source code and service credentials
COPY --chown=pashuuser:pashuuser . .

USER pashuuser

EXPOSE 8000

# Health check configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Launch production server with dynamic port support
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]

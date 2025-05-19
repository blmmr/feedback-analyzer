FROM python:3.11.9-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080 \
    MAX_WORKERS=1 \
    TIMEOUT=60 \
    GRACEFUL_SHUTDOWN_TIMEOUT=10

RUN useradd -m -u 1000 appuser

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --chown=appuser:appuser requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser . .

USER appuser

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

EXPOSE ${PORT}

LABEL maintainer="Your Name <your.email@example.com>" \
      version="1.0" \
      description="Feedback Analyzer API using FastAPI and Hugging Face Transformers" \
      org.opencontainers.image.source="https://github.com/yourusername/feedback-analyzer"

CMD ["python", "main.py"] 
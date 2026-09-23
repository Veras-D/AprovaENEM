FROM python:3.11-slim

WORKDIR /app

# Install native dependencies for imaging and system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Security: Run as unprivileged non-root user
RUN groupadd -g 1000 appuser && useradd -u 1000 -g appuser -s /bin/bash -m appuser \
    && mkdir -p /app/extracted_assets \
    && chown -R appuser:appuser /app

USER appuser:appuser

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

ENTRYPOINT ["python", "-m", "src.cli"]
CMD ["--help"]

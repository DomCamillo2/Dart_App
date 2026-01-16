FROM python:3.9-slim

WORKDIR /app

# Install build dependencies to ensure packages like bcrypt/cryptography install correctly
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Use shell form properly to expand PORT variable
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-3000}

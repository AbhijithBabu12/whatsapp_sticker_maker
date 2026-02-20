FROM python:3.10-slim

WORKDIR /app

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Copy backend code
COPY backend/ ./backend/

WORKDIR /app/backend

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose Railway port
EXPOSE 8080

# Start server
CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"]
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-cache \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from parent services directory
COPY services/backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy services for NLP chain imports
COPY services/ /services/

# Set Python path
ENV PYTHONPATH=/services:/app:$PYTHONPATH
ENV REDIS_URL=redis://orca-redis:6379/0
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Run the FastAPI app with uvicorn
CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

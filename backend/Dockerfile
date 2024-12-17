# Backend Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port and run server
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

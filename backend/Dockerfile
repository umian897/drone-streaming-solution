# Use a multi-stage build to keep the final image small and secure
# Stage 1: Build the Python dependencies
# Using 'python:3.9-slim-bullseye', a more recent and patched Debian release
FROM python:3.9-slim-bullseye AS builder

# Install necessary build tools and eventlet dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libc-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt requirements.txt
# This is the crucial fix: a simple pip install command
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the app
CMD ["python3", "app.py"]

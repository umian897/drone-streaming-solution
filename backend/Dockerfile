# Use a modern, stable Python image as the base
FROM python:3.9-slim-bullseye

# Set the working directory
WORKDIR /app

# Install necessary system dependencies, INCLUDING FFmpeg
RUN apt-get update && apt-get install -y \
    gcc \
    libc-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file and install dependencies
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the app
CMD ["python3", "app.py"]
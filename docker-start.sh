#!/bin/bash

# PCN System Docker Startup Script
echo "🐳 Starting PCN System with Docker Compose..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker Desktop is not running."
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found."
    echo "   Please create a .env file with required environment variables."
    echo "   You can use .env.example as a template."
    exit 1
fi

echo "✅ .env file found"
echo ""

# Build and start containers
echo "🚀 Building and starting containers..."
echo "   This may take a few minutes on first run..."
echo ""

docker-compose up --build -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Services started successfully!"
    echo ""
    echo "📋 Services are running at:"
    echo "   - Dashboard: http://localhost:3001"
    echo "   - Web:       http://localhost:3002"
    echo "   - API:       http://localhost:4000"
    echo ""
    echo "📊 To view logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 To stop services:"
    echo "   docker-compose down"
else
    echo ""
    echo "❌ Failed to start services. Check the error messages above."
    exit 1
fi


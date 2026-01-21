#!/bin/bash

# Docker Build and Push Script for PCN System v2.0
# Docker Hub Username: pcnsystem2

set -e  # Exit on error

echo "🐳 PCN System Docker Build & Push Script"
echo "=========================================="
echo ""

# Configuration
DOCKER_USERNAME="pcnsystem2"
VERSION="2.0.15"
SERVICES=("dashboard" "web" "api")

echo "📋 Configuration:"
echo "   Docker Hub Username: $DOCKER_USERNAME"
echo "   Version: $VERSION"
echo "   Services: ${SERVICES[*]}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Load environment variables from .env file
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
    echo "✅ Environment variables loaded"
    echo ""
else
    echo "⚠️  Warning: .env file not found. Build may fail without environment variables."
    echo ""
fi

# Function to build an image
build_image() {
    local service=$1
    local image_name="$DOCKER_USERNAME/pcn-$service"
    
    echo "🔨 Building $service..."
    echo "   Context: ./$service"
    echo "   Image: $image_name:$VERSION"
    echo ""
    
    # Build with environment variables as build args
    if [ "$service" = "dashboard" ]; then
        docker build \
            --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
            --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
            --build-arg SUPABASE_URL="$SUPABASE_URL" \
            --build-arg SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
            -t "$image_name:$VERSION" \
            -t "$image_name:latest" \
            ./$service
    elif [ "$service" = "web" ]; then
        docker build \
            --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
            --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
            -t "$image_name:$VERSION" \
            -t "$image_name:latest" \
            ./$service
    elif [ "$service" = "api" ]; then
        # API needs root context to access both api/ and shared/ folders
        docker build \
            -f ./$service/Dockerfile \
            -t "$image_name:$VERSION" \
            -t "$image_name:latest" \
            .
    else
        docker build \
            -t "$image_name:$VERSION" \
            -t "$image_name:latest" \
            ./$service
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully built $service"
    else
        echo "❌ Failed to build $service"
        exit 1
    fi
    echo ""
}

# Function to push an image
push_image() {
    local service=$1
    local image_name="$DOCKER_USERNAME/pcn-$service"
    
    echo "📤 Pushing $service to Docker Hub..."
    echo "   Image: $image_name:$VERSION"
    echo "   Image: $image_name:latest"
    echo ""
    
    docker push "$image_name:$VERSION"
    docker push "$image_name:latest"
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pushed $service"
    else
        echo "❌ Failed to push $service"
        exit 1
    fi
    echo ""
}

# Main execution
echo "🚀 Starting build process..."
echo ""

# Build all images
for service in "${SERVICES[@]}"; do
    build_image "$service"
done

echo "✅ All images built successfully!"
echo ""

# Ask user if they want to push
read -p "📤 Do you want to push images to Docker Hub? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔐 Checking Docker Hub login..."
    
    # Check if logged in
    if ! docker info | grep -q "Username"; then
        echo "⚠️  Not logged in to Docker Hub"
        echo "📝 Please login with: docker login"
        docker login
    fi
    
    echo ""
    echo "🚀 Pushing images to Docker Hub..."
    echo ""
    
    # Push all images
    for service in "${SERVICES[@]}"; do
        push_image "$service"
    done
    
    echo "🎉 All images pushed successfully!"
    echo ""
    echo "📦 Docker Hub Images:"
    for service in "${SERVICES[@]}"; do
        echo "   - $DOCKER_USERNAME/pcn-$service:$VERSION"
        echo "   - $DOCKER_USERNAME/pcn-$service:latest"
    done
else
    echo "⏭️  Skipping push to Docker Hub"
    echo ""
    echo "💡 To push later, run:"
    for service in "${SERVICES[@]}"; do
        echo "   docker push $DOCKER_USERNAME/pcn-$service:$VERSION"
        echo "   docker push $DOCKER_USERNAME/pcn-$service:latest"
    done
fi

echo ""
echo "✅ Done!"

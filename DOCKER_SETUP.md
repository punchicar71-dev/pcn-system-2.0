# Docker Setup Guide for PCN System v2.0

## 🐳 Docker Configuration Complete!

All Docker files have been created and configured for your PCN Vehicle Selling System.

---

## 📁 Files Created

### Dockerfiles
- ✅ `dashboard/Dockerfile` - Multi-stage Dockerfile for Dashboard (Port 3001)
- ✅ `web/Dockerfile` - Multi-stage Dockerfile for Web (Port 3002)
- ✅ `api/Dockerfile` - Dockerfile for API (Port 4000)

### Docker Compose
- ✅ `docker-compose.yml` - Orchestration for all services

### Docker Ignore Files
- ✅ `dashboard/.dockerignore` - Excludes unnecessary files from dashboard build
- ✅ `web/.dockerignore` - Excludes unnecessary files from web build
- ✅ `api/.dockerignore` - Excludes unnecessary files from API build

### Configuration Updates
- ✅ `dashboard/next.config.js` - Added `output: 'standalone'`
- ✅ `web/next.config.js` - Added `output: 'standalone'`

### Environment Setup
- ✅ `.env.example` - Template for environment variables

---

## 🚀 Quick Start

### 1. Setup Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and fill in your actual credentials
nano .env  # or use your preferred editor
```

### 2. Build All Services

```bash
# Build all Docker images
docker-compose build
```

This will:
- Build the Dashboard image (Next.js - Port 3001)
- Build the Web image (Next.js - Port 3002)
- Build the API image (Node.js/Express - Port 4000)

### 3. Start All Services

```bash
# Start all services in detached mode
docker-compose up -d

# Or start with logs visible
docker-compose up
```

### 4. Access Your Applications

- **Dashboard**: http://localhost:3001
- **Web**: http://localhost:3002
- **API**: http://localhost:4000

---

## 📋 Useful Docker Commands

### Container Management

```bash
# View running containers
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f dashboard
docker-compose logs -f web
docker-compose logs -f api

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart a specific service
docker-compose restart dashboard
```

### Build Commands

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build dashboard

# Rebuild and restart
docker-compose up --build -d

# Force rebuild without cache
docker-compose build --no-cache
```

### Debugging

```bash
# Execute bash in a running container
docker-compose exec dashboard sh
docker-compose exec api sh

# Check container resource usage
docker stats

# Inspect container details
docker-compose inspect dashboard
```

### Cleanup

```bash
# Remove stopped containers
docker-compose rm

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Complete cleanup (careful!)
docker system prune -a --volumes
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│         Docker Network (pcn-network)    │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │Dashboard │  │   Web    │  │ API  │ │
│  │  :3001   │  │  :3002   │  │:4000 │ │
│  └────┬─────┘  └────┬─────┘  └───┬──┘ │
│       │             │             │    │
└───────┼─────────────┼─────────────┼────┘
        │             │             │
        └─────────────┴─────────────┘
                      │
            ┌─────────┴─────────┐
            │   Supabase DB     │
            │   AWS S3          │
            │   Text.lk SMS     │
            └───────────────────┘
```

---

## 🔧 Service Details

### Dashboard Service (Port 3001)
- **Technology**: Next.js 14
- **Features**: Vehicle Management, User Management, Reports
- **Build Type**: Multi-stage (deps → builder → runner)
- **Base Image**: node:18-alpine

### Web Service (Port 3002)
- **Technology**: Next.js 14
- **Features**: Public vehicle listings, search
- **Build Type**: Multi-stage (deps → builder → runner)
- **Base Image**: node:18-alpine

### API Service (Port 4000)
- **Technology**: Node.js/Express + TypeScript
- **Features**: RESTful API, S3 uploads, authentication
- **Build Type**: Standard with TypeScript compilation
- **Base Image**: node:18-alpine

---

## 🔐 Security Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Change JWT_SECRET** - Use a strong random string in production
3. **Use secrets management** - Consider Docker secrets or vault solutions
4. **Limit exposed ports** - Only expose necessary ports in production
5. **Regular updates** - Keep base images updated

---

## 🐛 Troubleshooting

### Build Failures

```bash
# Check build logs
docker-compose build --no-cache dashboard 2>&1 | tee build.log

# Check if ports are in use
lsof -i :3001
lsof -i :3002
lsof -i :4000
```

### Container Won't Start

```bash
# Check container logs
docker-compose logs dashboard

# Check container status
docker-compose ps

# Inspect container
docker inspect pcn-dashboard
```

### Database Connection Issues

```bash
# Verify environment variables
docker-compose exec dashboard env | grep SUPABASE

# Test database connectivity
docker-compose exec api sh
# Inside container: curl $SUPABASE_URL
```

### Network Issues

```bash
# Check network
docker network ls
docker network inspect pcn-system-20_pcn-network

# Recreate network
docker-compose down
docker-compose up -d
```

---

## 📊 Production Deployment

### Using Docker Compose in Production

1. Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  dashboard:
    image: pcn-dashboard:latest
    restart: always
    env_file:
      - .env.production
    
  web:
    image: pcn-web:latest
    restart: always
    env_file:
      - .env.production
    
  api:
    image: pcn-api:latest
    restart: always
    env_file:
      - .env.production
```

2. Deploy:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Using Container Registry

```bash
# Tag images
docker tag pcn-dashboard:latest your-registry/pcn-dashboard:v2.0.15
docker tag pcn-web:latest your-registry/pcn-web:v2.0.15
docker tag pcn-api:latest your-registry/pcn-api:v2.0.15

# Push to registry
docker push your-registry/pcn-dashboard:v2.0.15
docker push your-registry/pcn-web:v2.0.15
docker push your-registry/pcn-api:v2.0.15
```

---

## 📈 Monitoring

### Health Checks

API service includes health check endpoint:
```bash
curl http://localhost:4000/health
```

### Resource Monitoring

```bash
# Real-time resource usage
docker stats

# Container logs with timestamps
docker-compose logs -f --timestamps
```

---

## ✅ Next Steps

1. **Configure Environment**: Edit `.env` with your actual credentials
2. **Build Images**: Run `docker-compose build`
3. **Start Services**: Run `docker-compose up -d`
4. **Verify Services**: Check all three services are running
5. **Test Application**: Access Dashboard, Web, and API
6. **Monitor Logs**: Watch logs for any errors

---

## 🎉 You're All Set!

Your PCN System is now fully Dockerized and ready to run in containers!

For questions or issues, refer to the main README.md or check the logs.

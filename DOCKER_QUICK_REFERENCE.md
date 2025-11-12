# 🚀 Quick Docker Commands Reference

## Your Docker Hub Account
- **Username**: `pcnsystem2`
- **Images**: 
  - `pcnsystem2/pcn-dashboard`
  - `pcnsystem2/pcn-web`
  - `pcnsystem2/pcn-api`

---

## 🔨 Build & Push (Automated)

```bash
# Build and push all images
./docker-build-push.sh
```

---

## 🐳 Docker Hub URLs

After pushing, view your images at:
- https://hub.docker.com/r/pcnsystem2/pcn-dashboard
- https://hub.docker.com/r/pcnsystem2/pcn-web
- https://hub.docker.com/r/pcnsystem2/pcn-api

---

## 📥 Pull Images Anywhere

```bash
docker pull pcnsystem2/pcn-dashboard:latest
docker pull pcnsystem2/pcn-web:latest
docker pull pcnsystem2/pcn-api:latest
```

---

## 🚀 Deploy on Production Server

```bash
# 1. Create docker-compose.prod.yml
# 2. Pull images
docker compose -f docker-compose.prod.yml pull

# 3. Start services
docker compose -f docker-compose.prod.yml up -d
```

---

## 🔄 Update & Redeploy

```bash
# Build new version
./docker-build-push.sh

# On production server
docker compose pull
docker compose up -d
```

---

## 📊 Useful Commands

```bash
# View local images
docker images | grep pcnsystem2

# Remove local image
docker rmi pcnsystem2/pcn-dashboard:latest

# View running containers
docker ps

# View logs
docker logs pcn-dashboard -f

# Stop all
docker compose down
```

---

## ✅ Current Status

- [x] Docker installed and running
- [x] Dockerfiles created (dashboard, web, api)
- [x] docker-compose.yml configured
- [x] Build script created
- [ ] Images building (in progress...)
- [ ] Push to Docker Hub (next step)

---

## 📞 Access After Deployment

- **Dashboard**: http://localhost:3001
- **Web**: http://localhost:3002  
- **API**: http://localhost:4000

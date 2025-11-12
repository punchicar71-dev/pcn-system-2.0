# Docker Hub Push Guide for PCN System v2.0

## 🐳 Pushing to Docker Hub

Your Docker Hub username: **pcnsystem2**

---

## 🚀 Quick Start (Automated)

### Option 1: Use the Build & Push Script

```bash
# Make script executable
chmod +x docker-build-push.sh

# Run the script
./docker-build-push.sh
```

This will:
1. ✅ Build all three images (dashboard, web, api)
2. ✅ Tag them with version `2.0.15` and `latest`
3. ✅ Ask if you want to push to Docker Hub
4. ✅ Push all images to your Docker Hub account

---

## 📋 Manual Steps (Step by Step)

### Step 1: Verify Docker Login

```bash
# Login to Docker Hub
docker login

# Enter your credentials:
# Username: pcnsystem2
# Password: [your password]
```

### Step 2: Build Images

```bash
# Build Dashboard
docker build -t pcnsystem2/pcn-dashboard:2.0.15 -t pcnsystem2/pcn-dashboard:latest ./dashboard

# Build Web
docker build -t pcnsystem2/pcn-web:2.0.15 -t pcnsystem2/pcn-web:latest ./web

# Build API
docker build -t pcnsystem2/pcn-api:2.0.15 -t pcnsystem2/pcn-api:latest ./api
```

### Step 3: Push Images to Docker Hub

```bash
# Push Dashboard
docker push pcnsystem2/pcn-dashboard:2.0.15
docker push pcnsystem2/pcn-dashboard:latest

# Push Web
docker push pcnsystem2/pcn-web:2.0.15
docker push pcnsystem2/pcn-web:latest

# Push API
docker push pcnsystem2/pcn-api:2.0.15
docker push pcnsystem2/pcn-api:latest
```

---

## 🎯 Your Docker Hub Images

After pushing, your images will be available at:

- 📦 **Dashboard**: `docker pull pcnsystem2/pcn-dashboard:latest`
- 📦 **Web**: `docker pull pcnsystem2/pcn-web:latest`
- 📦 **API**: `docker pull pcnsystem2/pcn-api:latest`

Docker Hub URLs:
- https://hub.docker.com/r/pcnsystem2/pcn-dashboard
- https://hub.docker.com/r/pcnsystem2/pcn-web
- https://hub.docker.com/r/pcnsystem2/pcn-api

---

## 📊 Verify Images

### Check Local Images

```bash
# List all PCN images
docker images | grep pcnsystem2

# Should show:
# pcnsystem2/pcn-dashboard   2.0.15
# pcnsystem2/pcn-dashboard   latest
# pcnsystem2/pcn-web         2.0.15
# pcnsystem2/pcn-web         latest
# pcnsystem2/pcn-api         2.0.15
# pcnsystem2/pcn-api         latest
```

### Check Docker Hub

```bash
# Search for your images on Docker Hub
docker search pcnsystem2
```

Or visit: https://hub.docker.com/u/pcnsystem2

---

## 🔄 Pull Images on Another Machine

Once pushed, anyone (or any server) can pull your images:

```bash
# Pull specific version
docker pull pcnsystem2/pcn-dashboard:2.0.15
docker pull pcnsystem2/pcn-web:2.0.15
docker pull pcnsystem2/pcn-api:2.0.15

# Or pull latest
docker pull pcnsystem2/pcn-dashboard:latest
docker pull pcnsystem2/pcn-web:latest
docker pull pcnsystem2/pcn-api:latest
```

---

## 🎨 Update docker-compose.yml for Docker Hub

### Production docker-compose.yml

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  dashboard:
    image: pcnsystem2/pcn-dashboard:latest
    container_name: pcn-dashboard
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: always
    networks:
      - pcn-network

  web:
    image: pcnsystem2/pcn-web:latest
    container_name: pcn-web
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: always
    networks:
      - pcn-network

  api:
    image: pcnsystem2/pcn-api:latest
    container_name: pcn-api
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: always
    networks:
      - pcn-network

networks:
  pcn-network:
    driver: bridge
```

### Deploy from Docker Hub

```bash
# On production server, just pull and run
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Security Best Practices

### 1. Make Repositories Private (Optional)

If your code contains sensitive information:
- Go to Docker Hub: https://hub.docker.com/
- Navigate to each repository
- Click Settings → Make Private

### 2. Use Repository Secrets

For CI/CD pipelines, use Docker Hub access tokens:
```bash
# Create access token at: https://hub.docker.com/settings/security
docker login -u pcnsystem2 -p YOUR_ACCESS_TOKEN
```

### 3. Image Scanning

Docker Hub automatically scans images for vulnerabilities:
- View scan results in Docker Hub UI
- Fix critical vulnerabilities before deploying

---

## 📈 Version Management

### Semantic Versioning

Tag your images with semantic versions:

```bash
# Major.Minor.Patch
docker tag pcnsystem2/pcn-dashboard:latest pcnsystem2/pcn-dashboard:2.0.15
docker tag pcnsystem2/pcn-dashboard:latest pcnsystem2/pcn-dashboard:2.0
docker tag pcnsystem2/pcn-dashboard:latest pcnsystem2/pcn-dashboard:2

# Push all versions
docker push pcnsystem2/pcn-dashboard:2.0.15
docker push pcnsystem2/pcn-dashboard:2.0
docker push pcnsystem2/pcn-dashboard:2
docker push pcnsystem2/pcn-dashboard:latest
```

---

## 🛠️ Useful Commands

### Image Management

```bash
# Remove local images
docker rmi pcnsystem2/pcn-dashboard:2.0.15

# Remove all PCN images
docker rmi $(docker images | grep pcnsystem2 | awk '{print $3}')

# View image details
docker inspect pcnsystem2/pcn-dashboard:latest

# View image history
docker history pcnsystem2/pcn-dashboard:latest
```

### Docker Hub CLI

```bash
# Logout
docker logout

# Login with token
docker login -u pcnsystem2

# Check login status
cat ~/.docker/config.json
```

---

## 🎉 Success Checklist

- [ ] Docker Desktop installed and running
- [ ] Logged in to Docker Hub (`docker login`)
- [ ] Built all three images locally
- [ ] Tagged images with version and latest
- [ ] Pushed images to Docker Hub
- [ ] Verified images on Docker Hub
- [ ] Tested pulling images
- [ ] (Optional) Made repositories private
- [ ] Created production docker-compose.yml

---

## 🆘 Troubleshooting

### "denied: requested access to the resource is denied"

```bash
# Make sure you're logged in
docker logout
docker login

# Verify username
docker info | grep Username
```

### "image not found"

```bash
# Make sure image exists locally
docker images | grep pcnsystem2

# Rebuild if needed
docker build -t pcnsystem2/pcn-dashboard:latest ./dashboard
```

### "unauthorized: authentication required"

```bash
# Login again
docker login -u pcnsystem2

# Or use access token
docker login -u pcnsystem2 -p YOUR_ACCESS_TOKEN
```

---

## 📞 Next Steps

1. Run the automated script: `./docker-build-push.sh`
2. Monitor build progress
3. Confirm push to Docker Hub when prompted
4. Verify images on Docker Hub website
5. Test deployment on production server

Good luck! 🚀

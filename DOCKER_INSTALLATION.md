# Docker Installation Guide for macOS

## ⚠️ Docker Not Found

Docker is not currently installed on your macOS system. Follow these steps to install it.

---

## 🐳 Installing Docker Desktop for macOS

### Option 1: Download from Docker Website (Recommended)

1. **Visit Docker Desktop Download Page**:
   - Go to: https://www.docker.com/products/docker-desktop/

2. **Download Docker Desktop**:
   - Click "Download for Mac"
   - Choose the version based on your Mac chip:
     - **Apple Silicon (M1/M2/M3)**: Download Mac with Apple chip
     - **Intel Mac**: Download Mac with Intel chip

3. **Install Docker Desktop**:
   - Open the downloaded `.dmg` file
   - Drag Docker icon to Applications folder
   - Open Docker from Applications
   - Follow the installation wizard

4. **Start Docker**:
   - Docker Desktop will start automatically
   - Wait for Docker engine to start (whale icon in menu bar)
   - You may need to enter your password for privileged access

5. **Verify Installation**:
   ```bash
   docker --version
   docker-compose --version
   ```

---

### Option 2: Install via Homebrew

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop
brew install --cask docker

# Open Docker Desktop
open /Applications/Docker.app

# Wait for Docker to start, then verify
docker --version
docker-compose --version
```

---

## ✅ After Docker Installation

Once Docker is installed and running, return to your project and run:

```bash
cd "/Users/asankaherath/Projects/PCN System . 2.0"

# Build all Docker images
docker compose build

# Start all services
docker compose up -d

# Check running containers
docker compose ps

# View logs
docker compose logs -f
```

---

## 🔍 Checking Docker Status

### Verify Docker is Running

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker compose version

# Check Docker info
docker info

# Test Docker with hello-world
docker run hello-world
```

### Docker Desktop Menu Bar

Look for the Docker whale icon in your macOS menu bar:
- **Running**: Whale icon is visible and animated
- **Stopped**: Whale icon is grayed out
- **Not Installed**: No whale icon

---

## 📦 System Requirements

### Minimum Requirements:
- macOS 11 or newer
- At least 4 GB of RAM
- VirtualFS or gRPC FUSE file sharing

### Recommended:
- macOS 12 or newer
- 8 GB RAM or more
- 20 GB available disk space

---

## 🚀 Next Steps After Installation

1. **Start Docker Desktop**
   - Ensure Docker is running (whale icon in menu bar)

2. **Configure Environment Variables**
   ```bash
   # Edit the .env file with your actual credentials
   nano .env
   ```

3. **Build Docker Images**
   ```bash
   docker compose build
   ```

4. **Start Services**
   ```bash
   docker compose up -d
   ```

5. **Access Your Applications**
   - Dashboard: http://localhost:3001
   - Web: http://localhost:3002
   - API: http://localhost:4000

---

## 🐛 Troubleshooting

### Docker Desktop Won't Start

1. **Check System Resources**:
   - Ensure you have enough RAM and disk space
   - Close other resource-intensive applications

2. **Reset Docker Desktop**:
   - Open Docker Desktop
   - Go to Preferences → Troubleshoot
   - Click "Reset to factory defaults"

3. **Reinstall Docker**:
   - Uninstall Docker Desktop
   - Delete Docker data: `rm -rf ~/Library/Containers/com.docker.docker`
   - Reinstall from docker.com

### Permission Denied Errors

```bash
# Add your user to docker group (after installation)
sudo dscl . -append /Groups/staff GroupMembership $(whoami)

# Restart your terminal
```

### Port Conflicts

```bash
# Check if ports are already in use
lsof -i :3001
lsof -i :3002
lsof -i :4000

# Kill processes using those ports if needed
kill -9 <PID>
```

---

## 📚 Additional Resources

- **Docker Documentation**: https://docs.docker.com/
- **Docker Desktop for Mac**: https://docs.docker.com/desktop/install/mac-install/
- **Docker Compose**: https://docs.docker.com/compose/
- **Docker Hub**: https://hub.docker.com/

---

## ⏭️ What's Already Prepared

Your PCN System project already has:
✅ Dockerfiles for all services (Dashboard, Web, API)
✅ docker-compose.yml configuration
✅ .dockerignore files to optimize builds
✅ Next.js configs updated for Docker (standalone output)
✅ .env.example template
✅ Complete documentation in DOCKER_SETUP.md

Once Docker is installed, you're ready to build and run immediately!

---

## 💡 Quick Command Reference

```bash
# After Docker Installation

# Navigate to project
cd "/Users/asankaherath/Projects/PCN System . 2.0"

# Build all services
docker compose build

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild and restart
docker compose up --build -d
```

---

## 🎯 Ready to Continue?

1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Wait for Docker to start (whale icon in menu bar)
3. Return to terminal and run: `docker compose build`
4. Start services with: `docker compose up -d`
5. Access your applications!

Good luck! 🚀

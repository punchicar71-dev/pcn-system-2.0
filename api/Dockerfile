# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files for workspace
COPY package*.json ./
COPY api/package*.json ./api/
COPY shared/package*.json ./shared/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY api/ ./api/
COPY shared/ ./shared/

# Build the API
WORKDIR /app/api
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY api/package*.json ./api/
COPY shared/package*.json ./shared/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/shared ./shared

WORKDIR /app

# Railway sets PORT dynamically
ENV PORT=4000
ENV NODE_ENV=production

EXPOSE 4000

# Start the server
CMD ["node", "api/dist/index.js"]

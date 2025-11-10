# Multi-stage Dockerfile for Encounter Service
# Stage 1: Dependencies (builder-proxy for node_modules if needed)
FROM node:20-slim AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (cache layer)
RUN npm install && \
    npm cache clean --force

# Generate Prisma Client
RUN npx prisma generate

# Stage 2: Build
FROM node:20-slim AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY src ./src
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Stage 3: Production
FROM node:20-slim AS production

# Set NODE_ENV
ENV NODE_ENV=production

WORKDIR /app

# Install runtime dependencies (openssl for Prisma engines)
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy package files first and install production deps for correct glibc targets
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Regenerate Prisma Client for the current image (glibc) to ensure correct engine binaries
RUN npx prisma generate

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application (apply DB migrations first)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

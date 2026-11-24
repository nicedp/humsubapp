# ─────────────────────────────────────────────────────────────────────────────
# Society Management Portal — Backend Dockerfile
# Multi-stage build:
#   Stage 1 (builder) — installs all deps + compiles TypeScript
#   Stage 2 (runner)  — production image with only runtime deps + compiled JS
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install OS deps needed by Prisma (openssl)
RUN apk add --no-cache openssl

# Copy manifests first — Docker layer cache: only re-installs when package*.json changes
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDeps needed for tsc + prisma generate)
RUN npm ci

# Generate Prisma client for the builder (debian-openssl-3.0.x matches runtime alpine)
RUN npx prisma generate

# Copy source and compile
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# ── Stage 2: Runner (production) ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install openssl (required by Prisma at runtime)
RUN apk add --no-cache openssl

# Copy package manifests and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema + migrations (needed for migrate deploy at startup)
COPY prisma ./prisma/

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Copy generated Prisma client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Create uploads directory (used when STORAGE_DRIVER=local)
RUN mkdir -p /uploads && chown -R node:node /uploads

# Switch to non-root user for security
USER node

EXPOSE 3000

# Startup: run migrations → seed → start compiled server
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/server.js"]

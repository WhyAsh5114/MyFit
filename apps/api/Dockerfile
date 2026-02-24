# MyFit Hono API - Multi-stage Dockerfile with Bun

# ============================================================================
# STAGE 1: Builder - Install dependencies and build
# ============================================================================
FROM oven/bun:1 AS builder

WORKDIR /build

# Copy workspace lockfile + root manifest
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy API package.json first — isolates install as a cacheable layer
COPY apps/api/package.json ./apps/api/
WORKDIR /build/apps/api
RUN bun install --frozen-lockfile

# Copy all API source (node_modules excluded via apps/api/Dockerfile.dockerignore)
WORKDIR /build
COPY apps/api ./apps/api

# Build the application
WORKDIR /build/apps/api
RUN bun build src/index.ts --outdir dist --target bun

# ============================================================================
# STAGE 2: Runtime - Minimal production image
# ============================================================================
FROM oven/bun:1-slim

ENV NODE_ENV=production
ENV PORT=3000

RUN useradd -m -u 1001 -s /sbin/nologin appuser

WORKDIR /app

COPY --from=builder --chown=appuser:appuser /build/apps/api/dist ./dist
COPY --from=builder --chown=appuser:appuser /build/apps/api/generated ./generated
COPY --from=builder --chown=appuser:appuser /build/apps/api/node_modules ./node_modules
COPY --from=builder --chown=appuser:appuser /build/apps/api/package.json ./

USER appuser

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD bun run --eval "await fetch('http://localhost:3000/api/health').then(r => { if (!r.ok) throw new Error() })" || exit 1

EXPOSE 3000
CMD ["bun", "dist/index.js"]

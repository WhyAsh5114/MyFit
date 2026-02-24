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

# Copy all API source (node_modules excluded via root .dockerignore)
WORKDIR /build
COPY apps/api ./apps/api

# Regenerate Prisma client for container platform (typed SQL remains from VCS)
WORKDIR /build/apps/api
RUN DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder bunx --bun prisma generate

# Re-copy typed SQL from VCS (prisma generate without --sql does not emit generated/prisma/sql)
COPY apps/api/generated/prisma/sql ./generated/prisma/sql

# ============================================================================
# STAGE 2: Runtime - Minimal production image
# ============================================================================
FROM oven/bun:1-slim

ENV NODE_ENV=production
ENV PORT=3000

RUN useradd -m -u 1001 -s /sbin/nologin appuser

WORKDIR /app

COPY --from=builder --chown=appuser:appuser /build/apps/api/generated ./generated
COPY --from=builder --chown=appuser:appuser /build/apps/api/node_modules ./node_modules
COPY --from=builder --chown=appuser:appuser /build/apps/api/src ./src
COPY --from=builder --chown=appuser:appuser /build/apps/api/lib ./lib
COPY --from=builder --chown=appuser:appuser /build/apps/api/package.json ./package.json

USER appuser

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD bun run --eval "await fetch('http://localhost:3000/api/health').then(r => { if (!r.ok) throw new Error() })" || exit 1

EXPOSE 3000
CMD ["bun", "src/index.ts"]

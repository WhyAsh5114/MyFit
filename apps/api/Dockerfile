# MyFit API — Multi-stage Dockerfile
# Build: node:24-slim + pnpm  |  Runtime: node:24-slim + bun

# ============================================================================
# STAGE 1: Builder
# ============================================================================
FROM node:24-slim AS builder

WORKDIR /build

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

RUN corepack enable

# Manifests first — maximises layer cache on dependency changes
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install only the API and its workspace deps
RUN pnpm install --frozen-lockfile --filter @myfit/api...

# Copy sources (node_modules excluded via root .dockerignore)
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Regenerate Prisma client for the container platform
# (typed SQL files stay from VCS — prisma generate without --sql doesn't emit them)
WORKDIR /build/apps/api
RUN rm -rf ./generated/prisma && \
    DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder \
    pnpm exec prisma generate
COPY apps/api/generated/prisma/sql ./generated/prisma/sql

# ============================================================================
# STAGE 2: Runtime
# ============================================================================
FROM node:24-slim

COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun

ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1001 -s /sbin/nologin appuser

WORKDIR /build
COPY --from=builder --chown=appuser:appuser /build /build

WORKDIR /build/apps/api
COPY apps/api/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
    CMD bun run --eval "await fetch('http://localhost:3000/api/health').then(r => { if (!r.ok) throw new Error() })" || exit 1

EXPOSE 3000
USER appuser
ENTRYPOINT ["./entrypoint.sh"]

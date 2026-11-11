# MyFit API — Dockerfile
# Runtime: node:24-slim + bun. The API runs TypeScript directly via bun, so there is no build
# step. Dependencies are installed straight into the runtime stage (as appuser) so the large
# node_modules tree is written once instead of being built and then copied between stages.

FROM node:24-slim

COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun

ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

RUN corepack enable

RUN useradd -m -u 1001 -s /sbin/nologin appuser
RUN mkdir -p /data/ota-bundles /build && chown -R appuser:appuser /data /build

USER appuser
WORKDIR /build

# Manifests first — maximises layer cache on dependency changes
COPY --chown=appuser:appuser pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY --chown=appuser:appuser apps/api/package.json ./apps/api/
COPY --chown=appuser:appuser packages/shared/package.json ./packages/shared/

# Install the API and its workspace deps. The pnpm store is a BuildKit cache mount so repeat builds do
# not re-download packages.
RUN --mount=type=cache,id=myfit-pnpm-store,target=/pnpm/store,uid=1001,gid=1001 \
    pnpm install --frozen-lockfile --store-dir /pnpm/store --filter @myfit/api...

# Sources (node_modules excluded via root .dockerignore)
COPY --chown=appuser:appuser apps/api ./apps/api
COPY --chown=appuser:appuser packages/shared ./packages/shared

WORKDIR /build/apps/api
RUN chmod +x ./entrypoint.sh

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
    CMD bun run --eval "await fetch('http://localhost:3000/api/health').then(r => { if (!r.ok) throw new Error() })" || exit 1

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]

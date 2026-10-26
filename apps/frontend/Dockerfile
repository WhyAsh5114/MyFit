# MyFit Frontend — Multi-stage Dockerfile
# Build: node:24-slim + pnpm (SvelteKit adapter-static)
# Runtime: nginx:alpine serving static files

# ============================================================================
# STAGE 1: Builder
# ============================================================================
FROM node:24-slim AS builder

WORKDIR /build

RUN apt-get update -y && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

RUN corepack enable

# Manifests first — maximises layer cache
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install frontend and its workspace deps (api is a devDep for the typed RPC client)
RUN pnpm install --frozen-lockfile --filter @myfit/frontend...

# Copy sources
COPY apps/frontend ./apps/frontend
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# PUBLIC_* vars are baked into the static bundle at build time
ARG PUBLIC_API_URL=http://localhost:3000
ENV PUBLIC_API_URL=$PUBLIC_API_URL

ARG PUBLIC_POSTHOG_KEY
ENV PUBLIC_POSTHOG_KEY=$PUBLIC_POSTHOG_KEY

ARG PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
ENV PUBLIC_POSTHOG_HOST=$PUBLIC_POSTHOG_HOST

WORKDIR /build/apps/frontend
RUN NODE_OPTIONS="--max-old-space-size=3072" pnpm build

# ============================================================================
# STAGE 2: Runtime
# ============================================================================
FROM nginx:alpine

COPY --from=builder /build/apps/frontend/build /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

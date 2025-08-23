FROM mcr.microsoft.com/devcontainers/javascript-node:3-22-bookworm

# Layer 1: Update and upgrade system packages
RUN apt-get update && apt-get upgrade -y

# Layer 2: Install pnpm globally
RUN npm install -g pnpm@10.15.0

# Layer 3: Switch to node user (better security practice)
USER node

# Layer 4: Install Playwright with dependencies
RUN pnpx playwright install --with-deps

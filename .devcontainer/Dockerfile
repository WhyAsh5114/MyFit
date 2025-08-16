FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# Update package lists and install PostgreSQL client
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y postgresql-client && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm@10.14.0

# Switch to the node user for installing playwright
USER node

# Install playwright system dependencies
RUN pnpx playwright install --with-deps

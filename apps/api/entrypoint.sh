#!/bin/sh
set -e

echo "Running database migrations..."
# `db migrate` applies the on-disk migrations (including the NutritionData table and
# its indexes).
(cd ../../packages/schema && ./node_modules/.bin/prisma db migrate --config prisma.config.postgres.ts)

echo "Starting API server..."
exec bun src/index.ts

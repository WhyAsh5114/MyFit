#!/bin/sh
set -e

# Existing Prisma 7 databases need a data-preserving upgrade before this
# migration history can be used. Do not deploy this stack slice on its own.
echo "Running database migrations..."
# `db migrate` applies the on-disk migrations. Do not use `db update` here: it would
# drop NutritionData, which lives outside the Prisma contract.
(cd ../../packages/schema && ./node_modules/.bin/prisma db migrate --config prisma.config.postgres.ts)
bun scripts/nutrition-data.ts

echo "Starting API server..."
exec bun src/index.ts

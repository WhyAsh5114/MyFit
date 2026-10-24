#!/bin/sh
set -e

echo "Running database migrations..."
# `db migrate` applies the on-disk migrations. Do not use `db update` here: it would
# drop NutritionData, which lives outside the Prisma contract.
(cd ../../packages/schema && ./node_modules/.bin/prisma db migrate --config prisma.config.postgres.ts)
bun scripts/nutrition-data.ts

echo "Starting API server..."
exec bun src/index.ts

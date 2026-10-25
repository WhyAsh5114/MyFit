#!/bin/sh
set -e

echo "Running database migrations..."
# `db migrate` applies the on-disk migrations (including the NutritionData table and
# its indexes).
(cd ../../packages/schema && ./node_modules/.bin/prisma db migrate --config prisma.config.postgres.ts)

# Populate a fresh deployment before serving search requests. Existing data is
# refreshed explicitly with seed:off, so ordinary restarts do not reload the dump.
if [ "${SEED_NUTRITION_DATA:-1}" = "1" ]; then
  echo "Seeding nutrition data if empty..."
  SEED_IF_EMPTY=1 bun run seed:off
fi

echo "Starting API server..."
exec bun src/index.ts

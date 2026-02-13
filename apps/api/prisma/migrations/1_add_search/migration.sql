-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Drop old column if exists
ALTER TABLE "NutritionData"
DROP COLUMN IF EXISTS search_vector;

-- Create normal column (NOT generated)
ALTER TABLE "NutritionData"
ADD COLUMN search_vector tsvector;

-- Create trigger function to update search_vector
CREATE OR REPLACE FUNCTION nutrition_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(
      to_tsvector('english', unaccent(COALESCE(NEW.product_name, ''))),
      'A'
    ) ||
    setweight(
      to_tsvector('english', unaccent(COALESCE(NEW.brands, ''))),
      'B'
    );
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Attach trigger
CREATE TRIGGER nutrition_search_vector_trigger
BEFORE INSERT OR UPDATE ON "NutritionData"
FOR EACH ROW
EXECUTE FUNCTION nutrition_search_vector_update();

-- Backfill existing data
UPDATE "NutritionData"
SET search_vector =
  setweight(to_tsvector('english', unaccent(COALESCE(product_name, ''))), 'A') ||
  setweight(to_tsvector('english', unaccent(COALESCE(brands, ''))), 'B');

-- Index for FTS
CREATE INDEX nutrition_search_vector_idx
ON "NutritionData"
USING gin (search_vector);

-- Trigram indexes
CREATE INDEX nutrition_product_name_trgm_idx
ON "NutritionData"
USING gin (product_name gin_trgm_ops);

CREATE INDEX nutrition_brands_trgm_idx
ON "NutritionData"
USING gin (brands gin_trgm_ops);

ALTER TABLE "NutritionData" ALTER COLUMN "search_vector" SET NOT NULL;

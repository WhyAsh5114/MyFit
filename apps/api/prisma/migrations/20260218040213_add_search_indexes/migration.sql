-- Drop old column if exists
ALTER TABLE "NutritionData"
DROP COLUMN IF EXISTS "searchVector";

-- Create normal column (NOT generated)
ALTER TABLE "NutritionData"
ADD COLUMN "searchVector" tsvector;

-- Create trigger function to update search_vector
CREATE OR REPLACE FUNCTION nutrition_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(
      to_tsvector('english', unaccent(COALESCE(NEW."productName", ''))),
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
SET "searchVector" =
  setweight(to_tsvector('english', unaccent(COALESCE("productName", ''))), 'A') ||
  setweight(to_tsvector('english', unaccent(COALESCE(brands, ''))), 'B');

-- AlterTable
ALTER TABLE "NutritionData" ALTER COLUMN "searchVector" SET NOT NULL;

-- CreateIndex
CREATE INDEX "nutrition_search_vector_idx" ON "NutritionData" USING GIN ("searchVector");

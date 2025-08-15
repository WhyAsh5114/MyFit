-- Drop the existing search_vector column and recreate as generated column
-- This matches the production database setup
ALTER TABLE "NutritionData" 
DROP COLUMN IF EXISTS search_vector;

ALTER TABLE "NutritionData" 
ADD COLUMN search_vector tsvector 
GENERATED ALWAYS AS (
  to_tsvector('english', 
    COALESCE(product_name, '') || ' ' || 
    COALESCE(brands, '')
  )
) STORED;

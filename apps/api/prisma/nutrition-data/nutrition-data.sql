-- The Open Food Facts search table. It lives outside the Prisma contract
-- (packages/schema) because it needs tsvector and GIN/trigram indexes, which
-- the SQL family can't express. Idempotent: safe to run on every deploy and on
-- databases that already have the table.

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- CreateTable
CREATE TABLE IF NOT EXISTS "NutritionData" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "brands" TEXT,
    "searchVector" tsvector NOT NULL,
    "completeness" DOUBLE PRECISION NOT NULL,
    "uniqueScans" INTEGER NOT NULL,
    "servingQuantity" DOUBLE PRECISION,
    "servingSize" TEXT,
    "energyKcal_100g" DOUBLE PRECISION NOT NULL,
    "proteinsG_100g" DOUBLE PRECISION NOT NULL,
    "fatG_100g" DOUBLE PRECISION NOT NULL,
    "carbohydratesG_100g" DOUBLE PRECISION NOT NULL,
    "saturatedFatG_100g" DOUBLE PRECISION,
    "unsaturatedFatG_100g" DOUBLE PRECISION,
    "monounsaturatedFatG_100g" DOUBLE PRECISION,
    "polyunsaturatedFatG_100g" DOUBLE PRECISION,
    "transFatG_100g" DOUBLE PRECISION,
    "cholesterolMg_100g" DOUBLE PRECISION,
    "sugarsG_100g" DOUBLE PRECISION,
    "polyolsG_100g" DOUBLE PRECISION,
    "fiberG_100g" DOUBLE PRECISION,
    "saltG_100g" DOUBLE PRECISION,
    "sodiumMg_100g" DOUBLE PRECISION,
    "alcoholG_100g" DOUBLE PRECISION,
    "vitaminAIU_100g" DOUBLE PRECISION,
    "vitaminDIU_100g" DOUBLE PRECISION,
    "vitaminEMg_100g" DOUBLE PRECISION,
    "vitaminKMcg_100g" DOUBLE PRECISION,
    "vitaminCMg_100g" DOUBLE PRECISION,
    "vitaminB1Mg_100g" DOUBLE PRECISION,
    "vitaminB2Mg_100g" DOUBLE PRECISION,
    "vitaminB6Mg_100g" DOUBLE PRECISION,
    "vitaminB9Mcg_100g" DOUBLE PRECISION,
    "folatesMcg_100g" DOUBLE PRECISION,
    "vitaminB12Mcg_100g" DOUBLE PRECISION,
    "potassiumMg_100g" DOUBLE PRECISION,
    "calciumMg_100g" DOUBLE PRECISION,
    "phosphorusMg_100g" DOUBLE PRECISION,
    "ironMg_100g" DOUBLE PRECISION,
    "magnesiumMg_100g" DOUBLE PRECISION,
    "zincMg_100g" DOUBLE PRECISION,
    "copperMg_100g" DOUBLE PRECISION,
    "manganeseMg_100g" DOUBLE PRECISION,
    "caffeineMg_100g" DOUBLE PRECISION,

    CONSTRAINT "NutritionData_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "NutritionData_code_idx" ON "NutritionData"("code");
CREATE INDEX IF NOT EXISTS "nutrition_brands_trgm_idx" ON "NutritionData" USING GIN ("brands" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "nutrition_product_name_trgm_idx" ON "NutritionData" USING GIN ("productName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "nutrition_search_vector_idx" ON "NutritionData" USING GIN ("searchVector");

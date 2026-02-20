/**
 * SQL schema for staging nutrition data
 * Direct insert into NutritionData table (no complex staging needed)
 */

export const CREATE_STAGING_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS nutrition_data_staging (
  code TEXT,
  product_name TEXT NOT NULL,
  brands TEXT,
  -- Serving size metadata
  serving_quantity DOUBLE PRECISION,
  serving_size TEXT,
  -- Data quality metrics
  completeness DOUBLE PRECISION,
  unique_scans INT,
  -- 100g macros (required)
  energy_kcal_100g DOUBLE PRECISION,
  proteins_g_100g DOUBLE PRECISION,
  fat_g_100g DOUBLE PRECISION,
  carbohydrates_g_100g DOUBLE PRECISION,
  -- 100g micronutrients (optional)
  saturated_fat_g_100g DOUBLE PRECISION,
  unsaturated_fat_g_100g DOUBLE PRECISION,
  monounsaturated_fat_g_100g DOUBLE PRECISION,
  polyunsaturated_fat_g_100g DOUBLE PRECISION,
  trans_fat_g_100g DOUBLE PRECISION,
  cholesterol_mg_100g DOUBLE PRECISION,
  sugars_g_100g DOUBLE PRECISION,
  polyols_g_100g DOUBLE PRECISION,
  fiber_g_100g DOUBLE PRECISION,
  salt_g_100g DOUBLE PRECISION,
  sodium_mg_100g DOUBLE PRECISION,
  alcohol_g_100g DOUBLE PRECISION,
  vitamin_a_iu_100g DOUBLE PRECISION,
  vitamin_d_iu_100g DOUBLE PRECISION,
  vitamin_e_mg_100g DOUBLE PRECISION,
  vitamin_k_mcg_100g DOUBLE PRECISION,
  vitamin_c_mg_100g DOUBLE PRECISION,
  vitamin_b1_mg_100g DOUBLE PRECISION,
  vitamin_b2_mg_100g DOUBLE PRECISION,
  vitamin_b6_mg_100g DOUBLE PRECISION,
  vitamin_b9_mcg_100g DOUBLE PRECISION,
  folates_mcg_100g DOUBLE PRECISION,
  vitamin_b12_mcg_100g DOUBLE PRECISION,
  potassium_mg_100g DOUBLE PRECISION,
  calcium_mg_100g DOUBLE PRECISION,
  phosphorus_mg_100g DOUBLE PRECISION,
  iron_mg_100g DOUBLE PRECISION,
  magnesium_mg_100g DOUBLE PRECISION,
  zinc_mg_100g DOUBLE PRECISION,
  copper_mg_100g DOUBLE PRECISION,
  manganese_mg_100g DOUBLE PRECISION,
  caffeine_mg_100g DOUBLE PRECISION
)
`;

export const TRUNCATE_STAGING_TABLE_SQL = 'TRUNCATE nutrition_data_staging';

export const DROP_STAGING_TABLE_SQL = 'DROP TABLE IF EXISTS nutrition_data_staging';

/**
 * Insert directly into NutritionData table from staging
 */
export const INSERT_INTO_NUTRITION_DATA_SQL = `
INSERT INTO "NutritionData" (
  id,
  code,
  "productName",
  brands,
  "servingQuantity",
  "servingSize",
  "completeness",
  "uniqueScans",
  "energyKcal_100g",
  "proteinsG_100g",
  "fatG_100g",
  "carbohydratesG_100g",
  "saturatedFatG_100g",
  "unsaturatedFatG_100g",
  "monounsaturatedFatG_100g",
  "polyunsaturatedFatG_100g",
  "transFatG_100g",
  "cholesterolMg_100g",
  "sugarsG_100g",
  "polyolsG_100g",
  "fiberG_100g",
  "saltG_100g",
  "sodiumMg_100g",
  "alcoholG_100g",
  "vitaminAIU_100g",
  "vitaminDIU_100g",
  "vitaminEMg_100g",
  "vitaminKMcg_100g",
  "vitaminCMg_100g",
  "vitaminB1Mg_100g",
  "vitaminB2Mg_100g",
  "vitaminB6Mg_100g",
  "vitaminB9Mcg_100g",
  "folatesMcg_100g",
  "vitaminB12Mcg_100g",
  "potassiumMg_100g",
  "calciumMg_100g",
  "phosphorusMg_100g",
  "ironMg_100g",
  "magnesiumMg_100g",
  "zincMg_100g",
  "copperMg_100g",
  "manganeseMg_100g",
  "caffeineMg_100g"
)
SELECT
  gen_random_uuid(),
  code,
  product_name,
  brands,
  serving_quantity,
  serving_size,
  completeness,
  unique_scans,
  energy_kcal_100g,
  proteins_g_100g,
  fat_g_100g,
  carbohydrates_g_100g,
  saturated_fat_g_100g,
  unsaturated_fat_g_100g,
  monounsaturated_fat_g_100g,
  polyunsaturated_fat_g_100g,
  trans_fat_g_100g,
  cholesterol_mg_100g,
  sugars_g_100g,
  polyols_g_100g,
  fiber_g_100g,
  salt_g_100g,
  sodium_mg_100g,
  alcohol_g_100g,
  vitamin_a_iu_100g,
  vitamin_d_iu_100g,
  vitamin_e_mg_100g,
  vitamin_k_mcg_100g,
  vitamin_c_mg_100g,
  vitamin_b1_mg_100g,
  vitamin_b2_mg_100g,
  vitamin_b6_mg_100g,
  vitamin_b9_mcg_100g,
  folates_mcg_100g,
  vitamin_b12_mcg_100g,
  potassium_mg_100g,
  calcium_mg_100g,
  phosphorus_mg_100g,
  iron_mg_100g,
  magnesium_mg_100g,
  zinc_mg_100g,
  copper_mg_100g,
  manganese_mg_100g,
  caffeine_mg_100g
FROM nutrition_data_staging
WHERE 
  code IS NOT NULL AND 
  product_name IS NOT NULL AND
  energy_kcal_100g IS NOT NULL AND
  proteins_g_100g IS NOT NULL AND
  fat_g_100g IS NOT NULL AND
  carbohydrates_g_100g IS NOT NULL
`;

export const COPY_INTO_STAGING_SQL = `
COPY nutrition_data_staging (
  code,
  product_name,
  brands,
  serving_quantity,
  serving_size,
  completeness,
  unique_scans,
  energy_kcal_100g,
  proteins_g_100g,
  fat_g_100g,
  carbohydrates_g_100g,
  saturated_fat_g_100g,
  unsaturated_fat_g_100g,
  monounsaturated_fat_g_100g,
  polyunsaturated_fat_g_100g,
  trans_fat_g_100g,
  cholesterol_mg_100g,
  sugars_g_100g,
  polyols_g_100g,
  fiber_g_100g,
  salt_g_100g,
  sodium_mg_100g,
  alcohol_g_100g,
  vitamin_a_iu_100g,
  vitamin_d_iu_100g,
  vitamin_e_mg_100g,
  vitamin_k_mcg_100g,
  vitamin_c_mg_100g,
  vitamin_b1_mg_100g,
  vitamin_b2_mg_100g,
  vitamin_b6_mg_100g,
  vitamin_b9_mcg_100g,
  folates_mcg_100g,
  vitamin_b12_mcg_100g,
  potassium_mg_100g,
  calcium_mg_100g,
  phosphorus_mg_100g,
  iron_mg_100g,
  magnesium_mg_100g,
  zinc_mg_100g,
  copper_mg_100g,
  manganese_mg_100g,
  caffeine_mg_100g
)
FROM STDIN WITH (FORMAT text, NULL '\\N')
`;

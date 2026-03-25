-- CreateEnum
CREATE TYPE "PreferredFoodEntryUnit" AS ENUM ('g', 'serving');

-- CreateEnum
CREATE TYPE "MacroTargetQuantifier" AS ENUM ('Percentage', 'Absolute');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "WeightUnit" AS ENUM ('kg', 'lb');

-- CreateEnum
CREATE TYPE "HeightUnit" AS ENUM ('cm', 'in');

-- CreateEnum
CREATE TYPE "ActivityAdjustmentType" AS ENUM ('Static', 'Dynamic', 'Manual');

-- CreateEnum
CREATE TYPE "ChangeOperation" AS ENUM ('create', 'update', 'delete');

-- CreateTable
CREATE TABLE "ActivityEntry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL,
    "calories" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "quantityUnit" TEXT NOT NULL,
    "systemGenerated" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ActivityEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodEntry" (
    "id" TEXT NOT NULL,
    "eatenAt" TIMESTAMP(3) NOT NULL,
    "quantityG" DOUBLE PRECISION NOT NULL,
    "productName" TEXT NOT NULL,
    "brands" TEXT,
    "preferredUnit" "PreferredFoodEntryUnit" NOT NULL,
    "servingQuantity" DOUBLE PRECISION,
    "servingSize" TEXT,
    "mealId" TEXT,
    "recipeId" TEXT,
    "userId" TEXT NOT NULL,
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

    CONSTRAINT "FoodEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "brands" TEXT,
    "quantityG" DOUBLE PRECISION NOT NULL,
    "preferredUnit" "PreferredFoodEntryUnit" NOT NULL,
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

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionData" (
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

-- CreateTable
CREATE TABLE "MacroTargets" (
    "id" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proteinG" DOUBLE PRECISION,
    "carbsG" DOUBLE PRECISION,
    "fatG" DOUBLE PRECISION,
    "quantifier" "MacroTargetQuantifier" NOT NULL,
    "weeklyCaloricChange" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MacroTargets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MacroMetrics" (
    "id" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bodyweight" DOUBLE PRECISION NOT NULL,
    "bodyweightUnit" "WeightUnit" NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "heightUnit" "HeightUnit" NOT NULL,
    "bodyFatPercentage" DOUBLE PRECISION NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MacroMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adjustmentType" "ActivityAdjustmentType" NOT NULL,
    "staticCalories" INTEGER,

    CONSTRAINT "ActivityPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isAnonymous" BOOLEAN,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Changelog" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "outboxEventId" TEXT NOT NULL,
    "keyPath" JSONB NOT NULL,
    "operation" "ChangeOperation" NOT NULL,
    "scopeKey" TEXT NOT NULL,

    CONSTRAINT "Changelog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Meal_userId_name_key" ON "Meal"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_userId_name_key" ON "Recipe"("userId", "name");

-- CreateIndex
CREATE INDEX "NutritionData_code_idx" ON "NutritionData"("code");

-- CreateIndex
CREATE INDEX "nutrition_brands_trgm_idx" ON "NutritionData" USING GIN ("brands" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "nutrition_product_name_trgm_idx" ON "NutritionData" USING GIN ("productName" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "nutrition_search_vector_idx" ON "NutritionData" USING GIN ("searchVector");

-- CreateIndex
CREATE UNIQUE INDEX "MacroTargets_userId_effectiveFrom_key" ON "MacroTargets"("userId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "MacroMetrics_userId_effectiveFrom_key" ON "MacroMetrics"("userId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityPreferences_userId_effectiveFrom_key" ON "ActivityPreferences"("userId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Changelog_outboxEventId_key" ON "Changelog"("outboxEventId");

-- CreateIndex
CREATE INDEX "Changelog_model_id_idx" ON "Changelog"("model", "id");

-- AddForeignKey
ALTER TABLE "ActivityEntry" ADD CONSTRAINT "ActivityEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodEntry" ADD CONSTRAINT "FoodEntry_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodEntry" ADD CONSTRAINT "FoodEntry_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodEntry" ADD CONSTRAINT "FoodEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MacroTargets" ADD CONSTRAINT "MacroTargets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MacroMetrics" ADD CONSTRAINT "MacroMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityPreferences" ADD CONSTRAINT "ActivityPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
CREATE TABLE "MacroTargets" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proteins" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "fats" DOUBLE PRECISION,
    "quantifier" "MacroTargetQuantifier" NOT NULL,
    "caloricChange" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MacroTargets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MacroMetrics" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
CREATE TABLE "MacroActivityTrackingPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adjustmentType" "ActivityAdjustmentType" NOT NULL,
    "staticCalories" INTEGER,

    CONSTRAINT "MacroActivityTrackingPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodEntry" (
    "id" TEXT NOT NULL,
    "eatenAt" TIMESTAMP(3) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "quantityUnit" TEXT NOT NULL DEFAULT 'g',
    "nutritionDataId" INTEGER,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FoodEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityEntry" (
    "id" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL,
    "calories" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "quantityUnit" TEXT NOT NULL,
    "systemGenerated" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ActivityEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionData" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "brands" TEXT,
    "search_vector" tsvector NOT NULL,
    "energy_kcal_100g" DOUBLE PRECISION NOT NULL,
    "proteins_100g" DOUBLE PRECISION NOT NULL,
    "fat_100g" DOUBLE PRECISION NOT NULL,
    "carbohydrates_100g" DOUBLE PRECISION NOT NULL,
    "saturated_fat_100g" DOUBLE PRECISION,
    "unsaturated_fat_100g" DOUBLE PRECISION,
    "monounsaturated_fat_100g" DOUBLE PRECISION,
    "polyunsaturated_fat_100g" DOUBLE PRECISION,
    "trans_fat_100g" DOUBLE PRECISION,
    "cholesterol_100g" DOUBLE PRECISION,
    "sugars_100g" DOUBLE PRECISION,
    "polyols_100g" DOUBLE PRECISION,
    "fiber_100g" DOUBLE PRECISION,
    "salt_100g" DOUBLE PRECISION,
    "sodium_100g" DOUBLE PRECISION,
    "alcohol_100g" DOUBLE PRECISION,
    "vitamin_a_100g" DOUBLE PRECISION,
    "vitamin_d_100g" DOUBLE PRECISION,
    "vitamin_e_100g" DOUBLE PRECISION,
    "vitamin_k_100g" DOUBLE PRECISION,
    "vitamin_c_100g" DOUBLE PRECISION,
    "vitamin_b1_100g" DOUBLE PRECISION,
    "vitamin_b2_100g" DOUBLE PRECISION,
    "vitamin_b6_100g" DOUBLE PRECISION,
    "vitamin_b9_100g" DOUBLE PRECISION,
    "folates_100g" DOUBLE PRECISION,
    "vitamin_b12_100g" DOUBLE PRECISION,
    "potassium_100g" DOUBLE PRECISION,
    "calcium_100g" DOUBLE PRECISION,
    "phosphorus_100g" DOUBLE PRECISION,
    "iron_100g" DOUBLE PRECISION,
    "magnesium_100g" DOUBLE PRECISION,
    "zinc_100g" DOUBLE PRECISION,
    "copper_100g" DOUBLE PRECISION,
    "manganese_100g" DOUBLE PRECISION,
    "caffeine_100g" DOUBLE PRECISION,

    CONSTRAINT "NutritionData_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "MacroTargets_userId_key" ON "MacroTargets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MacroActivityTrackingPreferences_userId_key" ON "MacroActivityTrackingPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionData_code_key" ON "NutritionData"("code");

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
ALTER TABLE "MacroTargets" ADD CONSTRAINT "MacroTargets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MacroMetrics" ADD CONSTRAINT "MacroMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MacroActivityTrackingPreferences" ADD CONSTRAINT "MacroActivityTrackingPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodEntry" ADD CONSTRAINT "FoodEntry_nutritionDataId_fkey" FOREIGN KEY ("nutritionDataId") REFERENCES "NutritionData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodEntry" ADD CONSTRAINT "FoodEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEntry" ADD CONSTRAINT "ActivityEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop the existing search_vector column and recreate as generated column
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


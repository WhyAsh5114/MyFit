-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."FitnessKnowledge" AS ENUM ('newbie', 'beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "public"."MyFitPrimaryUsage" AS ENUM ('workoutTracking', 'macroTracking', 'socialNetwork', 'mix');

-- CreateEnum
CREATE TYPE "public"."DashboardWidgetType" AS ENUM ('workout', 'nutrition', 'social', 'mix');

-- CreateEnum
CREATE TYPE "public"."SetType" AS ENUM ('Default', 'Straight', 'Down', 'Myorep', 'MyorepMatch', 'MyorepMatchDown', 'Drop');

-- CreateEnum
CREATE TYPE "public"."ActivityAdjustmentType" AS ENUM ('Static', 'Dynamic', 'Manual');

-- CreateEnum
CREATE TYPE "public"."MacroTargetQuantifier" AS ENUM ('Percentage', 'Absolute');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "public"."WeightUnit" AS ENUM ('kg', 'lb');

-- CreateEnum
CREATE TYPE "public"."HeightUnit" AS ENUM ('cm', 'in');

-- CreateTable
CREATE TABLE "public"."ExerciseSplit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ExerciseSplit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExerciseSplitDay" (
    "id" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "exerciseSplitId" TEXT NOT NULL,

    CONSTRAINT "ExerciseSplitDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExerciseSplitDaySession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sessionIndex" INTEGER NOT NULL,
    "exerciseSplitDayId" TEXT NOT NULL,

    CONSTRAINT "ExerciseSplitDaySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExerciseSplitDaySessionExercise" (
    "id" TEXT NOT NULL,
    "exerciseIndex" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "primaryMuscleGroup" TEXT NOT NULL,
    "repRangeStart" INTEGER NOT NULL,
    "repRangeEnd" INTEGER NOT NULL,
    "setType" "public"."SetType" NOT NULL,
    "exerciseSplitDaySessionId" TEXT NOT NULL,

    CONSTRAINT "ExerciseSplitDaySessionExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExerciseSplitDaySessionExerciseNote" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "noteIndex" INTEGER NOT NULL,

    CONSTRAINT "ExerciseSplitDaySessionExerciseNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExerciseSplitDaySessionExerciseSecondaryMuscleGroup" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "muscleGroup" TEXT NOT NULL,

    CONSTRAINT "ExerciseSplitDaySessionExerciseSecondaryMuscleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MacroTargets" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "proteins" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "fats" DOUBLE PRECISION,
    "quantifier" "public"."MacroTargetQuantifier" NOT NULL,
    "caloricChange" INTEGER NOT NULL,

    CONSTRAINT "MacroTargets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MacroMetrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bodyweight" DOUBLE PRECISION NOT NULL,
    "bodyweightUnit" "public"."WeightUnit" NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "heightUnit" "public"."HeightUnit" NOT NULL,
    "bodyFatPercentage" DOUBLE PRECISION NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "public"."Gender" NOT NULL,

    CONSTRAINT "MacroMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MacroActivityTrackingPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adjustmentType" "public"."ActivityAdjustmentType" NOT NULL,
    "staticCalories" INTEGER,

    CONSTRAINT "MacroActivityTrackingPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FoodEntry" (
    "id" TEXT NOT NULL,
    "eatenAt" TIMESTAMP(3) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "quantityUnit" TEXT NOT NULL DEFAULT 'g',
    "nutritionDataId" INTEGER,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FoodEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NutritionData" (
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
CREATE TABLE "public"."GettingStartedAnswers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fitnessKnowledge" "public"."FitnessKnowledge" NOT NULL,
    "myFitPrimaryUsage" "public"."MyFitPrimaryUsage" NOT NULL,

    CONSTRAINT "GettingStartedAnswers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DashboardItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."DashboardWidgetType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isAnonymous" BOOLEAN,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account" (
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
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseSplitDay_exerciseSplitId_dayIndex_key" ON "public"."ExerciseSplitDay"("exerciseSplitId", "dayIndex");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseSplitDaySession_exerciseSplitDayId_sessionIndex_key" ON "public"."ExerciseSplitDaySession"("exerciseSplitDayId", "sessionIndex");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseSplitDaySessionExercise_exerciseSplitDaySessionId_e_key" ON "public"."ExerciseSplitDaySessionExercise"("exerciseSplitDaySessionId", "exerciseIndex");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseSplitDaySessionExerciseSecondaryMuscleGroup_exercis_key" ON "public"."ExerciseSplitDaySessionExerciseSecondaryMuscleGroup"("exerciseId", "muscleGroup");

-- CreateIndex
CREATE UNIQUE INDEX "MacroTargets_userId_key" ON "public"."MacroTargets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MacroActivityTrackingPreferences_userId_key" ON "public"."MacroActivityTrackingPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionData_code_key" ON "public"."NutritionData"("code");

-- CreateIndex
CREATE UNIQUE INDEX "GettingStartedAnswers_userId_key" ON "public"."GettingStartedAnswers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardItem_userId_key" ON "public"."DashboardItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardItem_userId_type_key" ON "public"."DashboardItem"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "public"."session"("token");

-- AddForeignKey
ALTER TABLE "public"."ExerciseSplit" ADD CONSTRAINT "ExerciseSplit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExerciseSplitDay" ADD CONSTRAINT "ExerciseSplitDay_exerciseSplitId_fkey" FOREIGN KEY ("exerciseSplitId") REFERENCES "public"."ExerciseSplit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExerciseSplitDaySession" ADD CONSTRAINT "ExerciseSplitDaySession_exerciseSplitDayId_fkey" FOREIGN KEY ("exerciseSplitDayId") REFERENCES "public"."ExerciseSplitDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExerciseSplitDaySessionExercise" ADD CONSTRAINT "ExerciseSplitDaySessionExercise_exerciseSplitDaySessionId_fkey" FOREIGN KEY ("exerciseSplitDaySessionId") REFERENCES "public"."ExerciseSplitDaySession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExerciseSplitDaySessionExerciseNote" ADD CONSTRAINT "ExerciseSplitDaySessionExerciseNote_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."ExerciseSplitDaySessionExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExerciseSplitDaySessionExerciseSecondaryMuscleGroup" ADD CONSTRAINT "ExerciseSplitDaySessionExerciseSecondaryMuscleGroup_exerci_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."ExerciseSplitDaySessionExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MacroTargets" ADD CONSTRAINT "MacroTargets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MacroMetrics" ADD CONSTRAINT "MacroMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MacroActivityTrackingPreferences" ADD CONSTRAINT "MacroActivityTrackingPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FoodEntry" ADD CONSTRAINT "FoodEntry_nutritionDataId_fkey" FOREIGN KEY ("nutritionDataId") REFERENCES "public"."NutritionData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FoodEntry" ADD CONSTRAINT "FoodEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GettingStartedAnswers" ADD CONSTRAINT "GettingStartedAnswers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DashboardItem" ADD CONSTRAINT "DashboardItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

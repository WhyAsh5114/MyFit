/*
  Warnings:

  - Added the required column `preferredUnit` to the `FoodEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `completeness` to the `NutritionData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uniqueScans` to the `NutritionData` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PreferrredFoodEntryUnit" AS ENUM ('g', 'serving');

-- AlterTable
ALTER TABLE "FoodEntry" ADD COLUMN     "meal" TEXT,
ADD COLUMN     "preferredUnit" "PreferrredFoodEntryUnit" NOT NULL;

-- AlterTable
ALTER TABLE "NutritionData" ADD COLUMN     "completeness" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "uniqueScans" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "foodDiaryMeals" TEXT[] DEFAULT ARRAY['Breakfast', 'Lunch', 'Dinner', 'Snacks']::TEXT[];

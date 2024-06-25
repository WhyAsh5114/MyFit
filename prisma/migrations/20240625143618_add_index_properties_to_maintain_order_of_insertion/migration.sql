/*
  Warnings:

  - Added the required column `dayIndex` to the `ExerciseSplitDay` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exerciseIndex` to the `ExerciseTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dayIndex` to the `MesocycleExerciseSplitDay` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exerciseIndex` to the `MesocycleExerciseTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExerciseSplitDay" ADD COLUMN     "dayIndex" INT4 NOT NULL;

-- AlterTable
ALTER TABLE "ExerciseTemplate" ADD COLUMN     "exerciseIndex" INT4 NOT NULL;

-- AlterTable
ALTER TABLE "MesocycleExerciseSplitDay" ADD COLUMN     "dayIndex" INT4 NOT NULL;

-- AlterTable
ALTER TABLE "MesocycleExerciseTemplate" ADD COLUMN     "exerciseIndex" INT4 NOT NULL;

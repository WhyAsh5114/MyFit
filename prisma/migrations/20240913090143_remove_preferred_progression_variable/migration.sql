/*
  Warnings:

  - You are about to drop the column `preferredProgressionVariable` on the `Mesocycle` table. All the data in the column will be lost.
  - You are about to drop the column `preferredProgressionVariable` on the `MesocycleExerciseTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `preferredProgressionVariable` on the `WorkoutExercise` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Mesocycle" DROP COLUMN "preferredProgressionVariable";

-- AlterTable
ALTER TABLE "MesocycleExerciseTemplate" DROP COLUMN "preferredProgressionVariable";

-- AlterTable
ALTER TABLE "WorkoutExercise" DROP COLUMN "preferredProgressionVariable";

-- DropEnum
DROP TYPE "ProgressionVariable";

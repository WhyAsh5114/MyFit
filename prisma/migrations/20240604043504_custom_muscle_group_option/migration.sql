/*
  Warnings:

  - You are about to drop the column `sets` on the `ExerciseTemplate` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MuscleGroup" ADD VALUE 'Neck';
ALTER TYPE "MuscleGroup" ADD VALUE 'Adductors';
ALTER TYPE "MuscleGroup" ADD VALUE 'Abductors';
ALTER TYPE "MuscleGroup" ADD VALUE 'Custom';

-- AlterTable
ALTER TABLE "ExerciseTemplate" DROP COLUMN "sets",
ADD COLUMN     "customMuscleGroup" TEXT;

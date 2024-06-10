/*
  Warnings:

  - Added the required column `forceRIRMatching` to the `Mesocycle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastSetToFailure` to the `Mesocycle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferredProgressionVariable` to the `Mesocycle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startOverloadPercentage` to the `Mesocycle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProgressionVariable" AS ENUM ('Reps', 'Load');

-- AlterTable
ALTER TABLE "Mesocycle" ADD COLUMN     "RIRProgression" INTEGER[],
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "forceRIRMatching" BOOLEAN NOT NULL,
ADD COLUMN     "lastSetToFailure" BOOLEAN NOT NULL,
ADD COLUMN     "preferredProgressionVariable" "ProgressionVariable" NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "startOverloadPercentage" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "MesocycleCyclicSetChanges" (
    "id" SERIAL NOT NULL,
    "mesocycleId" INTEGER NOT NULL,
    "muscleGroup" "MuscleGroup" NOT NULL,
    "regardlessOfProgress" BOOLEAN NOT NULL,
    "setIncreaseAmount" INTEGER NOT NULL,

    CONSTRAINT "MesocycleCyclicSetChanges_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MesocycleCyclicSetChanges" ADD CONSTRAINT "MesocycleCyclicSetChanges_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "Mesocycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

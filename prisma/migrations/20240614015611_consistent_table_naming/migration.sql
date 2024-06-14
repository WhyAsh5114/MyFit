/*
  Warnings:

  - You are about to drop the `MesocycleCyclicSetChanges` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MesocycleCyclicSetChanges" DROP CONSTRAINT "MesocycleCyclicSetChanges_mesocycleId_fkey";

-- DropTable
DROP TABLE "MesocycleCyclicSetChanges";

-- CreateTable
CREATE TABLE "MesocycleCyclicSetChange" (
    "id" SERIAL NOT NULL,
    "mesocycleId" INTEGER NOT NULL,
    "muscleGroup" "MuscleGroup" NOT NULL,
    "customMuscleGroup" TEXT,
    "regardlessOfProgress" BOOLEAN NOT NULL,
    "setIncreaseAmount" INTEGER NOT NULL,
    "maxVolume" INTEGER NOT NULL,

    CONSTRAINT "MesocycleCyclicSetChange_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MesocycleCyclicSetChange" ADD CONSTRAINT "MesocycleCyclicSetChange_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "Mesocycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

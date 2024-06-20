-- DropForeignKey
ALTER TABLE "Mesocycle" DROP CONSTRAINT "Mesocycle_exerciseSplitId_fkey";

-- AlterTable
ALTER TABLE "Mesocycle" ALTER COLUMN "exerciseSplitId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Mesocycle" ADD CONSTRAINT "Mesocycle_exerciseSplitId_fkey" FOREIGN KEY ("exerciseSplitId") REFERENCES "ExerciseSplit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

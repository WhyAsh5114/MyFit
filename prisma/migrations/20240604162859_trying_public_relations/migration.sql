-- AlterTable
ALTER TABLE "ExerciseSplit" ADD COLUMN     "templatedFromId" INTEGER;

-- AddForeignKey
ALTER TABLE "ExerciseSplit" ADD CONSTRAINT "ExerciseSplit_templatedFromId_fkey" FOREIGN KEY ("templatedFromId") REFERENCES "ExerciseSplit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

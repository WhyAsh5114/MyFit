-- DropForeignKey
ALTER TABLE "ExerciseSplitDay" DROP CONSTRAINT "ExerciseSplitDay_exerciseSplitId_fkey";

-- DropForeignKey
ALTER TABLE "ExerciseTemplate" DROP CONSTRAINT "ExerciseTemplate_exerciseSplitDayId_fkey";

-- AddForeignKey
ALTER TABLE "ExerciseSplitDay" ADD CONSTRAINT "ExerciseSplitDay_exerciseSplitId_fkey" FOREIGN KEY ("exerciseSplitId") REFERENCES "ExerciseSplit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseTemplate" ADD CONSTRAINT "ExerciseTemplate_exerciseSplitDayId_fkey" FOREIGN KEY ("exerciseSplitDayId") REFERENCES "ExerciseSplitDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

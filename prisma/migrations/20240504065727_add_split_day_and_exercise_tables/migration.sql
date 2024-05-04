/*
  Warnings:

  - Added the required column `name` to the `ExerciseSplit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExerciseSplit" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ExerciseSplitDay" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "exerciseSplitId" INTEGER NOT NULL,

    CONSTRAINT "ExerciseSplitDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "exerciseSplitDayId" INTEGER NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExerciseSplitDay" ADD CONSTRAINT "ExerciseSplitDay_exerciseSplitId_fkey" FOREIGN KEY ("exerciseSplitId") REFERENCES "ExerciseSplit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_exerciseSplitDayId_fkey" FOREIGN KEY ("exerciseSplitDayId") REFERENCES "ExerciseSplitDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

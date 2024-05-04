/*
  Warnings:

  - You are about to drop the `Exercise` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('Chest', 'FrontDelts', 'SideDelts', 'RearDelts', 'Lats', 'Traps', 'Triceps', 'Biceps', 'Forearms', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Abs');

-- CreateEnum
CREATE TYPE "SetType" AS ENUM ('Default', 'Straight', 'Drop', 'Down', 'Top', 'Myorep', 'MyorepMatch', 'Giant');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('Percentage', 'AbsoluteLoad');

-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_exerciseSplitDayId_fkey";

-- DropTable
DROP TABLE "Exercise";

-- CreateTable
CREATE TABLE "ExerciseTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "targetMuscleGroup" "MuscleGroup" NOT NULL,
    "involvesBodyweight" BOOLEAN NOT NULL,
    "setType" "SetType" NOT NULL,
    "repRangeStart" INTEGER NOT NULL,
    "repRangeEnd" INTEGER NOT NULL,
    "changeType" "ChangeType",
    "changeAmount" INTEGER,
    "exerciseSplitDayId" INTEGER NOT NULL,

    CONSTRAINT "ExerciseTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExerciseTemplate" ADD CONSTRAINT "ExerciseTemplate_exerciseSplitDayId_fkey" FOREIGN KEY ("exerciseSplitDayId") REFERENCES "ExerciseSplitDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

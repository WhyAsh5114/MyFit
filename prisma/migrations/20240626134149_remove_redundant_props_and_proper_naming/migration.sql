/*
  Warnings:

  - You are about to drop the column `changeAmount` on the `WorkoutExercise` table. All the data in the column will be lost.
  - You are about to drop the column `changeType` on the `WorkoutExercise` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkoutExercise" DROP COLUMN "changeAmount";
ALTER TABLE "WorkoutExercise" DROP COLUMN "changeType";

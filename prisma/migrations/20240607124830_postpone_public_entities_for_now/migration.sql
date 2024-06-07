/*
  Warnings:

  - You are about to drop the column `makePublic` on the `ExerciseSplit` table. All the data in the column will be lost.
  - You are about to drop the column `templatedFromId` on the `ExerciseSplit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExerciseSplit" DROP CONSTRAINT "ExerciseSplit_templatedFromId_fkey";

-- AlterTable
ALTER TABLE "ExerciseSplit" DROP COLUMN "makePublic",
DROP COLUMN "templatedFromId";

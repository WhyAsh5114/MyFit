/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Workout` table. All the data in the column will be lost.
  - Added the required column `endedAt` to the `Workout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startedAt` to the `Workout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Workout" DROP COLUMN "createdAt";
ALTER TABLE "Workout" ADD COLUMN     "endedAt" TIMESTAMP(3) NOT NULL;
ALTER TABLE "Workout" ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL;

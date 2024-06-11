/*
  Warnings:

  - Added the required column `maxVolume` to the `MesocycleCyclicSetChanges` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MesocycleCyclicSetChanges" ADD COLUMN     "maxVolume" INTEGER NOT NULL;

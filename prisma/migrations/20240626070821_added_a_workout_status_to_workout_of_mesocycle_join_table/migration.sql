-- CreateEnum
CREATE TYPE "WorkoutStatus" AS ENUM ('Skipped', 'RestDay');

-- AlterTable
ALTER TABLE "WorkoutOfMesocycle" ADD COLUMN     "workoutStatus" "WorkoutStatus";

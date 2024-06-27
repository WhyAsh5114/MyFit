/*
  Warnings:

  - You are about to drop the column `rep` on the `WorkoutExerciseMiniSets` table. All the data in the column will be lost.
  - You are about to drop the column `rep` on the `WorkoutExerciseSet` table. All the data in the column will be lost.
  - Added the required column `reps` to the `WorkoutExerciseMiniSets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reps` to the `WorkoutExerciseSet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkoutExerciseMiniSets" DROP COLUMN "rep";
ALTER TABLE "WorkoutExerciseMiniSets" ADD COLUMN     "reps" INT4 NOT NULL;

-- AlterTable
ALTER TABLE "WorkoutExerciseSet" DROP COLUMN "rep";
ALTER TABLE "WorkoutExerciseSet" ADD COLUMN     "reps" INT4 NOT NULL;

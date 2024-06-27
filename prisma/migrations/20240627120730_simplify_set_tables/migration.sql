/*
  Warnings:

  - You are about to drop the column `setsOfWorkoutExerciseId` on the `WorkoutExercise` table. All the data in the column will be lost.
  - You are about to drop the `FixedChangeSets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MyorepMatchSet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MyorepMatchSets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SetsOfWorkoutExercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StraightSets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariableChangeSets` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `repRangeEnd` to the `WorkoutExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repRangeStart` to the `WorkoutExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `setType` to the `WorkoutExercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FixedChangeSets" DROP CONSTRAINT "FixedChangeSets_setsOfWorkoutExerciseId_fkey";

-- DropForeignKey
ALTER TABLE "MyorepMatchSet" DROP CONSTRAINT "MyorepMatchSet_myorepMatchSetsId_fkey";

-- DropForeignKey
ALTER TABLE "MyorepMatchSets" DROP CONSTRAINT "MyorepMatchSets_setsOfWorkoutExerciseId_fkey";

-- DropForeignKey
ALTER TABLE "StraightSets" DROP CONSTRAINT "StraightSets_setsOfWorkoutExerciseId_fkey";

-- DropForeignKey
ALTER TABLE "VariableChangeSets" DROP CONSTRAINT "VariableChangeSets_setsOfWorkoutExerciseId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutExercise" DROP CONSTRAINT "WorkoutExercise_setsOfWorkoutExerciseId_fkey";

-- DropIndex
DROP INDEX "WorkoutExercise_setsOfWorkoutExerciseId_key";

-- AlterTable
ALTER TABLE "WorkoutExercise" DROP COLUMN "setsOfWorkoutExerciseId";
ALTER TABLE "WorkoutExercise" ADD COLUMN     "repRangeEnd" INT4 NOT NULL;
ALTER TABLE "WorkoutExercise" ADD COLUMN     "repRangeStart" INT4 NOT NULL;
ALTER TABLE "WorkoutExercise" ADD COLUMN     "setType" "SetType" NOT NULL;

-- DropTable
DROP TABLE "FixedChangeSets";

-- DropTable
DROP TABLE "MyorepMatchSet";

-- DropTable
DROP TABLE "MyorepMatchSets";

-- DropTable
DROP TABLE "SetsOfWorkoutExercise";

-- DropTable
DROP TABLE "StraightSets";

-- DropTable
DROP TABLE "VariableChangeSets";

-- CreateTable
CREATE TABLE "WorkoutExerciseSet" (
    "id" STRING NOT NULL,
    "workoutExerciseId" STRING NOT NULL,
    "rep" INT4 NOT NULL,
    "load" INT4 NOT NULL,
    "RIR" INT4 NOT NULL,

    CONSTRAINT "WorkoutExerciseSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutExerciseMiniSets" (
    "id" STRING NOT NULL,
    "rep" INT4 NOT NULL,
    "load" INT4 NOT NULL,
    "RIR" INT4 NOT NULL,
    "workoutExerciseSetId" STRING NOT NULL,

    CONSTRAINT "WorkoutExerciseMiniSets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkoutExerciseSet" ADD CONSTRAINT "WorkoutExerciseSet_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "WorkoutExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExerciseMiniSets" ADD CONSTRAINT "WorkoutExerciseMiniSets_workoutExerciseSetId_fkey" FOREIGN KEY ("workoutExerciseSetId") REFERENCES "WorkoutExerciseSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

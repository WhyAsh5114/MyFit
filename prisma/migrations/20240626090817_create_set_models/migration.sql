/*
  Warnings:

  - The values [Giant] on the enum `SetType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `exerciseNumber` on the `WorkoutExercise` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[setsOfWorkoutExerciseId]` on the table `WorkoutExercise` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `exerciseIndex` to the `WorkoutExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `involvesBodyweight` to the `WorkoutExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `setsOfWorkoutExerciseId` to the `WorkoutExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetMuscleGroup` to the `WorkoutExercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "SetType"DROP VALUE 'Giant';

-- AlterTable
ALTER TABLE "WorkoutExercise" DROP COLUMN "exerciseNumber";
ALTER TABLE "WorkoutExercise" ADD COLUMN     "changeAmount" FLOAT8;
ALTER TABLE "WorkoutExercise" ADD COLUMN     "changeType" "ChangeType";
ALTER TABLE "WorkoutExercise" ADD COLUMN     "customMuscleGroup" STRING;
ALTER TABLE "WorkoutExercise" ADD COLUMN     "exerciseIndex" INT4 NOT NULL;
ALTER TABLE "WorkoutExercise" ADD COLUMN     "forceRIRMatching" BOOL;
ALTER TABLE "WorkoutExercise" ADD COLUMN     "involvesBodyweight" BOOL NOT NULL;
ALTER TABLE "WorkoutExercise" ADD COLUMN     "lastSetToFailure" BOOL;
ALTER TABLE "WorkoutExercise" ADD COLUMN     "minimumWeightChange" FLOAT8;
ALTER TABLE "WorkoutExercise" ADD COLUMN     "note" STRING;
ALTER TABLE "WorkoutExercise" ADD COLUMN     "overloadPercentage" FLOAT8;
ALTER TABLE "WorkoutExercise" ADD COLUMN     "preferredProgressionVariable" "ProgressionVariable";
ALTER TABLE "WorkoutExercise" ADD COLUMN     "setsOfWorkoutExerciseId" STRING NOT NULL;
ALTER TABLE "WorkoutExercise" ADD COLUMN     "targetMuscleGroup" "MuscleGroup" NOT NULL;

-- CreateTable
CREATE TABLE "SetsOfWorkoutExercise" (
    "id" STRING NOT NULL,
    "setType" "SetType" NOT NULL,
    "repRangeStart" INT4 NOT NULL,
    "repRangeEnd" INT4 NOT NULL,

    CONSTRAINT "SetsOfWorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StraightSets" (
    "id" STRING NOT NULL,
    "load" INT4 NOT NULL,
    "repNumbers" INT4[],
    "RIRNumbers" INT4[],
    "setsOfWorkoutExerciseId" STRING NOT NULL,

    CONSTRAINT "StraightSets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedChangeSets" (
    "id" STRING NOT NULL,
    "loadNumbers" INT4[],
    "repNumbers" INT4[],
    "RIRNumbers" INT4[],
    "changeType" "ChangeType" NOT NULL,
    "changeAmount" FLOAT8 NOT NULL,
    "setsOfWorkoutExerciseId" STRING NOT NULL,

    CONSTRAINT "FixedChangeSets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariableChangeSets" (
    "id" STRING NOT NULL,
    "loadNumbers" INT4[],
    "repNumbers" INT4[],
    "RIRNumbers" INT4[],
    "setsOfWorkoutExerciseId" STRING NOT NULL,

    CONSTRAINT "VariableChangeSets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MyorepMatchSets" (
    "id" STRING NOT NULL,
    "setsOfWorkoutExerciseId" STRING NOT NULL,

    CONSTRAINT "MyorepMatchSets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MyorepMatchSet" (
    "id" STRING NOT NULL,
    "repNumber" INT4 NOT NULL,
    "loadNumber" INT4 NOT NULL,
    "myoreps" INT4[],
    "myorepMatchSetsId" STRING,

    CONSTRAINT "MyorepMatchSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StraightSets_setsOfWorkoutExerciseId_key" ON "StraightSets"("setsOfWorkoutExerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "FixedChangeSets_setsOfWorkoutExerciseId_key" ON "FixedChangeSets"("setsOfWorkoutExerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "VariableChangeSets_setsOfWorkoutExerciseId_key" ON "VariableChangeSets"("setsOfWorkoutExerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "MyorepMatchSets_setsOfWorkoutExerciseId_key" ON "MyorepMatchSets"("setsOfWorkoutExerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutExercise_setsOfWorkoutExerciseId_key" ON "WorkoutExercise"("setsOfWorkoutExerciseId");

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_setsOfWorkoutExerciseId_fkey" FOREIGN KEY ("setsOfWorkoutExerciseId") REFERENCES "SetsOfWorkoutExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StraightSets" ADD CONSTRAINT "StraightSets_setsOfWorkoutExerciseId_fkey" FOREIGN KEY ("setsOfWorkoutExerciseId") REFERENCES "SetsOfWorkoutExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedChangeSets" ADD CONSTRAINT "FixedChangeSets_setsOfWorkoutExerciseId_fkey" FOREIGN KEY ("setsOfWorkoutExerciseId") REFERENCES "SetsOfWorkoutExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariableChangeSets" ADD CONSTRAINT "VariableChangeSets_setsOfWorkoutExerciseId_fkey" FOREIGN KEY ("setsOfWorkoutExerciseId") REFERENCES "SetsOfWorkoutExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MyorepMatchSets" ADD CONSTRAINT "MyorepMatchSets_setsOfWorkoutExerciseId_fkey" FOREIGN KEY ("setsOfWorkoutExerciseId") REFERENCES "SetsOfWorkoutExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MyorepMatchSet" ADD CONSTRAINT "MyorepMatchSet_myorepMatchSetsId_fkey" FOREIGN KEY ("myorepMatchSetsId") REFERENCES "MyorepMatchSets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "ExerciseSplit" DROP CONSTRAINT "ExerciseSplit_userId_fkey";

-- CreateTable
CREATE TABLE "Mesocycle" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseSplitId" INTEGER NOT NULL,

    CONSTRAINT "Mesocycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesocycleExerciseSplitDay" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isRestDay" BOOLEAN NOT NULL,
    "mesocycleId" INTEGER NOT NULL,

    CONSTRAINT "MesocycleExerciseSplitDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesocycleExerciseTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "targetMuscleGroup" "MuscleGroup" NOT NULL,
    "customMuscleGroup" TEXT,
    "involvesBodyweight" BOOLEAN NOT NULL,
    "sets" INTEGER NOT NULL,
    "setType" "SetType" NOT NULL,
    "repRangeStart" INTEGER NOT NULL,
    "repRangeEnd" INTEGER NOT NULL,
    "changeType" "ChangeType",
    "changeAmount" DOUBLE PRECISION,
    "note" TEXT,
    "mesocycleExerciseSplitDayId" INTEGER NOT NULL,

    CONSTRAINT "MesocycleExerciseTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExerciseSplit" ADD CONSTRAINT "ExerciseSplit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mesocycle" ADD CONSTRAINT "Mesocycle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mesocycle" ADD CONSTRAINT "Mesocycle_exerciseSplitId_fkey" FOREIGN KEY ("exerciseSplitId") REFERENCES "ExerciseSplit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesocycleExerciseSplitDay" ADD CONSTRAINT "MesocycleExerciseSplitDay_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "Mesocycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesocycleExerciseTemplate" ADD CONSTRAINT "MesocycleExerciseTemplate_mesocycleExerciseSplitDayId_fkey" FOREIGN KEY ("mesocycleExerciseSplitDayId") REFERENCES "MesocycleExerciseSplitDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

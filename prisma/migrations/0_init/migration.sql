-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('Chest', 'FrontDelts', 'SideDelts', 'RearDelts', 'Lats', 'Traps', 'Triceps', 'Biceps', 'Forearms', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Neck', 'Adductors', 'Abductors', 'Custom');

-- CreateEnum
CREATE TYPE "SetType" AS ENUM ('Straight', 'V2', 'Drop', 'Down', 'Myorep', 'MyorepMatch');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('Percentage', 'AbsoluteLoad');

-- CreateEnum
CREATE TYPE "ProgressionVariable" AS ENUM ('Reps', 'Load');

-- CreateEnum
CREATE TYPE "WorkoutStatus" AS ENUM ('Skipped', 'RestDay');

-- CreateTable
CREATE TABLE "ExerciseSplit" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "userId" STRING NOT NULL,

    CONSTRAINT "ExerciseSplit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseSplitDay" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "dayIndex" INT4 NOT NULL,
    "isRestDay" BOOL NOT NULL,
    "exerciseSplitId" STRING NOT NULL,

    CONSTRAINT "ExerciseSplitDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseTemplate" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "exerciseIndex" INT4 NOT NULL,
    "targetMuscleGroup" "MuscleGroup" NOT NULL,
    "customMuscleGroup" STRING,
    "bodyweightFraction" FLOAT8,
    "setType" "SetType" NOT NULL,
    "repRangeStart" INT4 NOT NULL,
    "repRangeEnd" INT4 NOT NULL,
    "changeType" "ChangeType",
    "changeAmount" FLOAT8,
    "note" STRING,
    "exerciseSplitDayId" STRING NOT NULL,

    CONSTRAINT "ExerciseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mesocycle" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "exerciseSplitId" STRING,
    "RIRProgression" INT4[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "preferredProgressionVariable" "ProgressionVariable" NOT NULL,
    "startOverloadPercentage" FLOAT8 NOT NULL,
    "lastSetToFailure" BOOL NOT NULL,
    "forceRIRMatching" BOOL NOT NULL,

    CONSTRAINT "Mesocycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesocycleCyclicSetChange" (
    "id" STRING NOT NULL,
    "mesocycleId" STRING NOT NULL,
    "muscleGroup" "MuscleGroup" NOT NULL,
    "customMuscleGroup" STRING,
    "regardlessOfProgress" BOOL NOT NULL,
    "setIncreaseAmount" INT4 NOT NULL,
    "maxVolume" INT4 NOT NULL,

    CONSTRAINT "MesocycleCyclicSetChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesocycleExerciseSplitDay" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "dayIndex" INT4 NOT NULL,
    "isRestDay" BOOL NOT NULL,
    "mesocycleId" STRING NOT NULL,

    CONSTRAINT "MesocycleExerciseSplitDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesocycleExerciseTemplate" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "exerciseIndex" INT4 NOT NULL,
    "targetMuscleGroup" "MuscleGroup" NOT NULL,
    "customMuscleGroup" STRING,
    "bodyweightFraction" FLOAT8,
    "sets" INT4 NOT NULL,
    "setType" "SetType" NOT NULL,
    "repRangeStart" INT4 NOT NULL,
    "repRangeEnd" INT4 NOT NULL,
    "changeType" "ChangeType",
    "changeAmount" FLOAT8,
    "note" STRING,
    "mesocycleExerciseSplitDayId" STRING NOT NULL,
    "preferredProgressionVariable" "ProgressionVariable",
    "overloadPercentage" FLOAT8,
    "lastSetToFailure" BOOL,
    "forceRIRMatching" BOOL,
    "minimumWeightChange" FLOAT8,

    CONSTRAINT "MesocycleExerciseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" STRING NOT NULL,
    "name" STRING,
    "email" STRING NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" STRING NOT NULL,
    "type" STRING NOT NULL,
    "provider" STRING NOT NULL,
    "providerAccountId" STRING NOT NULL,
    "refresh_token" STRING,
    "access_token" STRING,
    "expires_at" INT4,
    "token_type" STRING,
    "scope" STRING,
    "id_token" STRING,
    "session_state" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" STRING NOT NULL,
    "token" STRING NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "WorkoutOfMesocycle" (
    "id" STRING NOT NULL,
    "workoutId" STRING NOT NULL,
    "mesocycleId" STRING NOT NULL,
    "splitDayIndex" INT4 NOT NULL,
    "workoutStatus" "WorkoutStatus",

    CONSTRAINT "WorkoutOfMesocycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" STRING NOT NULL,
    "userBodyweight" INT4 NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "userId" STRING NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutExercise" (
    "id" STRING NOT NULL,
    "exerciseIndex" INT4 NOT NULL,
    "name" STRING NOT NULL,
    "workoutId" STRING NOT NULL,
    "targetMuscleGroup" "MuscleGroup" NOT NULL,
    "customMuscleGroup" STRING,
    "bodyweightFraction" FLOAT8,
    "setType" "SetType" NOT NULL,
    "changeType" "ChangeType",
    "changeAmount" FLOAT8,
    "repRangeStart" INT4 NOT NULL,
    "repRangeEnd" INT4 NOT NULL,
    "note" STRING,
    "preferredProgressionVariable" "ProgressionVariable",
    "overloadPercentage" FLOAT8,
    "lastSetToFailure" BOOL,
    "forceRIRMatching" BOOL,
    "minimumWeightChange" FLOAT8,

    CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutExerciseSet" (
    "id" STRING NOT NULL,
    "setIndex" INT4 NOT NULL,
    "workoutExerciseId" STRING NOT NULL,
    "reps" INT4 NOT NULL,
    "load" FLOAT8 NOT NULL,
    "RIR" INT4 NOT NULL,
    "skipped" BOOL NOT NULL,

    CONSTRAINT "WorkoutExerciseSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutExerciseMiniSet" (
    "id" STRING NOT NULL,
    "miniSetIndex" INT4 NOT NULL,
    "reps" INT4 NOT NULL,
    "load" FLOAT8 NOT NULL,
    "RIR" INT4 NOT NULL,
    "workoutExerciseSetId" STRING NOT NULL,

    CONSTRAINT "WorkoutExerciseMiniSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutOfMesocycle_workoutId_key" ON "WorkoutOfMesocycle"("workoutId");

-- AddForeignKey
ALTER TABLE "ExerciseSplit" ADD CONSTRAINT "ExerciseSplit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSplitDay" ADD CONSTRAINT "ExerciseSplitDay_exerciseSplitId_fkey" FOREIGN KEY ("exerciseSplitId") REFERENCES "ExerciseSplit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseTemplate" ADD CONSTRAINT "ExerciseTemplate_exerciseSplitDayId_fkey" FOREIGN KEY ("exerciseSplitDayId") REFERENCES "ExerciseSplitDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mesocycle" ADD CONSTRAINT "Mesocycle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mesocycle" ADD CONSTRAINT "Mesocycle_exerciseSplitId_fkey" FOREIGN KEY ("exerciseSplitId") REFERENCES "ExerciseSplit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesocycleCyclicSetChange" ADD CONSTRAINT "MesocycleCyclicSetChange_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "Mesocycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesocycleExerciseSplitDay" ADD CONSTRAINT "MesocycleExerciseSplitDay_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "Mesocycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesocycleExerciseTemplate" ADD CONSTRAINT "MesocycleExerciseTemplate_mesocycleExerciseSplitDayId_fkey" FOREIGN KEY ("mesocycleExerciseSplitDayId") REFERENCES "MesocycleExerciseSplitDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutOfMesocycle" ADD CONSTRAINT "WorkoutOfMesocycle_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutOfMesocycle" ADD CONSTRAINT "WorkoutOfMesocycle_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "Mesocycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExerciseSet" ADD CONSTRAINT "WorkoutExerciseSet_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "WorkoutExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExerciseMiniSet" ADD CONSTRAINT "WorkoutExerciseMiniSet_workoutExerciseSetId_fkey" FOREIGN KEY ("workoutExerciseSetId") REFERENCES "WorkoutExerciseSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;


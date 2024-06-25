-- CreateTable
CREATE TABLE "WorkoutOfMesocycle" (
    "id" STRING NOT NULL,
    "workoutId" STRING NOT NULL,
    "mesocycleId" STRING NOT NULL,
    "splitDayName" STRING NOT NULL,

    CONSTRAINT "WorkoutOfMesocycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" STRING NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutExercise" (
    "id" STRING NOT NULL,
    "exerciseNumber" INT4 NOT NULL,
    "workoutId" STRING NOT NULL,

    CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutOfMesocycle_workoutId_key" ON "WorkoutOfMesocycle"("workoutId");

-- AddForeignKey
ALTER TABLE "WorkoutOfMesocycle" ADD CONSTRAINT "WorkoutOfMesocycle_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutOfMesocycle" ADD CONSTRAINT "WorkoutOfMesocycle_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "Mesocycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

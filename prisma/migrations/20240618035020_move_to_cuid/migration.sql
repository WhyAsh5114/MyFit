/*
  Warnings:

  - The primary key for the `ExerciseSplit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ExerciseSplitDay` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ExerciseTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Mesocycle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `MesocycleCyclicSetChange` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `MesocycleExerciseSplitDay` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `MesocycleExerciseTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "ExerciseSplitDay" DROP CONSTRAINT "ExerciseSplitDay_exerciseSplitId_fkey";

-- DropForeignKey
ALTER TABLE "ExerciseTemplate" DROP CONSTRAINT "ExerciseTemplate_exerciseSplitDayId_fkey";

-- DropForeignKey
ALTER TABLE "Mesocycle" DROP CONSTRAINT "Mesocycle_exerciseSplitId_fkey";

-- DropForeignKey
ALTER TABLE "MesocycleCyclicSetChange" DROP CONSTRAINT "MesocycleCyclicSetChange_mesocycleId_fkey";

-- DropForeignKey
ALTER TABLE "MesocycleExerciseSplitDay" DROP CONSTRAINT "MesocycleExerciseSplitDay_mesocycleId_fkey";

-- DropForeignKey
ALTER TABLE "MesocycleExerciseTemplate" DROP CONSTRAINT "MesocycleExerciseTemplate_mesocycleExerciseSplitDayId_fkey";

-- AlterTable
ALTER TABLE "ExerciseSplit" DROP CONSTRAINT "ExerciseSplit_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ExerciseSplit_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ExerciseSplit_id_seq";

-- AlterTable
ALTER TABLE "ExerciseSplitDay" DROP CONSTRAINT "ExerciseSplitDay_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "exerciseSplitId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ExerciseSplitDay_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ExerciseSplitDay_id_seq";

-- AlterTable
ALTER TABLE "ExerciseTemplate" DROP CONSTRAINT "ExerciseTemplate_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "exerciseSplitDayId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ExerciseTemplate_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ExerciseTemplate_id_seq";

-- AlterTable
ALTER TABLE "Mesocycle" DROP CONSTRAINT "Mesocycle_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "exerciseSplitId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Mesocycle_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Mesocycle_id_seq";

-- AlterTable
ALTER TABLE "MesocycleCyclicSetChange" DROP CONSTRAINT "MesocycleCyclicSetChange_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "mesocycleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "MesocycleCyclicSetChange_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "MesocycleCyclicSetChange_id_seq";

-- AlterTable
ALTER TABLE "MesocycleExerciseSplitDay" DROP CONSTRAINT "MesocycleExerciseSplitDay_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "mesocycleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "MesocycleExerciseSplitDay_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "MesocycleExerciseSplitDay_id_seq";

-- AlterTable
ALTER TABLE "MesocycleExerciseTemplate" DROP CONSTRAINT "MesocycleExerciseTemplate_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "mesocycleExerciseSplitDayId" SET DATA TYPE TEXT,
ADD CONSTRAINT "MesocycleExerciseTemplate_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "MesocycleExerciseTemplate_id_seq";

-- AddForeignKey
ALTER TABLE "ExerciseSplitDay" ADD CONSTRAINT "ExerciseSplitDay_exerciseSplitId_fkey" FOREIGN KEY ("exerciseSplitId") REFERENCES "ExerciseSplit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseTemplate" ADD CONSTRAINT "ExerciseTemplate_exerciseSplitDayId_fkey" FOREIGN KEY ("exerciseSplitDayId") REFERENCES "ExerciseSplitDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mesocycle" ADD CONSTRAINT "Mesocycle_exerciseSplitId_fkey" FOREIGN KEY ("exerciseSplitId") REFERENCES "ExerciseSplit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesocycleCyclicSetChange" ADD CONSTRAINT "MesocycleCyclicSetChange_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "Mesocycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesocycleExerciseSplitDay" ADD CONSTRAINT "MesocycleExerciseSplitDay_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "Mesocycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesocycleExerciseTemplate" ADD CONSTRAINT "MesocycleExerciseTemplate_mesocycleExerciseSplitDayId_fkey" FOREIGN KEY ("mesocycleExerciseSplitDayId") REFERENCES "MesocycleExerciseSplitDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterEnum
ALTER TYPE "SetType" ADD VALUE 'TopBackoff';

-- AlterTable
ALTER TABLE "ExerciseTemplate" ADD COLUMN     "topRepRangeEnd" INT4;
ALTER TABLE "ExerciseTemplate" ADD COLUMN     "topRepRangeStart" INT4;

-- AlterTable
ALTER TABLE "MesocycleExerciseTemplate" ADD COLUMN     "topRepRangeEnd" INT4;
ALTER TABLE "MesocycleExerciseTemplate" ADD COLUMN     "topRepRangeStart" INT4;

-- AlterTable
ALTER TABLE "WorkoutExercise" ADD COLUMN     "topRepRangeEnd" INT4;
ALTER TABLE "WorkoutExercise" ADD COLUMN     "topRepRangeStart" INT4;

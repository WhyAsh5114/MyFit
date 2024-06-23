-- AlterTable
ALTER TABLE "MesocycleExerciseTemplate" ADD COLUMN     "forceRIRMatching" BOOL;
ALTER TABLE "MesocycleExerciseTemplate" ADD COLUMN     "lastSetToFailure" BOOL;
ALTER TABLE "MesocycleExerciseTemplate" ADD COLUMN     "overloadPercentage" FLOAT8;
ALTER TABLE "MesocycleExerciseTemplate" ADD COLUMN     "preferredProgressionVariable" "ProgressionVariable";

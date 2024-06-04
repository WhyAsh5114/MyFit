/*
  Warnings:

  - The values [Default] on the enum `SetType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SetType_new" AS ENUM ('Straight', 'Drop', 'Down', 'Top', 'Myorep', 'MyorepMatch', 'Giant', 'V2');
ALTER TABLE "ExerciseTemplate" ALTER COLUMN "setType" TYPE "SetType_new" USING ("setType"::text::"SetType_new");
ALTER TYPE "SetType" RENAME TO "SetType_old";
ALTER TYPE "SetType_new" RENAME TO "SetType";
DROP TYPE "SetType_old";
COMMIT;

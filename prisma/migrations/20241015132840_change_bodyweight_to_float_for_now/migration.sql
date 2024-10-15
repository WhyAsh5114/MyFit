/*
  Warnings:

  - Changed the type of `userBodyweight` on the `Workout` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/

-- Step 1: Add a new column with the FLOAT type
BEGIN;
ALTER TABLE "Workout"
ADD COLUMN "tempUserBodyweight" FLOAT;
COMMIT;

-- Step 2: Migrate the existing data from DECIMAL(5, 2) to FLOAT
BEGIN;
UPDATE "Workout"
SET "tempUserBodyweight" = "userBodyweight";
COMMIT;

-- Step 3: Ensure no null values exist in the new column before making it required
BEGIN;
ALTER TABLE "Workout"
ALTER COLUMN "tempUserBodyweight" SET NOT NULL;
COMMIT;

-- Step 4: Drop the DECIMAL column
BEGIN;
ALTER TABLE "Workout"
DROP COLUMN "userBodyweight";
COMMIT;

-- Step 5: Rename the new column to the original name
BEGIN;
ALTER TABLE "Workout"
RENAME COLUMN "tempUserBodyweight" TO "userBodyweight";
COMMIT;


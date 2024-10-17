/*
  Warnings:

  - Changed the type of `userBodyweight` on the `Workout` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/

-- Step 1: Add a new column with the DECIMAL type
BEGIN;
ALTER TABLE "Workout"
ADD COLUMN "newUserBodyweight" DECIMAL(5, 2);
COMMIT;

-- Step 2: Migrate the existing data from the old column to the new one
BEGIN;
UPDATE "Workout"
SET "newUserBodyweight" = CAST("userBodyweight" AS DECIMAL(5, 2));
COMMIT;

-- Step 3: Ensure no null values exist in the new column before making it required
BEGIN;
ALTER TABLE "Workout"
ALTER COLUMN "newUserBodyweight" SET NOT NULL;
COMMIT;

-- Step 4: Drop the old column
BEGIN;
ALTER TABLE "Workout"
DROP COLUMN "userBodyweight";
COMMIT;

-- Step 5: Rename the new column to the original name
BEGIN;
ALTER TABLE "Workout"
RENAME COLUMN "newUserBodyweight" TO "userBodyweight";
COMMIT;

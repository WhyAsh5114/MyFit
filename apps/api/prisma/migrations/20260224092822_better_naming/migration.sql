/*
  Warnings:

  - You are about to drop the column `createdAt` on the `MacroMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `MacroTargets` table. All the data in the column will be lost.
  - You are about to drop the `MacroActivityTrackingPreferences` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `ActivityEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MacroActivityTrackingPreferences" DROP CONSTRAINT "MacroActivityTrackingPreferences_userId_fkey";

-- AlterTable
ALTER TABLE "ActivityEntry" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MacroMetrics" DROP COLUMN "createdAt",
ADD COLUMN     "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "MacroTargets" DROP COLUMN "createdAt",
ADD COLUMN     "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "MacroActivityTrackingPreferences";

-- CreateTable
CREATE TABLE "ActivityPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adjustmentType" "ActivityAdjustmentType" NOT NULL,
    "staticCalories" INTEGER,

    CONSTRAINT "ActivityPreferences_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActivityPreferences" ADD CONSTRAINT "ActivityPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

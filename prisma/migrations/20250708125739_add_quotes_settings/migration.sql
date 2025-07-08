-- CreateEnum
CREATE TYPE "QuotesDisplayMode" AS ENUM ('PRE_WORKOUT', 'POST_WORKOUT', 'BETWEEN_SETS');

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "motivationalQuotesEnabled" BOOL NOT NULL DEFAULT false,
    "quotesDisplayModes" "QuotesDisplayMode"[] DEFAULT ARRAY['PRE_WORKOUT']::"QuotesDisplayMode"[],

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

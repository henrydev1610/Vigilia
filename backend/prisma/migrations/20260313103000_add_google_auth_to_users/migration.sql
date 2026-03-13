ALTER TABLE "User"
  ALTER COLUMN "passwordHash" DROP NOT NULL,
  ADD COLUMN "googleId" TEXT,
  ADD COLUMN "avatarUrl" TEXT,
  ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'local';

CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

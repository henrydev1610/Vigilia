-- CreateTable
CREATE TABLE "Profile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "avatarUrl" TEXT,
  "interestedParties" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "interestedStates" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "alertsEnabled" BOOLEAN NOT NULL DEFAULT true,
  "biometricEnabled" BOOLEAN NOT NULL DEFAULT false,
  "monitoringCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "Profile"
ADD CONSTRAINT "Profile_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

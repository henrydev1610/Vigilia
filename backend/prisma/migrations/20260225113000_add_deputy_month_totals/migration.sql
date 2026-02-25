-- CreateTable
CREATE TABLE "DeputyMonthTotal" (
  "deputyId" INTEGER NOT NULL,
  "ano" INTEGER NOT NULL,
  "mes" INTEGER NOT NULL,
  "totalCents" BIGINT NOT NULL,
  "expensesCount" INTEGER NOT NULL,
  "lastSyncedAt" TIMESTAMP(3) NOT NULL,
  "sourceVersion" TEXT,

  CONSTRAINT "DeputyMonthTotal_pkey" PRIMARY KEY ("deputyId","ano","mes")
);

-- CreateIndex
CREATE INDEX "DeputyMonthTotal_ano_mes_idx" ON "DeputyMonthTotal"("ano", "mes");

-- AddForeignKey
ALTER TABLE "DeputyMonthTotal"
ADD CONSTRAINT "DeputyMonthTotal_deputyId_fkey"
FOREIGN KEY ("deputyId")
REFERENCES "Deputy"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deputy" (
  "id" INTEGER NOT NULL,
  "nome" TEXT NOT NULL,
  "siglaUf" TEXT NOT NULL,
  "siglaPartido" TEXT NOT NULL,
  "urlFoto" TEXT NOT NULL,
  "uri" TEXT NOT NULL,
  "email" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Deputy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseType" (
  "id" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  CONSTRAINT "ExpenseType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
  "id" TEXT NOT NULL,
  "deputyId" INTEGER NOT NULL,
  "expenseTypeId" TEXT,
  "ano" INTEGER NOT NULL,
  "mes" INTEGER NOT NULL,
  "dataDocumento" TIMESTAMP(3),
  "tipoDocumento" TEXT,
  "numeroDocumento" TEXT,
  "fornecedor" TEXT,
  "cnpjCpf" TEXT,
  "valorDocumento" DECIMAL(14,2) NOT NULL,
  "valorGlosa" DECIMAL(14,2) NOT NULL,
  "valorLiquido" DECIMAL(14,2) NOT NULL,
  "urlDocumento" TEXT,
  "expenseHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "deputyId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE UNIQUE INDEX "Expense_expenseHash_key" ON "Expense"("expenseHash");
CREATE UNIQUE INDEX "Favorite_userId_deputyId_key" ON "Favorite"("userId", "deputyId");
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX "Expense_deputyId_ano_mes_idx" ON "Expense"("deputyId", "ano", "mes");
CREATE INDEX "Expense_ano_mes_idx" ON "Expense"("ano", "mes");
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- AddForeignKey
ALTER TABLE "RefreshToken"
  ADD CONSTRAINT "RefreshToken_userId_fkey"
  FOREIGN KEY ("userId")
  REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Expense"
  ADD CONSTRAINT "Expense_deputyId_fkey"
  FOREIGN KEY ("deputyId")
  REFERENCES "Deputy"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Expense"
  ADD CONSTRAINT "Expense_expenseTypeId_fkey"
  FOREIGN KEY ("expenseTypeId")
  REFERENCES "ExpenseType"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Favorite"
  ADD CONSTRAINT "Favorite_userId_fkey"
  FOREIGN KEY ("userId")
  REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Favorite"
  ADD CONSTRAINT "Favorite_deputyId_fkey"
  FOREIGN KEY ("deputyId")
  REFERENCES "Deputy"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

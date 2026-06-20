-- Movimientos bancarios y configuración de saldo inicial (idempotente)

CREATE TABLE IF NOT EXISTS "BankStatementConfig" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "initialBalance" DECIMAL(18, 2) NOT NULL DEFAULT 0,
  "initialBalanceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BankStatementConfig_pkey" PRIMARY KEY ("id")
);

INSERT INTO "BankStatementConfig" ("id", "initialBalance", "initialBalanceDate", "updatedAt")
VALUES ('default', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

CREATE TABLE IF NOT EXISTS "BankMovement" (
  "id" TEXT NOT NULL,
  "movementDate" TIMESTAMP(3) NOT NULL,
  "branchCode" TEXT NOT NULL DEFAULT '',
  "branchDescription" TEXT NOT NULL DEFAULT '',
  "operationCode" TEXT NOT NULL DEFAULT '',
  "reference" TEXT NOT NULL DEFAULT '',
  "concept" TEXT NOT NULL,
  "amount" DECIMAL(18, 2) NOT NULL,
  "runningBalance" DECIMAL(18, 2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BankMovement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BankMovement_movementDate_idx" ON "BankMovement"("movementDate");
CREATE INDEX IF NOT EXISTS "BankMovement_operationCode_idx" ON "BankMovement"("operationCode");
CREATE INDEX IF NOT EXISTS "BankMovement_reference_idx" ON "BankMovement"("reference");

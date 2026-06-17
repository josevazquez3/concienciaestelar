-- Tabla de cuentas bancarias para clasificación de movimientos (idempotente)

CREATE TABLE IF NOT EXISTS "BankAccount" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "operatingCode" TEXT NOT NULL DEFAULT '',
  "name" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BankAccount_code_key" ON "BankAccount"("code");
CREATE INDEX IF NOT EXISTS "BankAccount_active_idx" ON "BankAccount"("active");
CREATE INDEX IF NOT EXISTS "BankAccount_name_idx" ON "BankAccount"("name");

-- Elimina cuentas bancarias y la relación en movimientos (idempotente)

ALTER TABLE "BankMovement" DROP CONSTRAINT IF EXISTS "BankMovement_bankAccountId_fkey";
DROP INDEX IF EXISTS "BankMovement_bankAccountId_idx";
ALTER TABLE "BankMovement" DROP COLUMN IF EXISTS "bankAccountId";

DROP TABLE IF EXISTS "BankAccount";

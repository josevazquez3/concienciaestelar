-- Marca visual de conceptos editados manualmente (idempotente)

ALTER TABLE "BankMovement"
  ADD COLUMN IF NOT EXISTS "conceptEdited" BOOLEAN NOT NULL DEFAULT false;

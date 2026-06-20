-- Padrón de clientes (idempotente)

CREATE TABLE IF NOT EXISTS "PadronCliente" (
  "id" TEXT NOT NULL,
  "nombres" TEXT NOT NULL,
  "apellidos" TEXT NOT NULL,
  "documento" TEXT NOT NULL DEFAULT '',
  "fechaNacimiento" TIMESTAMP(3),
  "email" TEXT NOT NULL DEFAULT '',
  "celular" TEXT NOT NULL DEFAULT '',
  "residencia" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PadronCliente_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PadronCliente_apellidos_idx" ON "PadronCliente"("apellidos");
CREATE INDEX IF NOT EXISTS "PadronCliente_nombres_idx" ON "PadronCliente"("nombres");
CREATE INDEX IF NOT EXISTS "PadronCliente_documento_idx" ON "PadronCliente"("documento");
CREATE INDEX IF NOT EXISTS "PadronCliente_email_idx" ON "PadronCliente"("email");

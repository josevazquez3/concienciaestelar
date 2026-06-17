-- Ejecutar con: npm run db:migrate:videos:enabled

ALTER TABLE "Video"
ADD COLUMN IF NOT EXISTS "enabled" BOOLEAN NOT NULL DEFAULT true;

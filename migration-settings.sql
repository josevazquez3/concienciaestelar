-- Ejecutar con: npm run db:migrate:settings
-- O: npx prisma db execute --file ./migration-settings.sql --schema prisma/schema.prisma

CREATE TABLE IF NOT EXISTS "PlatformSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("key")
);

INSERT INTO "PlatformSetting" ("key", "value", "updatedAt")
VALUES ('whatsapp_number', '5492216014212', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

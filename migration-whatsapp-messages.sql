-- Ejecutar con: npm run db:migrate:messages
-- O: npx prisma db execute --file ./migration-whatsapp-messages.sql --schema prisma/schema.prisma

INSERT INTO "PlatformSetting" ("key", "value", "updatedAt")
VALUES
  ('whatsapp_message_contacto', 'Hola, me gustaría obtener más información sobre Consciencia Estelar.', CURRENT_TIMESTAMP),
  ('whatsapp_message_membresia', 'Hola, quiero unirme a la membresía de Consciencia Estelar (Argentina).', CURRENT_TIMESTAMP),
  ('whatsapp_message_proceso', 'Hola, quiero comenzar mi proceso en Consciencia Estelar.', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

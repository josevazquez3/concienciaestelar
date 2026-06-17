-- Ejecutar con: npm run db:migrate:payment

INSERT INTO "PlatformSetting" ("key", "value", "updatedAt")
VALUES
  ('payment_banco', '', CURRENT_TIMESTAMP),
  ('payment_alias', 'Conscienciaestelar33', CURRENT_TIMESTAMP),
  ('payment_cbu', '', CURRENT_TIMESTAMP),
  ('payment_cvu', '', CURRENT_TIMESTAMP),
  ('payment_cuenta', '', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

-- Ejecutar con: npm run db:migrate:videos

CREATE TABLE IF NOT EXISTS "Video" (
  "id" TEXT NOT NULL,
  "youtubeId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Video_date_idx" ON "Video" ("date");

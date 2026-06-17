import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("❌ No existe .env.local");
  console.log("   Copiá .env.example → .env.local y completá las variables.");
  process.exit(1);
}

const content = fs.readFileSync(envPath, "utf8");

function loadEnvIntoProcess() {
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function getVar(name) {
  const match = content.match(new RegExp(`^${name}=(.+)$`, "m"));
  if (!match) return null;
  return match[1].replace(/^["']|["']$/g, "");
}

const checks = [
  {
    name: "DATABASE_URL",
    ok: (v) => v && !v.includes("@HOST") && !v.includes("USER:PASSWORD") && v.includes("neon"),
    hint: "Pegá la URL pooled de Neon Console → Connect",
  },
  {
    name: "DIRECT_URL",
    ok: (v) =>
      v &&
      !v.includes("@HOST") &&
      !v.includes("USER:PASSWORD") &&
      (v.includes("neon") || v.includes("postgres")),
    hint:
      "Usá DATABASE_URL_UNPOOLED o POSTGRES_URL_NON_POOLING de Vercel como DIRECT_URL",
  },
  {
    name: "AUTH_SECRET",
    ok: (v) => v && v.length >= 16,
    hint: "Definí un secreto largo en AUTH_SECRET",
  },
];

let failed = false;

for (const check of checks) {
  const value = getVar(check.name);
  if (check.ok(value)) {
    console.log(`✅ ${check.name}`);
  } else {
    console.error(`❌ ${check.name} — ${check.hint}`);
    failed = true;
  }
}

if (failed) {
  console.log("\n→ Editá: c:\\Users\\user\\Desktop\\concienciaestelar\\.env.local");
  console.log("→ Reiniciá: npm run dev");
  process.exit(1);
}

console.log("\nProbando conexión a Neon...");
loadEnvIntoProcess();
const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

try {
  const count = await prisma.user.count();
  console.log(`✅ Conexión OK — ${count} usuario(s) en la base`);
  if (count === 0) {
    console.log("\n⚠️  No hay usuarios. Ejecutá:");
    console.log("   npx prisma db execute --file ./migration.sql --schema prisma/schema.prisma");
  }
} catch (err) {
  console.error("❌ No se pudo conectar:", err.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}

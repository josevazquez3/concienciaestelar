import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");

const SCAN_DIRS = ["components", "app"];

const FORBIDDEN_IMPORTS = [
  "@/lib/prisma",
  "@/lib/auth",
  "@/lib/whatsapp",
  "@/lib/payment-settings",
  "@/lib/clientes-padron",
  "@/lib/bank-movements",
  "@/lib/bank-statement-config",
  "@prisma/client",
];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(fullPath, files);
      continue;
    }
    if (/\.(tsx|ts|jsx|js)$/.test(entry)) files.push(fullPath);
  }
  return files;
}

function isClientFile(source) {
  return /^\s*["']use client["'];?/m.test(source);
}

function findForbiddenImports(source) {
  const hits = [];
  for (const forbidden of FORBIDDEN_IMPORTS) {
    const pattern = new RegExp(`from\\s+["']${forbidden.replace("/", "\\/")}["']`);
    if (pattern.test(source)) hits.push(forbidden);
  }
  return hits;
}

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(join(root, dir))) {
    const source = readFileSync(file, "utf8");
    if (!isClientFile(source)) continue;

    const hits = findForbiddenImports(source);
    if (hits.length > 0) {
      violations.push({ file: relative(root, file), hits });
    }
  }
}

if (violations.length === 0) {
  console.log("OK: ningún componente cliente importa módulos de servidor.");
  process.exit(0);
}

console.error("Componentes cliente con imports de servidor (usa *-shared.ts o API routes):\n");
for (const { file, hits } of violations) {
  console.error(`- ${file}`);
  for (const hit of hits) console.error(`    ${hit}`);
}
process.exit(1);

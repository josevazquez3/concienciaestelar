import "server-only";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function normalizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("-pooler")) {
      if (!parsed.searchParams.has("pgbouncer")) {
        parsed.searchParams.set("pgbouncer", "true");
      }
      if (!parsed.searchParams.has("connect_timeout")) {
        parsed.searchParams.set("connect_timeout", "15");
      }
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

function isConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("closed") ||
    message.includes("connection") ||
    message.includes("econnreset") ||
    message.includes("can't reach database") ||
    message.includes("server has closed")
  );
}

function createPrismaClient() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: normalizeDatabaseUrl(process.env.DATABASE_URL),
      },
    },
  });

  return base.$extends({
    query: {
      $allOperations: async ({ args, query }) => {
        let lastError: unknown;

        for (let attempt = 1; attempt <= 3; attempt += 1) {
          try {
            return await query(args);
          } catch (error) {
            lastError = error;
            if (!isConnectionError(error) || attempt === 3) {
              throw error;
            }

            await base.$disconnect().catch(() => undefined);
            await base.$connect();
          }
        }

        throw lastError;
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type ExtendedPrismaClient = typeof prisma;

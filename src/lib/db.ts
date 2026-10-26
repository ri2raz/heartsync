import { PrismaClient } from "@prisma/client";

const rawUrl = process.env.DATABASE_URL?.trim();
const databaseUrl = rawUrl ? rawUrl.replace(/^["']|["']$/g, "").trim() : undefined;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(databaseUrl
      ? {
          datasources: {
            db: {
              url: databaseUrl,
            },
          },
        }
      : {}),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

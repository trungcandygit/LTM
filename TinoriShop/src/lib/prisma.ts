import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const url = process.env.DATABASE_URL || "file:./dev.db";
const isLibsql = url.startsWith("libsql://") || url.startsWith("wss://") || url.startsWith("https://");

let prismaClient: PrismaClient;

if (isLibsql) {
  const libsql = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  const adapter = new PrismaLibSql(libsql as any);
  prismaClient = new PrismaClient({ adapter } as any);
} else {
  prismaClient = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? prismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

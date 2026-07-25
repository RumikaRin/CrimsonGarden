import { PrismaClient } from '@prisma/client';

let prismaClient: PrismaClient | null = null;

export function getPrisma(): PrismaClient | null {
  if (!prismaClient) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      return null; // Offline/demo mode — caller handles null
    }
    try {
      prismaClient = new PrismaClient({
        datasources: { db: { url } },
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      });
    } catch {
      return null;
    }
  }
  return prismaClient;
}

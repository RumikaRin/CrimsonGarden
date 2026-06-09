import type { PrismaClient } from '@prisma/client';

/** Legacy placeholder IDs — không phải tài khoản thật */
export const PLACEHOLDER_USER_IDS = new Set(['student-curr', 'guest']);

export function isPlaceholderUserId(userId?: string | null): boolean {
  return !userId || PLACEHOLDER_USER_IDS.has(userId);
}

export async function findRealUser(prisma: PrismaClient, userId: string) {
  if (isPlaceholderUserId(userId)) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

/** Tìm user thật để gán làm chủ đề thi (admin ưu tiên) */
export async function findExamOwner(prisma: PrismaClient) {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'asc' },
  });
  if (admin && !isPlaceholderUserId(admin.id)) return admin;

  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' }, take: 20 });
  return users.find((u) => !isPlaceholderUserId(u.id)) ?? null;
}

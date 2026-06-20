import { prisma } from '@/lib/prisma/prisma';
import type { DashboardUser } from '@/types/db';

export type { DashboardUser };

export async function getUserById(userId: string): Promise<DashboardUser | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPro: true,
    },
  });
}

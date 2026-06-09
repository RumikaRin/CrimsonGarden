import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { isPlaceholderUserId } from '@/lib/users';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ success: false, error: 'DB_OFFLINE' }, { status: 503 });
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({
      success: true,
      users: users.filter((u) => !isPlaceholderUserId(u.id)),
    });
  } catch (err: any) {
    console.error('[Users Fetch Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

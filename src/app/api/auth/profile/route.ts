import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  try {
    const { userId, name, bio, phone } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId là bắt buộc.' }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      // Offline — client updates locally
      return NextResponse.json({ success: true, offline: true });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name ? { name: name.trim() } : {}),
        // bio & phone can be stored in future schema migration
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role
      }
    });
  } catch (err: any) {
    console.warn('[Auth Profile] Error:', err.message);
    // Offline fallback: client updates locally
    return NextResponse.json({ success: true, offline: true });
  }
}

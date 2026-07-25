import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { compareSync } from 'bcryptjs';
import { jwt } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email và mật khẩu là bắt buộc.' }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      // DB not connected — client will use offline fallback
      return NextResponse.json({ success: false, error: 'DB_OFFLINE' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Email này chưa được đăng ký. Hãy tạo tài khoản mới.' });
    }

    const passwordMatch = compareSync(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: 'Mật khẩu không chính xác.' });
    }

    // 1. Tạo JWT Token
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // 2. Set Cookie HttpOnly
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 ngày
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name ?? email.split('@')[0],
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    console.warn('[Auth Login] Error:', err.message);
    return NextResponse.json({ success: false, error: 'DB_OFFLINE' });
  }
}

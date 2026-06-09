import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { hashSync } from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Vui lòng điền đầy đủ thông tin.' }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json({ success: false, error: 'Mật khẩu phải có ít nhất 4 ký tự.' }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ success: false, error: 'DB_OFFLINE' });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'Email này đã được đăng ký. Hãy đăng nhập.' });
    }

    const newUser = await prisma.user.create({
      data: {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashSync(password, 12),
        role: 'STUDENT'
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err: any) {
    console.warn('[Auth Signup] Error:', err.message);
    return NextResponse.json({ success: false, error: 'Không thể đăng ký lúc này. Thử lại sau.' });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { hashSync } from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập email.' }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ success: false, error: 'DB_OFFLINE' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Email này chưa được đăng ký.' });
    }

    // Step 1: Only verify email
    if (!newPassword) {
      return NextResponse.json({
        success: true,
        step: 'verified',
        message: 'Email đã được xác thực.'
      });
    }

    // Step 2: Reset password
    if (newPassword.length < 4) {
      return NextResponse.json({ success: false, error: 'Mật khẩu mới phải có ít nhất 4 ký tự.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: { password: hashSync(newPassword, 12) }
    });

    return NextResponse.json({
      success: true,
      step: 'reset',
      message: 'Mật khẩu đã được đặt lại thành công.'
    });
  } catch (err: any) {
    console.warn('[Auth Forgot Password] Error:', err.message);
    return NextResponse.json({ success: false, error: 'Không thể xử lý yêu cầu. Thử lại sau.' });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { hashSync } from 'bcryptjs';
import { memoryCache } from '@/lib/cache';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

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

    const normalizedEmail = email.toLowerCase().trim();

    // Bước 1: Yêu cầu OTP (Khi chưa truyền otp hoặc newPassword)
    if (!otp && !newPassword) {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Lưu OTP vào cache trong 5 phút (300 giây)
      memoryCache.set(`otp:${normalizedEmail}`, generatedOtp, 300);

      // In mã OTP ra Console máy chủ (giả lập gửi Email thực tế)
      console.log(`\n==================================================`);
      console.log(`[SECURITY-OTP] Mã OTP đặt lại mật khẩu cho ${normalizedEmail} là: ${generatedOtp}`);
      console.log(`==================================================\n`);

      return NextResponse.json({
        success: true,
        step: 'otp_required',
        message: 'Mã OTP đã được gửi. Vui lòng kiểm tra console máy chủ để lấy mã.'
      });
    }

    // Bước 2: Xác thực OTP và đặt lại mật khẩu mới
    if (!otp || !newPassword) {
      return NextResponse.json({ success: false, error: 'Vui lòng cung cấp đầy đủ mã OTP và mật khẩu mới.' }, { status: 400 });
    }

    const cachedOtp = memoryCache.get<string>(`otp:${normalizedEmail}`);
    if (!cachedOtp || cachedOtp !== otp.trim()) {
      return NextResponse.json({ success: false, error: 'Mã xác minh OTP không chính xác hoặc đã hết hạn.' }, { status: 400 });
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ success: false, error: 'Mật khẩu mới phải có ít nhất 4 ký tự.' }, { status: 400 });
    }

    // Cập nhật mật khẩu trong DB
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashSync(newPassword, 12) }
    });

    // Xóa OTP khỏi cache sau khi đổi mật khẩu thành công
    memoryCache.delete(`otp:${normalizedEmail}`);

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

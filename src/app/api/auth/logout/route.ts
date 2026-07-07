import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token');
    
    return NextResponse.json({ success: true, message: 'Đã đăng xuất thành công.' });
  } catch (err: any) {
    console.error('[Auth Logout] Error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi hệ thống khi đăng xuất.' }, { status: 500 });
  }
}

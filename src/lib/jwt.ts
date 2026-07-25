import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'crimson_chalk_secret_key_13579';

// Mã hóa chuỗi sang Base64URL
function base64url(str: string | Buffer, encoding: BufferEncoding = 'utf8'): string {
  const buf = typeof str === 'string' ? Buffer.from(str, encoding) : str;
  return buf.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Giải mã chuỗi từ Base64URL
function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const jwt = {
  /**
   * Ký Token JWT chứa payload người dùng
   */
  sign(payload: JWTPayload, expiresInDays = 7): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expiresInDays * 24 * 60 * 60;
    
    const fullPayload = { ...payload, iat, exp };
    
    const encodedHeader = base64url(JSON.stringify(header));
    const encodedPayload = base64url(JSON.stringify(fullPayload));
    
    // Tạo signature bằng HMAC-SHA256
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(signatureInput)
      .digest();
    
    const encodedSignature = base64url(signature);
    
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  },

  /**
   * Xác thực và giải mã Token JWT. Trả về payload nếu hợp lệ, ngược lại trả về null
   */
  verify(token: string): JWTPayload | null {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    if (!encodedHeader || !encodedPayload || !encodedSignature) return null;
    
    try {
      // Xác minh Signature
      const signatureInput = `${encodedHeader}.${encodedPayload}`;
      const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(signatureInput)
        .digest();
      
      const expectedEncodedSignature = base64url(expectedSignature);
      
      if (encodedSignature !== expectedEncodedSignature) {
        return null; // Token bị sửa đổi
      }
      
      // Giải mã Payload
      const payloadStr = base64urlDecode(encodedPayload);
      const payload = JSON.parse(payloadStr) as JWTPayload;
      
      // Kiểm tra thời hạn hết hạn
      if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
        return null; // Token đã hết hạn
      }
      
      return payload;
    } catch {
      return null;
    }
  },

  /**
   * Trích xuất token từ chuỗi header Cookie
   */
  getTokenFromCookieString(cookieHeader: string | null | undefined): string | null {
    if (!cookieHeader) return null;
    const parts = cookieHeader.split(';');
    for (const part of parts) {
      const trimmed = part.trim();
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const name = trimmed.substring(0, eqIdx);
      const value = trimmed.substring(eqIdx + 1);
      if (name === 'token') return value || null;
    }
    return null;
  }
};

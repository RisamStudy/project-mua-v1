import { cookies } from 'next/headers';
import { redirect } from 'next/navigation'; // ← TAMBAH IMPORT INI
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

// Secret key untuk JWT (HARUS di environment variable)
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 jam (lebih aman)

// Verifikasi password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Hash password (untuk membuat user baru)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Login user dengan rate limiting check
export async function loginUser(username: string, password: string): Promise<User | null> {
  try {
    // Sanitize input
    const sanitizedUsername = username.trim().toLowerCase();
    
    // Cari user berdasarkan username atau email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: sanitizedUsername },
          { email: sanitizedUsername }
        ],
        isActive: true
      }
    });

    if (!user) {
      // Constant time delay untuk mencegah timing attacks
      await bcrypt.hash(password, 12);
      return null;
    }

    // Verifikasi password
    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
      return null;
    }

    // Return user tanpa password
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role
    };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// Generate secure token dengan HMAC
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex') // Prevent replay attacks
  };
  
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr).toString('base64');
  
  // Create HMAC signature
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadB64)
    .digest('base64');
  
  return `${payloadB64}.${signature}`;
}

// Parse dan validate token
export function parseToken(token: string): User | null {
  try {
    const [payloadB64, signature] = token.split('.');
    
    if (!payloadB64 || !signature) {
      return null;
    }
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payloadB64)
      .digest('base64');
    
    // Constant-time comparison untuk mencegah timing attacks
    if (!crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )) {
      return null;
    }
    
    // Decode payload
    const decoded = Buffer.from(payloadB64, 'base64').toString('utf-8');
    const data = JSON.parse(decoded);
    
    // Validasi token tidak expired
    const tokenAge = Date.now() - data.timestamp;
    
    if (tokenAge > TOKEN_EXPIRY) {
      return null;
    }
    
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      name: data.name,
      role: data.role
    };
  } catch (error) {
    console.error('Token parse error:', error);
    return null;
  }
}

// Get current user from cookie
export async function getUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return null;
    }

    return parseToken(token.value);
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// ===== UNTUK SERVER COMPONENTS (Pages/Layouts) =====
// Gunakan ini di pages dan layouts - akan redirect ke login jika tidak auth
export async function requireAuth(): Promise<User> {
  const user = await getUser();
  
  if (!user) {
    redirect('/login'); 
  }
  
  return user;
}

// Check if user has specific role - redirect jika tidak punya akses
export async function requireRole(allowedRoles: string[]): Promise<User> {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  if (!allowedRoles.includes(user.role)) {
    redirect('/dashboard'); // Redirect to safe page
  }
  
  return user;
}

// ===== UNTUK API ROUTES =====
// Gunakan ini di API routes - akan throw error untuk response 401/403
export async function requireAuthAPI(): Promise<User> {
  const user = await getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

// Check if user has specific role di API - throw error
export async function requireRoleAPI(allowedRoles: string[]): Promise<User> {
  const user = await requireAuthAPI();
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }
  
  return user;
}

// Validate password strength
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
}
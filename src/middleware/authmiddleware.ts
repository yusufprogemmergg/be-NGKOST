// src/middleware/authmiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {prisma} from '../lib/prisma'; // sesuaikan path jika beda
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined in environment');

/**
 * Local typed Request that includes `user`.
 * Menghindari kebutuhan augment global (.d.ts).
 */
export interface AuthUser {
  id: number;
  email?: string | null;
  role: Role | 'owner' | 'user';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

/** Ambil token dari header Authorization: "Bearer <token>" */
function getTokenFromHeader(req: Request): string | null {
  const authHeader = (req.headers.authorization || (req.headers as any).Authorization) as string | undefined;
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
  return null;
}

/**
 * authenticate
 * - Verifikasi token JWT
 * - Mengambil user terbaru dari DB (opsional tapi aman)
 * - Attach user ke req.user
 *
 * Catatan penting: di authController kamu menandatangani token dengan
 * { userId, role } sehingga kita membaca payload.userId di sini.
 */
export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ message: 'Authorization token missing' });

    const payload = jwt.verify(token, JWT_SECRET) as any;

    // menyesuaikan payload yang kamu buat: { userId, role }
    const uid = Number(payload?.userId ?? payload?.id ?? payload?.user?.id);
    if (!uid) return res.status(401).json({ message: 'Invalid token payload' });

    // ambil fresh user dari DB
    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as AuthUser['role']
    };

    return next();
  } catch (err) {
    console.error('authenticate error', err);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}

/**
 * requireRole(...allowed)
 * Factory middleware yang memeriksa role user
 * Example: requireRole('owner'), requireRole('user','owner')
 */
export function requireRole(...allowed: (Role | 'owner' | 'user')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
    if (!allowed.includes(req.user.role as Role | 'owner' | 'user')) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    return next();
  };
}

export const requireOwner = () => requireRole('owner');
export const requireUser = () => requireRole('user', 'owner');

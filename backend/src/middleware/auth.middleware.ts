import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt.utils';
import { isTokenBlacklisted } from '../services/auth.service';

// Extend Express Request type to include user and raw token
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      token?: string;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization token required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Verify JWT signature first (fast) — only then hit DB for blacklist check
  let payload: JwtPayload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  // DB-persistent blacklist check (CRIT-2 fix)
  const revoked = await isTokenBlacklisted(token);
  if (revoked) {
    res.status(401).json({ message: 'Token has been revoked — please login again' });
    return;
  }

  req.user = payload;
  req.token = token;
  next();
}
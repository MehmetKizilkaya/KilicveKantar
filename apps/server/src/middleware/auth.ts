import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/prisma';

export interface AuthRequest extends Request {
  playerId?: string;
  playerRole?: string;
}

interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Kimlik doğrulama gerekli' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.playerId = payload.sub;
    req.playerRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.playerRole !== 'ADMIN') {
    res.status(403).json({ error: 'Yetkisiz erişim' });
    return;
  }
  next();
}

export async function socketAuthenticate(token: string): Promise<{ playerId: string; username: string; factionId: string | null }> {
  const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  const player = await prisma.player.findUniqueOrThrow({
    where: { id: payload.sub },
    select: { id: true, username: true, factionId: true },
  });
  return { playerId: player.id, username: player.username, factionId: player.factionId };
}

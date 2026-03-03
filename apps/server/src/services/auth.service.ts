import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { env } from '../config/env';

const SALT_ROUNDS = 12;

export const AuthService = {
  async register(username: string, email: string, password: string) {
    const existing = await prisma.player.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw new Error(existing.email === email ? 'Bu e-posta zaten kayıtlı' : 'Bu kullanıcı adı alınmış');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const player = await prisma.player.create({
      data: { username, email, passwordHash },
      select: {
        id: true, username: true, email: true,
        akceBalance: true, altinBalance: true,
        energy: true, tradeLevel: true, militaryLevel: true,
        vipPlan: true, role: true,
      },
    });

    const tokens = generateTokens(player.id, player.role);
    await saveRefreshToken(player.id, tokens.refreshToken);
    return { player, ...tokens };
  },

  async login(emailOrUsername: string, password: string) {
    const player = await prisma.player.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });
    if (!player) throw new Error('Kullanıcı bulunamadı');

    const valid = await bcrypt.compare(password, player.passwordHash);
    if (!valid) throw new Error('Yanlış şifre');

    await prisma.player.update({
      where: { id: player.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = generateTokens(player.id, player.role);
    await saveRefreshToken(player.id, tokens.refreshToken);

    return {
      player: {
        id: player.id,
        username: player.username,
        email: player.email,
        akceBalance: player.akceBalance,
        altinBalance: player.altinBalance,
        energy: player.energy,
        tradeLevel: player.tradeLevel,
        militaryLevel: player.militaryLevel,
        vipPlan: player.vipPlan,
        role: player.role,
        factionId: player.factionId,
        homeRegionId: player.homeRegionId,
      },
      ...tokens,
    };
  },

  async refreshTokens(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { player: { select: { id: true, role: true } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new Error('Geçersiz refresh token');
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const tokens = generateTokens(stored.player.id, stored.player.role);
    await saveRefreshToken(stored.player.id, tokens.refreshToken);
    return tokens;
  },

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  },

  async getProfile(playerId: string) {
    return prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      select: {
        id: true, username: true, email: true,
        akceBalance: true, altinBalance: true,
        energy: true, tradeXp: true, militaryXp: true,
        tradeLevel: true, militaryLevel: true,
        vipPlan: true, vipExpiresAt: true,
        reputationScore: true, role: true,
        homeRegionId: true, factionId: true,
        createdAt: true,
        homeRegion: { select: { id: true, name: true } },
        faction: { select: { id: true, name: true, tag: true } },
        badges: { select: { badgeId: true, earnedAt: true } },
      },
    });
  },
};

function generateTokens(playerId: string, role: string) {
  const accessToken = jwt.sign(
    { sub: playerId, role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions,
  );
  const refreshToken = jwt.sign(
    { sub: playerId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions,
  );
  return { accessToken, refreshToken };
}

async function saveRefreshToken(playerId: string, token: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({ data: { playerId, token, expiresAt } });
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * Generate JWT Access Token (short-lived)
   * Contains user ID and email in payload
   */
  async generateAccessToken(userId: number, email: string): Promise<string> {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRATION'),
    });
  }

  /**
   * Generate Refresh Token (long-lived)
   * Stored in database for revocation capability
   */
  async generateRefreshToken(userId: number): Promise<string> {
    // Generate a secure random token
    const token = crypto.randomBytes(64).toString('hex');
    
    // Calculate expiration time
    const expirationDays = parseInt(this.config.get('JWT_REFRESH_EXPIRATION').replace('d', ''));
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    // Store in database
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Validate Refresh Token
   * Checks if token exists in DB and hasn't expired
   */
  async validateRefreshToken(token: string): Promise<{ userId: number; email: string }> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token has expired
    if (new Date() > refreshToken.expiresAt) {
      // Delete expired token
      await this.prisma.refreshToken.delete({ where: { id: refreshToken.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    return {
      userId: refreshToken.user.id,
      email: refreshToken.user.email,
    };
  }

  /**
   * Revoke Refresh Token (used on logout)
   */
  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  /**
   * Revoke all refresh tokens for a user
   * Useful for "logout from all devices"
   */
  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Clean up expired tokens (can be run as a cron job)
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}

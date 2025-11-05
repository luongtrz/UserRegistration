import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

/**
 * JWT Strategy for Passport
 * Validates JWT tokens and attaches user to request
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      // Extract JWT from Authorization header as Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Reject expired tokens
      ignoreExpiration: false,
      // Secret key to verify token signature
      secretOrKey: config.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  /**
   * Validate JWT payload
   * Called automatically by Passport after JWT is verified
   * The payload comes from the decoded JWT token
   */
  async validate(payload: { sub: number; email: string }) {
    // Find user in database
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    // If user doesn't exist, token is invalid
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return user object - will be attached to request as req.user
    return user;
  }
}

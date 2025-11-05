import { Body, Controller, HttpCode, Post, Get, UnauthorizedException, HttpStatus, UseGuards, Request, Res, Req } from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly users: UsersService,
    private readonly authService: AuthService,
  ) {}
  
  // LOGIN - Returns JWT tokens
  // 🔥 STRETCH GOAL 3: Set refresh token in HttpOnly cookie
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Validate credentials
    const found = await this.users.findByEmail(dto.email);
    const ok = await bcrypt.compare(dto.password, found.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const accessToken = await this.authService.generateAccessToken(found.id, found.email);
    const refreshToken = await this.authService.generateRefreshToken(found.id);

    // 🍪 Set refresh token as HttpOnly cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,        // ✅ Cannot be accessed by JavaScript (XSS protection)
      secure: process.env.NODE_ENV === 'production', // ✅ HTTPS only in production
      sameSite: 'lax',       // ✅ CSRF protection (use 'strict' for stronger protection)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: found.id,
          email: found.email,
          createdAt: found.createdAt,
        },
        accessToken,
        refreshToken, // Also return in response body for backward compatibility
      },
    };
  }

  // REFRESH TOKEN - Get new access token using refresh token
  // 🔥 STRETCH GOAL 3: Read refresh token from cookie or body
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Body('refreshToken') bodyRefreshToken: string,
    @Req() request: ExpressRequest,
  ) {
    // Try to get refresh token from cookie first, then from body
    const refreshToken = request.cookies?.refreshToken || bodyRefreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    // Validate refresh token and get user info
    const { userId, email } = await this.authService.validateRefreshToken(refreshToken);

    // Generate new access token
    const newAccessToken = await this.authService.generateAccessToken(userId, email);

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
      },
    };
  }

  // LOGOUT - Revoke refresh token
  // 🔥 STRETCH GOAL 3: Read refresh token from cookie or body, then clear cookie
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Body('refreshToken') bodyRefreshToken: string,
    @Req() request: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Try to get refresh token from cookie first, then from body
    const refreshToken = request.cookies?.refreshToken || bodyRefreshToken;

    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    // 🍪 Clear the refresh token cookie
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return {
      success: true,
      message: 'Logout successful',
      data: null,
    };
  }

  // GET CURRENT USER - Protected endpoint
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  async getMe(@Request() req: any) {
    // req.user is populated by JwtStrategy.validate()
    return {
      success: true,
      message: 'User data retrieved successfully',
      data: req.user,
    };
  }
}

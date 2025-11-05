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
  
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const found = await this.users.findByEmail(dto.email);
    const ok = await bcrypt.compare(dto.password, found.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.authService.generateAccessToken(found.id, found.email);
    const refreshToken = await this.authService.generateRefreshToken(found.id);

    // Set refresh token as HttpOnly cookie for security
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
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
        refreshToken,
      },
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Body('refreshToken') bodyRefreshToken: string,
    @Req() request: ExpressRequest,
  ) {
    const refreshToken = request.cookies?.refreshToken || bodyRefreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    const { userId, email } = await this.authService.validateRefreshToken(refreshToken);
    const newAccessToken = await this.authService.generateAccessToken(userId, email);

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
      },
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Body('refreshToken') bodyRefreshToken: string,
    @Req() request: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken || bodyRefreshToken;

    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

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

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  async getMe(@Request() req: any) {
    return {
      success: true,
      message: 'User data retrieved successfully',
      data: req.user,
    };
  }
}

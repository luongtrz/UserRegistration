import { Body, Controller, HttpCode, Post, Get, UnauthorizedException, HttpStatus, UseGuards, Request } from '@nestjs/common';
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
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: CreateUserDto) {
    // Validate credentials
    const found = await this.users.findByEmail(dto.email);
    const ok = await bcrypt.compare(dto.password, found.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const accessToken = await this.authService.generateAccessToken(found.id, found.email);
    const refreshToken = await this.authService.generateRefreshToken(found.id);

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

  // REFRESH TOKEN - Get new access token using refresh token
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
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
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

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

import { Body, Controller, HttpCode, Post, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(private readonly users: UsersService) {}
  
  // LOGIN
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: CreateUserDto) {
    const found = await this.users.findByEmail(dto.email);
    const ok = await bcrypt.compare(dto.password, found.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      success: true,
      message: 'Login successful',
      data: { id: found.id, email: found.email, createdAt: found.createdAt },
    };
  }
}

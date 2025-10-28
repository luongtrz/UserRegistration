import { Body, Controller, Post, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto.email, dto.password);
    return {
      success: true,
      message: 'User registered successfully',
      data: user,
    };
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  async getAllUsers() {
    const users = await this.usersService.findAll();
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    };
  }
}

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    try {
      const user = await this.prisma.user.create({
        data: { email, password: hash },
        select: { id: true, email: true, createdAt: true },
      });
      return user;
    } catch (e: any) {
      // Prisma unique constraint
      if (e.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw e;
    }
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: { id: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }
}

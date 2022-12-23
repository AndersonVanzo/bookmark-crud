import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  signin() {
    return {
      message: 'You are signed in!',
    };
  }

  signup() {
    return {
      message: 'You are signed up!',
    };
  }
}

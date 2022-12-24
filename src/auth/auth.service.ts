import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dataTransferObject';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signin(dataTransferObject: AuthDto) {
    // find user by email
    // if user does not exist throw an exception
    const user = await this.prisma.user.findUnique({
      where: {
        email: dataTransferObject.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }

    // check password
    // if password is incorrect throw an exception
    const passwordMatches = await argon.verify(
      user.hash,
      dataTransferObject.password,
    );
    if (!passwordMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }

    // return the jwt token
    return this.signToken(user.id, user.email);
  }

  async signup(dataTransferObject: AuthDto) {
    // generate password
    const hash = await argon.hash(dataTransferObject.password);

    try {
      // save the new user in the database
      const user = await this.prisma.user.create({
        data: {
          email: dataTransferObject.email,
          hash,
        },
      });

      // return the jwt token
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
        throw error;
      }
    }
  }

  async signToken(userId: number, email: string) {
    const secret = this.config.get('JWT_SECRET');
    const payload = {
      sub: userId,
      email,
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '120m',
      secret,
    });

    return {
      accessToken: token,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientUnknownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(b: AuthDto) {
    const hash = await argon.hash(b.password);
    try {
      const user = await this.prisma.User.create({
        data: {
          email: b.email,
          password: hash,
        },
        // select: {
        //   id: true,
        //   email: true,
        // },
      });
      delete user.password;
      return user;
    } catch (error) {
      if(error instanceof PrismaClientUnknownRequestError)
         
    }
  }
  signin() {
    return `s`;
  }
}

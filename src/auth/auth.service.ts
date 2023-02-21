import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  signup(b: AuthDto) {
    return `Welecome email : ${b.email} password : ${b.password} `;
  }
  signin() {
    return `s`;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  User: any;
  constructor() {
    // call constructor of prismaClent
    super({
      datasources: {
        db: {
          url: 'postgresql://postgress:123@localhost:5432/nest',
        },
      },
    });
  }
}

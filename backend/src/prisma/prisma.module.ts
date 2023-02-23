import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() //Available for all Modules
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // get by Auth module
})
export class PrismaModule {}

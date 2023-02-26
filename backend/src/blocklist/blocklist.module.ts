import { Module } from '@nestjs/common';
import { BlocklistService } from './blocklist.service';
import { BlocklistController } from './blocklist.controller';

@Module({
  providers: [BlocklistService],
  controllers: [BlocklistController]
})
export class BlocklistModule {}

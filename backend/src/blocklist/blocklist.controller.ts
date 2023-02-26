import { Controller } from '@nestjs/common';
import { BlocklistService } from './blocklist.service';
import { Body, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards';
import { Request } from 'express';

@Controller('blocklist')
export class BlocklistController {
  constructor(private blocklistService: BlocklistService) {}

  @Get('')
  @UseGuards(JwtGuard)
  fetchAllBlocklist(@Req() req: Request): any {
    return this.blocklistService.fetchAllBlocklist(req.user.id);
  }

  @Post(':id')
  @UseGuards(JwtGuard)
  async addToBlocklist(@Param('id') idUser: string, @Req() req: Request) {
    return this.blocklistService.addToBlocklist(idUser, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async rmvFromBlocklist(@Param('id') idUser: string, @Req() req: Request) {
    return this.blocklistService.rmvFromBlocklist(idUser, req.user.id);
  }
}

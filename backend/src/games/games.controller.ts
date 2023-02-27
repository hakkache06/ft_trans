import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { GamesService } from './games.service';
import { JwtGuard } from 'src/auth/guards';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get('')
  async getAllGames(@Req() req: Request) {
    return this.gamesService.getAllGames(req);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async getOneRoom(@Param('id') idRoom: string) {
    return this.gamesService.findOne(idRoom);
  }
}

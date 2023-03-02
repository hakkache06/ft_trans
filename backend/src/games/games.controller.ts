import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GamesService } from './games.service';
import { JwtGuard } from 'src/auth/guards';

@Controller('games')
@UseGuards(JwtGuard)
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get('')
  async getAllGames() {
    return this.gamesService.getAllGames();
  }

  @Get(':id')
  async getOneRoom(@Param('id') idRoom: string) {
    return this.gamesService.findOne(idRoom);
  }
}

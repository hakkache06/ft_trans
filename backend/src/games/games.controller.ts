import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { GamesService } from './games.service';
import { gameDto } from './dto';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get('')
  async getAllGames(@Req() req: Request) {
    return this.gamesService.getAllGames(req);
  }

  @Post('')
  async createGame(@Req() req: Request, @Body() body: gameDto) {
    return this.gamesService.createGame(req, body);
  }
}

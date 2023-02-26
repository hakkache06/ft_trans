import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { gameDto } from './dto';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async getAllGames(req: any) {
    const games = await this.prisma.game.findMany({});
    if (!games) throw new HttpException('No game found', 404);
    return games;
  }

  async createGame(req: any, body: gameDto) {
    const gameCreated = await this.prisma.game.create({
      data: {
        background: body.background,
        player1_id: body.player1_id,
        player2_id: body.player2_id,
      },
    });
  }
}

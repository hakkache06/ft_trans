import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async getAllGames(req: any) {
    const games = await this.prisma.game.findMany({});
    if (!games) throw new HttpException('No game found', 404);
    return games;
  }

  async findOne(id: string) {
    const game = await this.prisma.game.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        background: true,
        player1_score: true,
        player2_score: true,
        state: true,
        player1: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        player2: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    if (!game) throw new HttpException('Game not found', 404);
    return game;
  }
}

import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  //Fetch user By name (?)
  async fetchAlluser(search: string) {
    return await this.prisma.User.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
      take: 10,
    });
  }

  getProfile(id: string) {
    try {
      const getProfile = this.prisma.User.findUnique({
        where: {
          id,
        },
      });
      if (getProfile) return getProfile;
      else return { meassgae: `Error getProfile` };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    }
  }

  async getOneUser(idUser: string) {
    try {
      const fetchByid = await this.prisma.User.findUnique({
        where: {
          id: idUser,
        },
      });
      if (fetchByid) return fetchByid;
      else return { meassgae: `Error getOneuser` };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    }
  }

  async updateUserbyId(idUser: string, b: UpdateUserDto) {
    if (
      await this.prisma.User.findFirst({
        where: {
          id: {
            not: idUser,
          },
          name: b.name,
        },
      })
    )
      throw new HttpException('Name already exists', 400);
    await this.prisma.User.update({
      where: {
        id: idUser,
      },
      data: b,
    });
  }

  async deleteUserbyId(idUser: string) {
    try {
      const deleteByid = await this.prisma.User.delete({
        where: {
          id: idUser,
        },
      });
      if (deleteByid) return deleteByid;
      else return { meassgae: `Error deleteByid` };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    }
  }

  async gethistoryMatch(req) {
    try {
      const history = await this.prisma.game.findMany({
        where: {
          player1_id: req.user.id,
        },
        select: {
          player1_score: true,
          player2_score: true,
          player1: {
            select: {
              name: true,
            },
          },
          player2: {
            select: {
              name: true,
            },
          },
        },
      });
      if (history) return history;
      else throw new BadRequestException('  not have any Match History');
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    }
  }

  getFilePath(type: number): string {
    let filePath = `/goinfre/yhakkach/ft_trans/backend/achivement${type}.png`;
    if (type > 12) {
      filePath = `/goinfre/yhakkach/ft_trans/backend/achivement${12}.png`;
    } else if (type < 1) {
      filePath = `/goinfre/yhakkach/ft_trans/backend/achivement${1}.png`;
    }
    return filePath;
  }

  async takeAchivement(req) {
    try {
      let count = 0;
      const getScore = await this.prisma.User.findMany({
        where: { id: req.user.id },
        select: {
          wins: true,
        },
      });
      if (getScore) {
        let score = getScore[0].wins;
        while (score / 2 >= 2.5) {
          count++;
          score /= 2;
        }
        return this.getFilePath(count);
      }
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    }
  }

  async getStatistic(req) {
    try {
      const Statistic = await this.prisma.User.findMany({
        where: { id: req.user.id },
        select: {
          xp: true,
          wins: true,
          loses: true,
        },
      });
      if (Statistic) return Statistic;
      else throw new BadRequestException('user not exist ');
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    }
  }
}

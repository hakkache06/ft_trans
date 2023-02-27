import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  //Fetch user By name (?)
  async fetchAlluser(search: string) {
    return await this.prisma.user.findMany({
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
      const getProfile = this.prisma.user.findUnique({
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
      const fetchByid = await this.prisma.user.findUnique({
        where: {
          id: idUser,
        },
      });
      if (fetchByid) return fetchByid;
      else return { meassgae: `Error getProfile` };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    }
  }

  async updateUserbyId(idUser: string, b: UpdateUserDto) {
    if (
      await this.prisma.user.findFirst({
        where: {
          id: {
            not: idUser,
          },
          name: b.name,
        },
      })
    )
      throw new HttpException('Name already exists', 400);
    await this.prisma.user.update({
      where: {
        id: idUser,
      },
      data: b,
    });
  }

  async deleteUserbyId(idUser: string) {
    try {
      const deleteByid = await this.prisma.user.delete({
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
        where: { player1_id: req.user.id },
        select: {
          player1_id: true,
          player2_id: true,
        },
      });
      if (history) return history;
      else throw new BadRequestException('  not have any Match History');
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    }
  }
}

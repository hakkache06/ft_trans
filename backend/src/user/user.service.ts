import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  //Fetch user By name (?)
  async fetchAlluser() {
    try {
      const fetch = await this.prisma.user.findMany({});
      if (fetch) return fetch;
      else return { meassgae: `Error fetchAlluser` };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    }
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
}

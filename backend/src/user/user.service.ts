import { Body, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  //Fetch user By name (?)
  async fetchAlluser(b, res) {
    try {
      const fetch = await this.prisma.user.findMany({});
      res.send({
        fetch,
      });
    } catch (error) {
      res.send({
        meassge: 'error fom prisma',
      });
    }
  }

  getProfile(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async getOneUser(idUser: string, res) {
    try {
      const fetchByid = await this.prisma.user.findUnique({
        where: {
          id: idUser,
        },
      });
      res.send({
        fetchByid,
      });
    } catch (error) {
      res.send({
        meassge: 'error fom prisma',
      });
    }
  }

  async updateUserbyId(idUser: string, b, res) {
    try {
      const fetchByid = await this.prisma.user.update({
        where: {
          id: idUser,
        },
        data: b,
      });
      res.send({
        fetchByid,
      });
    } catch (error) {
      res.send({
        meassge: 'error fom prisma',
      });
    }
  }

  async deleteUserbyId(idUser: string, res) {
    try {
      const fetchByid = await this.prisma.user.delete({
        where: {
          id: idUser,
        },
      });
      res.send({
        fetchByid,
      });
    } catch (error) {
      res.send({
        meassge: 'error fom prisma',
      });
    }
  }
}

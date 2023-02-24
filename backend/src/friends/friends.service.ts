import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import console from 'console';
import { async } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  //Fetch user By name (?)
  async fetchAllfriends(b) {
    try {
      const fetch = await this.prisma.friend.findMany({});
      return fetch;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    }
  }

  async addFrineds(idUser: string, b, req) {
    try {
      const checkuser = await this.prisma.User.findMany({
        where: { id: idUser },
      });
      if (Object.entries(checkuser).length !== 0) {
        const newcheckuser = await this.prisma.friend.findMany({
          where: { to_id: idUser },
        });
        if (Object.entries(newcheckuser).length === 0) {
          const createcheckuser = await this.prisma.friend.create({
            data: {
              to_id: idUser,
              from_id: req.user.id, // UseGuards(JwtGuard)
              accepted: true,
            },
          });
        } else {
          return { meassgae: `id ${idUser}  found in table Friends` };
        }
      } else {
        return { meassgae: `id ${idUser} not found in table Users` };
      }
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    }
  }

  async removeFriends(idUser: string, req) {
    try {
      const removedFriend = await this.prisma.friend.deleteMany({
        where: {
          OR: [
            {
              from_id: req.user.id,
              to_id: idUser,
            },
            {
              from_id: idUser,
              to_id: req.user.id,
            },
          ],
        },
      });
      return { meassgae: `id removed ${idUser}` };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    }
  }
}

//Authorization: Bearer <token>

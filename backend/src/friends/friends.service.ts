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

  async addFrineds(idUser: string, req) {
    try {
      //need check blocked
      if (idUser === req.user.id)
        return { meassgae: `It is not possible to add yourself!` };
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
              accepted: false,
            },
          });
          if (createcheckuser) return { meassgae: `Add id ${idUser} Friend ` };
          else return { meassgae: ` Error Add ` };
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
      if (idUser === req.user.id) return { meassgae: `Error` };
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
      if (removedFriend) return { meassgae: `id removed ${idUser}` };
      else return { meassgae: `Error removed` };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    }
  }

  async acceptFriends(idUser: string, req) {
    const accepted = await this.prisma.friend.update({
      where: {
        from_id_to_id: {
          from_id: idUser,
          to_id: req.user.id,
        },
      },
      data: {
        accepted: true,
      },
    });
    if (accepted) return { message: 'Friend Accepted' };
  }

  async getFriends(req) {
    try {
      const getFriends = await this.prisma.friend.findMany({
        where: { from_id: req.user.id },
      });
      if (getFriends) return { getFriends };
      else return 'Erroe getFriends';
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    }
  }
}

//Authorization: Bearer <token>

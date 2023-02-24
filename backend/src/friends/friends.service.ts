import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import console from 'console';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  //Fetch user By name (?)
  async fetchAllfriends(b, res) {
    try {
      const fetch = await this.prisma.friend.findMany({});
      res.send({
        fetch,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    }
  }

  async addFrineds(idUser: string, b, res) {
    try {
      const checkuser = await this.prisma.User.findMany({
        where: { id: idUser },
      });
      // Id Wach kayen
      if (Object.entries(checkuser).length !== 0) {
        const newcheckuser = await this.prisma.friend.findMany({
          where: { to_id: idUser },
        });
        if (Object.entries(newcheckuser).length === 0) {
          const createcheckuser = await this.prisma.friend.create({
            data: {
              to_id: idUser,
              from_id: '2e9655b9-654c-49da-bb4d-996d8c752067',
              accepted: true,
            },
          });
          res.send({ message: 'cretae Valid' });
        } else {
          res.send('exist in table friends');
        }
      } else {
        res.send('user not exist');
      }
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    }
  }
}

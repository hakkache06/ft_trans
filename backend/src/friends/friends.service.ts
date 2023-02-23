import { Injectable } from '@nestjs/common';
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
    } catch (error) {
      res.send({
        meassge: 'error fom prisma',
      });
    }
  }

  async addFrineds(idUser: string, b, res) {
    try {
      const checkuser = await this.prisma.User.findMany({
        where: { id: idUser },
      });
      if (checkuser) res.send({ message: 'exist' });
      else {
        const checkuser = await this.prisma.friend.findMany({
          where: { to_id: idUser },
        });
        if (!checkuser) {
          const checkuser = await this.prisma.friend.create({
            data: {
              to_id: 'x',
              from_id: 'z',
              accepted: true,
            },
          });
        }
      }
    } catch (error) {
      res.send({
        meassge: 'error from prisma',
      });
    }
  }
}

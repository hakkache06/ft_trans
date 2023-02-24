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
      // Id Wach kayen
      if (checkuser) {
        const checkuser = await this.prisma.friend.findMany({
          where: { from_id: idUser },
        });
        if (!checkuser) {
          const checkuser = await this.prisma.friend.create({
            data: {
              to_id: b.id,
              from_id: '2e9655b9-654c-49da-bb4d-996d8c75206we',
              accepted: true,
            },
          });
        } else {
          res.send({ meassge: 'exist' });
        }
      } else {
        res.send({ meassge: 'not exist' });
      }
    } catch (error) {
      res.send({
        meassge: 'error from prisma',
      });
    }
  }
}

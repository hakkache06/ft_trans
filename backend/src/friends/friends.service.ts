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
      if (checkuser) res.send({ message: 'exist' });
      else {
        //Id Wach kayen fe Table friends
        const checkuser = await this.prisma.friend.findMany({
          where: { to_id: idUser },
        });
        if (!checkuser) {
          // ila makyench
          const checkuser = await this.prisma.friend.create({
            data: {
              to_id: b.id,
              from_id: 'my id',
              accepted: true,
            },
          });
        } else {
          res.send({ message: 'exist' });
        }
      }
    } catch (error) {
      res.send({
        meassge: 'error from prisma',
      });
    }
  }
}

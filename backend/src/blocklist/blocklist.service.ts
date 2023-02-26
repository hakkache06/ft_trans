import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomsGateway } from 'src/shared/rooms.gateway';

@Injectable()
export class BlocklistService {
  constructor(private prisma: PrismaService, private gateway: RoomsGateway) {}

  async fetchAllBlocklist(id: string) {
    const blockedList = await this.prisma.blocklist.findMany({
        where: {
            from_id: id,
        },
        select: {
            to_id: true,
        }
    });
    return blockedList;
  }

  async addToBlocklist(from: string, to: string) {
   await this.prisma.blocklist.create({
     data: {
       from_id: from,
       to_id: to,
     },
   });
    this.gateway.server.emit('users:blocklist');
  }

  async rmvFromBlocklist(from: string, to: string) {
   await this.prisma.blocklist.delete({
      where: {
        from_id_to_id: {
            from_id: from,
            to_id: to,
        }
      }
    });
    this.gateway.server.emit('users:blocklist');
  }


}

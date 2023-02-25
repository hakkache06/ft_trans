import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async findMsgByRoomId(idRoom: string) {
    const userMessages = await this.prisma.message.findMany({
      where: {
        room_id: idRoom,
      },
    });
    return userMessages;
  }
}

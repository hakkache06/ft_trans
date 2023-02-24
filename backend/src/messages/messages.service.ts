import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageDto } from './dto';
import { RoomsGateway } from 'src/rooms/rooms.gateway';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async postMessage(req: any, body: MessageDto) {
    const messages = await this.prisma.message.create({
      data: {
        content: body.message,
        room_id: Number(body.room_id),
        from_id: req.user.id,
      },
    });
    return messages;
  }

  async findMsgByRoomId(idRoom: number) {
    const userMessages = await this.prisma.message.findMany({
      where: {
        room_id: idRoom,
      },
    });
    return userMessages;
  }
}

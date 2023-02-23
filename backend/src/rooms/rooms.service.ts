import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RoomDto, RoomUserDto, UpdateRoomDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async createRoom(body: RoomDto, req: any) {
    const new_room = await this.prisma.room.create({
      data: {
        id_user_owner: req.user.id,
        type: body.type,
        password:
          body.type === 'protected' ? await argon.hash(body.password) : null,
      },
    });
    const roomUser = await this.prisma.roomUser.create({
      data: {
        user_id: new_room.id_user_owner,
        room_id: new_room.id,
        admin: true,
        ban: false,
        mute: null,
      },
    });
  }

  async fetchAllRoom() {
    const rooms = await this.prisma.room.findMany({});
    if (!rooms) throw 'Not room is found';
    return rooms;
  }

  async getOneRoom(idRoom: number) {
    try {
      const room = await this.prisma.room.findUnique({
        where: {
          id: idRoom,
        },
      });
      if (!room) throw 'Room not found';
      return room;
    } catch (e) {
      return e;
    }
  }

  async update(idRoom: number, req: any, body: UpdateRoomDto) {
    await this.prisma.room.updateMany({
      where: {
        id: idRoom,
        id_user_owner: req.user.id,
      },
      data: {
        type: body.type,
        password:
          body.type === 'protected' ? await argon.hash(body.password) : null,
      },
    });
  }

  async deleteRoom(idRoom: number, req: any) {
    try {
      const room = await this.prisma.room.findUnique({
        where: {
          id: idRoom,
        },
      });
      if (!room) throw 'Room not found';
      if (req.user.id === room.id_user_owner) {
        const roomDeleted = await this.prisma.room.delete({
          where: {
            id: idRoom,
          },
        });
      } else throw 'Not the right user';
    } catch (e) {
      return e;
    }
  }

  async joinRoom(idRoom: number, req: any) {
    const roomUser = this.prisma.roomUser.create({
      data: {
        user_id: req.user.id,
        room_id: idRoom,
        admin: false,
        ban: false,
        mute: null,
      },
    });
  }

  async kickUser(idRoom: number, idUser: string, req: any) {
    const roomUser = await this.prisma.roomUser.findFirst({
      where: {
        room_id: idRoom,
        user_id: req.user.id,
        admin: true,
      },
    });
    if (!roomUser) throw new HttpException('Unauthorized', 401);
    if (roomUser) {
      const roomUser = await this.prisma.roomUser.deleteMany({
        where: {
          user_id: idUser,
          room_id: idRoom,
        },
      });
    }
  }

  async updateUser(
    idRoom: number,
    idUser: string,
    body: RoomUserDto,
    req: any,
  ) {
    const roomUser = this.prisma.roomUser.updateMany({
      where: {
        user_id: idUser,
        room_id: idRoom,
      },
      data: {
        admin: body.admin,
        ban: body.ban,
        mute: body.mute,
      },
    });
  }
}

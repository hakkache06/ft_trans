import { HttpException, Injectable } from '@nestjs/common';
import { RoomDto, RoomUserDto, UpdateRoomDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async createRoom(body: RoomDto, idUser: string) {
    const newRoom = await this.prisma.room.create({
      data: {
        type: body.type,
        password:
          body.type === 'protected' ? await argon.hash(body.password) : null,
        name: body.name,
      },
    });
    const roomUser = await this.prisma.roomUser.create({
      data: {
        user_id: idUser,
        room_id: newRoom.id,
        owner: true,
        admin: true,
        ban: false,
        mute: null,
      },
    });
    return {
      newRoom,
      roomUser,
    };
  }

  async getAllUserRooms(idUser: string) {
    const getRooms = await this.prisma.room.findMany({
      where: {
        OR: [
          { OR: [{ type: 'protected' }, { type: 'public' }] },
          {
            RoomUser: {
              some: {
                user_id: idUser,
              },
            },
            type: 'private',
          },
        ],
      },
      select: {
        id: true,
        name: true,
        type: true,
        RoomUser: {
          select: {
            user: {
              select: {
                avatar: true,
              },
            },
          },
          where: {
            ban: false,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return getRooms;
  }

  async getOneRoom(room_id: string, user_id: string) {
    const room = await this.prisma.room.findUnique({
      where: {
        id: room_id,
      },
      select: {
        password: true,
        RoomUser: {
          where: {
            user_id,
            ban: false,
          },
        },
      },
    });
    if (!room) throw new HttpException('Room not found', 404);
    if (room.RoomUser.length === 0)
      throw new HttpException(
        {
          message: 'You are not in this room',
          password: !!room.password,
        },
        403,
      );
    return this.prisma.room.findUnique({
      where: {
        id: room_id,
      },
      select: {
        RoomUser: {
          select: {
            user: {
              select: {
                avatar: true,
              },
            },
            owner: true,
            admin: true,
            mute: true,
          },
          where: {
            ban: false,
          },
        },
        id: true,
        name: true,
        password: true,
        type: true,
      },
    });
  }

  async update(idRoom: string, idUser: string, body: UpdateRoomDto) {
    const updatedRooms = await this.prisma.room.updateMany({
      where: {
        id: idRoom,
        RoomUser: {
          some: {
            owner: true,
            user_id: idUser,
          },
        },
      },
      data: {
        type: body.type,
        password:
          body.type === 'protected' ? await argon.hash(body.password) : null,
      },
    });
    return updatedRooms;
  }

  async joinRoom(idRoom: string, idUser: string, password?: string) {
    const checkIfBanned = await this.prisma.roomUser.findFirst({
      where: {
        user_id: idUser,
        ban: true,
      },
    });
    if (checkIfBanned) throw new HttpException('User Banned', 403);
    const room = await this.prisma.room.findUnique({
      where: {
        id: idRoom,
      },
      select: {
        password: true,
      },
    });
    if (room.password) {
      if (!password) throw new HttpException('Password required', 403);
      const checkPassword = await argon.verify(room.password, password);
      if (!checkPassword) throw new HttpException('Wrong password', 403);
    }
    const roomUser = await this.prisma.roomUser.create({
      data: {
        user_id: idUser,
        room_id: idRoom,
        admin: false,
        ban: false,
        mute: null,
      },
    });
    return roomUser;
  }

  async kickUser(idRoom: string, idUser: string, idAdmin: string) {
    const isAdmin = await this.prisma.roomUser.findFirst({
      where: {
        room_id: idRoom,
        user_id: idAdmin,
        admin: true,
      },
    });
    if (!isAdmin)
      throw new HttpException(
        'User does not have the right to kick users',
        403,
      );
    const roomUser = await this.prisma.roomUser.deleteMany({
      where: {
        user_id: idUser,
        room_id: idRoom,
      },
    });
  }

  async updateUser(
    idRoom: string,
    idUser: string,
    body: RoomUserDto,
    idAdmin: string,
  ) {
    const isAdmin = await this.prisma.roomUser.findFirst({
      where: {
        room_id: idRoom,
        user_id: idAdmin,
        admin: true,
      },
    });
    if (!isAdmin)
      throw new HttpException(
        'User does not have the right to ban, mute or set as administrator users',
        403,
      );
    const roomUser = await this.prisma.roomUser.updateMany({
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
    return roomUser;
  }
}

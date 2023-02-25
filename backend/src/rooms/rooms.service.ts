import { HttpException, Injectable } from '@nestjs/common';
import { RoomDto, RoomUserDto, UpdateRoomDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async createRoom(body: RoomDto, req: any) {
    const newRoom = await this.prisma.room.create({
      data: {
        id_user_owner: req.user.id,
        type: body.type,
        password:
          body.type === 'protected' ? await argon.hash(body.password) : null,
        name: body.name,
      },
    });
    const roomUser = await this.prisma.roomUser.create({
      data: {
        user_id: newRoom.id_user_owner,
        room_id: newRoom.id,
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

  async getAllUserRooms(req: any) {
    const getRooms = await this.prisma.room.findMany({
      where: {
        OR: [
          { OR: [{ type: 'protected' }, { type: 'public' }] },
          {
            RoomUser: {
              some: {
                user_id: req.user.id,
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
        id_user_owner: true,
        type: true,
      },
    });
  }

  async update(idRoom: string, req: any, body: UpdateRoomDto) {
    const updatedRooms = await this.prisma.room.updateMany({
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
    return updatedRooms;
  }

  async deleteRoom(idRoom: string, req: any) {
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

  async joinRoom(idRoom: string, req: any, password?: string) {
    const checkIfBanned = await this.prisma.roomUser.findFirst({
      where: {
        user_id: req.user.id,
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
        user_id: req.user.id,
        room_id: idRoom,
        admin: false,
        ban: false,
        mute: null,
      },
    });
    return roomUser;
  }

  async kickUser(idRoom: string, idUser: string, req: any) {
    const isAdmin = await this.prisma.roomUser.findFirst({
      where: {
        room_id: idRoom,
        user_id: req.user.id,
        admin: true,
      },
    });
    if (!isAdmin) throw new HttpException('Unauthorized', 401);
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
    req: any,
  ) {
    const isAdmin = await this.prisma.roomUser.findFirst({
      where: {
        room_id: idRoom,
        user_id: req.user.id,
        admin: true,
      },
    });
    if (!isAdmin) throw new HttpException('Unauthorized', 401);
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

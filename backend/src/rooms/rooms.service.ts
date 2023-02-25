import { HttpException, Injectable } from '@nestjs/common';
import { RoomDto, RoomUserDto, UpdateRoomDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { RoomsGateway } from './rooms.gateway';

@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaService,
    private roomsGateway: RoomsGateway,
  ) {}

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
        name: true,
        id: true,
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

  async getOneRoom(idRoom: string) {
      const room = await this.prisma.room.findUnique({
        where: {
          id: idRoom,
        },
      });
      if (!room) throw 'Room not found';
      return room;
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
      const room = await this.prisma.room.findUnique({
        where: {
          id: idRoom,
        },
      });
      if (!room) throw new HttpException("Room not found", 404);
      if (req.user.id === room.id_user_owner) {
        const roomDeleted = await this.prisma.room.delete({
          where: {
            id: idRoom,
          },
        });
      } else new HttpException("User is not the owner to delete the room", 403) ;
  }

  async joinRoom(idRoom: string, req: any) {
    const checkIfBanned = await this.prisma.roomUser.findMany({
      where: {
        user_id: req.user.id,
        ban: true,
      },
    });
    if (checkIfBanned) throw new HttpException('User Banned', 403);
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
    if (!isAdmin) throw new HttpException('User does not have the right to kick users', 403);
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
    if (!isAdmin) throw new HttpException('User does not have the right to ban, mute or set as administrator users', 403);
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

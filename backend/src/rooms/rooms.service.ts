import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RoomDto, UpdateRoomDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async createRoom(body: RoomDto, req: any) {
    let hash = null;
    if (body.password) {
      hash = await argon.hash(body.password);
    }
    const new_room = await this.prisma.room.create({
      data: {
        type: body.type,
        id_user_owner: req.user.id,
        password: hash,
      },
    });
    const roomUser = await this.prisma.roomUser.create({
      data: {
        user_id: new_room.id_user_owner,
        room_id: new_room.id,
        admin: true,
        ban: false,
        mute: false,
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

  async updatePwd(idRoom: number, req: any, new_password: string) {
    try {
      const room = await this.prisma.room.findUnique({
        where: {
          id: idRoom,
        },
      });
      if (!room) throw 'Room not found';
      if (room.type === 'protected' && room.id_user_owner === req.user.id) {
        const hash = await argon.hash(new_password);
        const updateRoom = await this.prisma.room.update({
          where: {
            id: idRoom,
          },
          data: {
            password: hash,
          },
        });
      } else {
        throw 'Room not protected by password or user is not the owner';
      }
    } catch (e) {
      return e;
    }
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
        const roomUserdeleted = await this.prisma.roomUser.delete({
          where: {
            room_id: idRoom,
          },
        });
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

  async removePwd(idRoom: number) {
     try {
       const room = await this.prisma.room.findUnique({
         where: {
           id: idRoom,
         },
       });
       if (!room) throw 'Room not found';
       if (room.type === 'protected')
       {
         const updateRoom = await this.prisma.room.update({
           where: {
             id: idRoom,
           },
           data: {
             type: 'private',
             password: null
           },
         });
       }
       else throw "Room is not protected by a password"
     } catch (e) {
       return e;
     }
  }
}

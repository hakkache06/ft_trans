import {
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { verify } from 'jsonwebtoken';
import { Socket, Server } from 'socket.io';
import { MessagesService } from 'src/messages/messages.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomsService } from './rooms.service';
import { HttpException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly idUserToSocketIdMap: Map<string, Set<string>> = new Map();
  @WebSocketServer() server: Server;
  constructor(private prisma: PrismaService) {}

  @SubscribeMessage('postMessage')
  handleEvent(@MessageBody() payload: any, @ConnectedSocket() client: Socket) {
    this.server.to(payload.room).emit('postMessage', client.id, payload.data);
    const idUser = this.fetchUser(client.id);
    if (!idUser) return;
    const messages = this.prisma.message.create({
      data: {
        content: payload.data,
        from_id: idUser,
        room_id: payload.room,
      },
    });
  }

  fetchUser(idClient: string) {
    const idUser = [...this.idUserToSocketIdMap.keys()].find((id) => {
      console.log(id, idClient, this.idUserToSocketIdMap.get(id));
      return this.idUserToSocketIdMap.get(id).has(idClient);
    });
    return idUser;
  }

  verifyToken(token: string) {
    const { id } = verify(token, process.env.JWT_SECRET) as {
      id: string;
    };
    return id;
  }
  afterInit(server: Server) {}

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);

    const idUser = this.fetchUser(client.id);

    console.log(`User disconnected ${idUser}`);
    if (!idUser) return;

    this.idUserToSocketIdMap.get(idUser).delete(client.id);
    if (this.idUserToSocketIdMap.get(idUser).size === 0)
      this.idUserToSocketIdMap.delete(idUser);
    this.emitOnlineUsers();
  }

  emitOnlineUsers() {
    console.log('Emitting online users', [
      ...this.idUserToSocketIdMap.values(),
    ]);
    this.server.emit('users:online', [...this.idUserToSocketIdMap.keys()]);
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Connected ${client.id}`);
    try {
      const id = this.verifyToken(client.handshake.auth.token);
      console.log(`User connected ${id}`);
      const socket_ids = new Set<string>(
        this.idUserToSocketIdMap.get(id) || [],
      );
      socket_ids.add(client.id);
      this.idUserToSocketIdMap.set(id, socket_ids);
      this.emitOnlineUsers();
    } catch (err) {
      console.error('Invalid token', err);
      return client.disconnect();
    }
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody() payload: string,
    @ConnectedSocket() client: Socket,
  ) {
      const idUser = this.fetchUser(client.id);
      if (!idUser) throw new HttpException('User not found', 404);
      console.log(`User ${idUser} joined room : ${payload}`);
      client.join(payload);
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
      const idUser = this.fetchUser(client.id);
      if (!idUser) throw new HttpException('User not found', 404);
      console.log(`User ${idUser} left room : ${payload.room}`);
      client.leave(payload.room);
  }
}

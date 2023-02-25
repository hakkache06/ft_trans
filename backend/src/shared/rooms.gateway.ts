import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { verify } from 'jsonwebtoken';
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly idUserToSocketIdMap: Map<string, Set<string>> = new Map();
  @WebSocketServer() server: Server;
  constructor(private prisma: PrismaService) {}

  @SubscribeMessage('room:message:send')
  async handleEvent(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    if (!payload.content) return { done: false };
    const idUser = this.fetchUser(client.id);
    if (!idUser) return { done: false };
    //check access
    const message = await this.prisma.message.create({
      data: {
        content: payload.content,
        from_id: idUser,
        room_id: payload.room_id,
      },
      include: {
        user: {
          select: {
            avatar: true,
            name: true,
            id: true,
          },
        },
      },
    });
    this.server.to(message.room_id).emit('room:message:new', message);
    return {
      done: true,
    };
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

  handleConnection(client: Socket) {
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

  @SubscribeMessage('room:join')
  async joinRoom(
    @MessageBody() payload: string,
    @ConnectedSocket() client: Socket,
  ) {
    const idUser = this.fetchUser(client.id);
    console.log(`User ${idUser} joined room : ${payload}`);
    client.join(payload);
  }

  @SubscribeMessage('room:leave')
  async leaveRoom(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    const idUser = this.fetchUser(client.id);
    if (!idUser) return;
    console.log(`User ${idUser} left room : ${payload.room}`);
    client.leave(payload.room);
  }

  @SubscribeMessage('game:join')
  async joinGame(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    
  }

}

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


  @SubscribeMessage('message')
  handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    this.server.to('room1').emit('message', client.id, data);
  }


  afterInit(server: Server) {}

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);

    const idUser = [...this.idUserToSocketIdMap.keys()].find((id) => {
      console.log(id, client.id, this.idUserToSocketIdMap.get(id));
      return this.idUserToSocketIdMap.get(id).has(client.id);
    });

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
      const { id } = verify(
        client.handshake.auth.token,
        process.env.JWT_SECRET,
      ) as { id: string };
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

  async joinRoom(idUser: string, idRoom: string) {
    const socketInstance = await (async () => {
      const sockets = await this.server.fetchSockets();
      for (let socket of sockets)
        if (this.idUserToSocketIdMap[idUser].includes(socket.id))
          return this.idUserToSocketIdMap[idUser].find(socket.id);
    })();
    socketInstance.join(String(idRoom));
  }

  async leaveRoom(idUser: string, idRoom: string) {
    const socketInstance = await (async () => {
      const sockets = await this.server.fetchSockets();
      for (let socket of sockets)
        if (this.idUserToSocketIdMap[idUser].includes(socket.id))
          return this.idUserToSocketIdMap[idUser].find(socket.id);
    })();
    socketInstance.leave(String(idRoom));
  }

  async sendMsg(idUser: number, idRoom: string, content: string) {
    this.server.to(String(idRoom)).emit('sendMsg', {
      sender: idUser,
      room: idRoom,
      content,
    });
  }
}

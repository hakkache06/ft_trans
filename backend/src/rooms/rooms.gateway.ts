import { UseGuards } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';
import { JwtGuard } from 'src/auth/guards';
// import { AppService } from './app.service';
// import { Chat } from './chat.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly idUserToSocketIdMap: Map<string, string[]> = new Map();
  @WebSocketServer() server: Server;

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: any): Promise<void> {}

  afterInit(server: Server) {}

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);

    const idUser = Object.keys(this.idUserToSocketIdMap).find((id) =>
      this.idUserToSocketIdMap.get(id).includes(client.id),
    );

    this.idUserToSocketIdMap.set(
      idUser,
      this.idUserToSocketIdMap.get(idUser).filter((id) => id === client.id),
    );
    if (this.idUserToSocketIdMap.get(idUser).length === 0)
      this.idUserToSocketIdMap.delete(idUser)
      this.server.emit(
        'disconnectedUsers',
        Object.keys(this.idUserToSocketIdMap),
      );
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Connected ${client.id}`);
    const idUser = () => {
      const token: string = String(client.handshake.query.token);
      const decodedToken = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString(),
      );
      return decodedToken.id;
    };
    const socket_ids = this.idUserToSocketIdMap[String(idUser)] || [];
    this.idUserToSocketIdMap.set(String(idUser), [...socket_ids, client.id]);
    Object.keys(this.idUserToSocketIdMap);
    this.server.emit('connectedUsers', Object.keys(this.idUserToSocketIdMap));

    // let connected_ids: Array<> = []
    // for (let key in this.idUserToSocketIdMap)
    // {
    //   if (this.idUserToSocketIdMap[key].length() > 0)
    //     connected_ids.append()

    // }
    // const socketInstance = await(async () => {
    //   const sockets = await this.server.fetchSockets();
    //   for (let socket of sockets)
    //     if (this.idUserToSocketIdMap[idUser].includes(socket.id))
    //       return this.idUserToSocketIdMap[idUser].find(socket.id);
    // })();
  }

  async joinRoom(idUser: string, idRoom: number) {
    const socketInstance = await (async () => {
      const sockets = await this.server.fetchSockets();
      for (let socket of sockets)
        if (this.idUserToSocketIdMap[idUser].includes(socket.id))
          return this.idUserToSocketIdMap[idUser].find(socket.id);
    })();
    socketInstance.join(String(idRoom));
  }

  async leaveRoom(idUser: string, idRoom: number) {
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

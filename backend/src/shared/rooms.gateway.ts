import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { IsNotEmpty } from 'class-validator';
import { verify } from 'jsonwebtoken';
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

class CreateGameDto {
  @IsNotEmpty()
  background: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly idUserToSocketIdMap: Map<string, Set<string>> = new Map();
  private readonly games: Map<
    string,
    {
      background: string;
    }
  > = new Map();
  private players: Socket[] = [];

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

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
    if (this.games.has(client.id)) this.games.delete(client.id);

    const idUser = this.fetchUser(client.id);
    if (!idUser) return;

    this.idUserToSocketIdMap.get(idUser).delete(client.id);
    if (this.idUserToSocketIdMap.get(idUser).size === 0)
      this.idUserToSocketIdMap.delete(idUser);
    this.emitOnlineUsers();
  }

  emitOnlineUsers() {
    this.server.emit('users:online', [...this.idUserToSocketIdMap.keys()]);
  }

  emitGameQueue(socket_id?: string) {
    console.log('Emitting game queue', [...this.games.keys()]);
    (socket_id ? this.server.to(socket_id) : this.server).emit('game:queue', [
      ...this.games.keys(),
    ]);
  }

  handleConnection(client: Socket) {
    console.log(`Connected ${client.id}`);
    try {
      const { id, tfa_required } = verify(
        client.handshake.auth.token,
        process.env.JWT_SECRET,
      ) as {
        id: string;
        tfa_required: boolean;
      };
      if (tfa_required) throw new Error('TFA required');
      console.log(`User connected ${id}`);
      const socket_ids = new Set<string>(
        this.idUserToSocketIdMap.get(id) || [],
      );
      socket_ids.add(client.id);
      this.idUserToSocketIdMap.set(id, socket_ids);
      this.emitOnlineUsers();
      this.emitGameQueue(client.id);
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
    console.log(`User ${idUser} left room : ${payload}`);
    client.leave(payload);
  }

  @SubscribeMessage('game:create')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createGame(
    @MessageBody() payload: CreateGameDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Creating game', payload);
    this.games.set(client.id, payload);
    client.emit('game:created');
    this.emitGameQueue();
    return { done: true };
  }

  @SubscribeMessage('game:queue')
  async joinLobby(@ConnectedSocket() client: Socket) {
    if (this.games.size === 0) return { done: false };
    const [id, options] = this.games.entries().next().value;
    const player1_id = this.fetchUser(id);
    const player2_id = this.fetchUser(client.id);
    if (player1_id === player2_id) return { done: false };
    this.games.delete(id);
    this.emitGameQueue();
    const game = await this.prisma.game.create({
      data: {
        background: options.background,
        player1_id,
        player2_id,
      },
    });
    this.server.to(id).emit('game:matched', game.id);
    client.emit('game:matched', game.id);
    return { done: true };
  }

  @SubscribeMessage('game:cancel')
  async cancelGame(@ConnectedSocket() client: Socket) {
    if (this.games.has(client.id)) {
      this.games.delete(client.id);
      this.emitGameQueue();
    }
    return { done: true };
  }

  // @SubscribeMessage('game:queue')
  // async joinLobby(
  //   @MessageBody() payload: any,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   this.players.push(client);
  //   if (this.players.length >= 2) {
  //     // if (this.players.every((p) => p.connected)) {
  //     this.players[0].data.role = 'player';
  //     this.players[1].data.role = 'player';
  //     const user1 = this.fetchUser(this.players[0].id);
  //     const user2 = this.fetchUser(this.players[1].id);
  //     this.server.emit('matched', {
  //       player1: user1,
  //       player2: user2,
  //     });
  //     this.startGame();
  //     // } else {
  //     //   return 'User not connected';
  //     // }
  //   }
  // }

  @SubscribeMessage('game:invite')
  async inviteToGame(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    if (!payload.socket_id.connected) throw new Error('User not online');
    client.to(payload.socket_id).emit('game:requested');
  }

  @SubscribeMessage('game:accepted')
  async acceptGame(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) { 
    client.emit('game:queue');
    payload.emit('game:queue');
  }

  // async startGame() {
  //   const user1 = this.fetchUser(this.players[0].id);
  //   const user2 = this.fetchUser(this.players[1].id);
  //   const game_room = await this.prisma.game.create({
  //     data: {
  //       background: 'default',
  //       player1_id: user1,
  //       player2_id: user2,
  //     },
  //   });

  //   this.players[0].join(game_room.id);
  //   this.players[1].join(game_room.id);

  //   this.players.shift();
  //   this.players.shift();
  // }

  @SubscribeMessage('game:move')
  async move(
    @MessageBody() payload: { y: number; game: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (
      !client.rooms.has(payload.game) ||
      !(client.data.role == 'player1' || client.data.role == 'player2')
    )
      return;
    this.server
      .to(payload.game)
      .emit('game:moved', { player: client.data.role, y: payload.y });
  }

  @SubscribeMessage('game:ball')
  async ball(
    @MessageBody() payload: { x: number; y: number; game: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.rooms.has(payload.game) || client.data.role !== 'player1')
      return;
    this.server
      .to(payload.game)
      .emit('game:ball', { x: payload.x, y: payload.y });
  }

  @SubscribeMessage('game:score')
  async score(
    @MessageBody()
    payload: {
      game: string;
      player1: number;
      player2: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.rooms.has(payload.game) || client.data.role !== 'player1')
      return;
    if (payload.player1 >= 5 || payload.player2 >= 5) {
      this.server.to(payload.game).emit('game:over');
      return;
    }
    this.server.to(payload.game).emit('game:score', {
      player1: payload.player1,
      player2: payload.player2,
    });
    await this.prisma.game.update({
      where: { id: payload.game },
      data: {
        player1_score: payload.player1,
        player2_score: payload.player2,
      },
    });
  }

  @SubscribeMessage('game:join')
  async joinGame(
    @MessageBody() payload: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.fetchUser(client.id);
    const game = await this.prisma.game.findUnique({
      where: { id: payload },
    });
    if (game.player1_id === user || game.player2_id === user) {
      client.data.role = game.player1_id === user ? 'player1' : 'player2';
    } else {
      client.data.role = 'watcher';
    }
    console.log('join', payload, client.data.role);
    client.join(payload);
  }

  @SubscribeMessage('game:leave')
  async leaveGame(
    @MessageBody() payload: string,
    @ConnectedSocket() client: Socket,
  ) {
    // if (client.data.role === 'player1')
    client.leave(payload);
  }

  // async endGame(room_id: string) {
  //   const socketsInMyRoom = this.server.sockets.adapter.rooms[room_id];
  //   if (socketsInMyRoom) {
  //     socketsInMyRoom.forEach((socketId: Socket) => {
  //       socketId.leave(room_id);
  //     });
  //   }
  // }
}

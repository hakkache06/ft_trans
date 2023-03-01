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
import { GameState } from '@prisma/client';
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

  @WebSocketServer() server: Server;
  constructor(private prisma: PrismaService) {}

  emitOnlineUsers() {
    this.server.emit('users:online', [...this.idUserToSocketIdMap.keys()]);
  }

  emitGameQueue(socket_id?: string) {
    console.log('Emitting game queue', [...this.games.keys()]);
    (socket_id ? this.server.to(socket_id) : this.server).emit('game:queue', [
      ...this.games.keys(),
    ]);
  }

  fetchUser(idClient: string) {
    return [...this.idUserToSocketIdMap.keys()].find((id) =>
      this.idUserToSocketIdMap.get(id).has(idClient),
    );
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

  async handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
    if (this.games.has(client.id)) this.games.delete(client.id);

    const idUser = this.fetchUser(client.id);
    if (!idUser) return;

    this.idUserToSocketIdMap.get(idUser).delete(client.id);
    if (this.idUserToSocketIdMap.get(idUser).size === 0)
      this.idUserToSocketIdMap.delete(idUser);
    this.emitOnlineUsers();
    await this.verifyGames();
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
    // if (player1_id === player2_id) return { done: false };
    for (const id of this.games.keys()) {
      if (this.fetchUser(id) === player1_id) this.games.delete(id);
      if (this.fetchUser(id) === player2_id) this.games.delete(id);
    }
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

  // @SubscribeMessage('game:invite')
  // async inviteToGame(
  //   @MessageBody() payload: any,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   // if (this.players.every((p) => p.connected)) {
  //   this.players.push(client);
  //   this.players.push(payload.opponent);
  //   this.players[0].data.role = 'player';
  //   this.players[1].data.role = 'player';
  //   const user1 = this.fetchUser(this.players[0].id);
  //   const user2 = this.fetchUser(this.players[1].id);
  //   this.server.emit('matched', {
  //     player1: user1,
  //     player2: user2,
  //   });
  //   this.startGame();
  //   // }
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
    client
      .to(payload.game)
      .emit('game:move', { player: client.data.role, y: payload.y });
  }

  @SubscribeMessage('game:ball')
  async ball(
    @MessageBody() payload: { x: number; y: number; game: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.rooms.has(payload.game) || client.data.role !== 'player1')
      return;
    client.to(payload.game).emit('game:ball', { x: payload.x, y: payload.y });
  }

  async endGame(game_id: string) {
    this.server.to(game_id).emit('game:over');
    const clients = await this.server.in(game_id).fetchSockets();
    clients.forEach((client) => {
      client.data.role = undefined;
      client.data.game = undefined;
      client.leave(game_id);
    });
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
    if (payload.player1 >= 10 || payload.player2 >= 10) {
      this.endGame(payload.game);
      return;
    }
    client.to(payload.game).emit('game:score', {
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
    const game = await this.prisma.game.findUniqueOrThrow({
      where: { id: payload },
    });
    if (game.state === GameState.finished) return 'watcher';
    if (game.player1_id === user || game.player2_id === user) {
      let role = game.player1_id === user ? 'player1' : 'player2';
      const clients = await this.server.in(payload).fetchSockets();
      if (clients.find((c) => c.data.role === role)) role = 'watcher';
      client.data.role = role;
    } else {
      client.data.role = 'watcher';
    }
    client.data.game = payload;
    client.join(payload);
    return client.data.role;
  }

  @SubscribeMessage('game:leave')
  async leaveGame(
    @MessageBody() payload: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.data.role = undefined;
    client.data.game = undefined;
    await this.verifyGames();
    client.leave(payload);
  }

  async verifyGames() {
    const liveGames = await this.prisma.game.findMany({
      where: {
        state: GameState.live,
      },
    });
    for (const game of liveGames) {
      if (
        !this.isPlaying(game.player1_id, game.id) ||
        !this.isPlaying(game.player2_id, game.id)
      ) {
        console.log('Player disconnected. Ending game.', game.id);
        await this.prisma.game.update({
          where: {
            id: game.id,
          },
          data: {
            state: GameState.finished,
          },
        });
        this.server.to(game.id).emit('game:finished');
        this.server.socketsLeave(game.id);
      }
    }
  }

  isPlaying(user_id: string, game_id: string) {
    if (!this.idUserToSocketIdMap.has(user_id)) return false;
    for (const socketId of this.idUserToSocketIdMap.get(user_id)) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (
        ['player1', 'player2'].includes(socket.data.role) &&
        socket.data.game === game_id
      )
        return true;
    }
    return false;
  }
}

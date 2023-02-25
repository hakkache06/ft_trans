import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { RoomsModule } from './rooms/rooms.module';
import { RoomsUsersModule } from './rooms_users/rooms_users.module';
import { FriendsModule } from './friends/friends.module';
import { GamesModule } from './games/games.module';
import { MessagesModule } from './messages/messages.module';
import { TestController } from './test/test.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'files'),
      serveRoot: '/files',
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    RoomsModule,
    RoomsUsersModule,
    FriendsModule,
    GamesModule,
    MessagesModule,
    SharedModule,
  ],
  controllers: [TestController],
  providers: [],
})
export class AppModule {}

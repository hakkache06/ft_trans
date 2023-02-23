import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { RoomsModule } from './rooms/rooms.module';
import { RoomsUsersModule } from './rooms_users/rooms_users.module';
import { FriendsModule } from './friends/friends.module';
import { GammesModule } from './gammes/gammes.module';
import { MessagesModule } from './messages/messages.module';
import { TestController } from './test/test.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    RoomsModule,
    RoomsUsersModule,
    FriendsModule,
    GammesModule,
    MessagesModule,
  ],
  controllers: [TestController],
})
export class AppModule {}

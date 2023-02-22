import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { RoomsModule } from './rooms/rooms.module';
import { RoomsUsersModule } from './rooms_users/rooms_users.module';
import { FriendsModule } from './friends/friends.module';
import { GammesModule } from './gammes/gammes.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    RoomsModule,
    RoomsUsersModule,
    FriendsModule,
    GammesModule,
    MessagesModule,
  ],
})
export class AppModule {}

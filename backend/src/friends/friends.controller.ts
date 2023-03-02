import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards';
import { FriendsService } from './friends.service';
import { Request } from 'express';

@Controller('friends')
@UseGuards(JwtGuard)
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  // Get All friend from table
  @Get('')
  fetchAllFriends(@Req() req: Request) {
    return this.friendsService.fetchAllfriends(req.user.id);
  }
  //// id kayen
  // block
  // in table
  // id == from_id
  @Post(':id')
  async addFriends(
    @Param('id') idUser: string,
    @Body() b,
    @Req() req: Request,
  ) {
    return this.friendsService.addFrineds(idUser, req);
  }
  @Delete(':id')
  @UseGuards(JwtGuard)
  removeFriends(@Param('id') idUser: string, @Req() req: Request) {
    return this.friendsService.removeFriends(idUser, req);
  }

  @Post('/accept/:id')
  acceptFriends(@Param('id') idUser: string, @Req() req: Request) {
    return this.friendsService.acceptFriends(idUser, req);
  }
  // Accepte add Friend
}
// Cancel add friend
// block , unblock

//    res.status(HttpStatus.CREATED).send();

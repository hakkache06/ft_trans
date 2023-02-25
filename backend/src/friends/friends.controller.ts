import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  // Get All friend from table
  @Get('')
  fetchAllFriends(@Body() b) {
    return this.friendsService.fetchAllfriends(b);
  }
  //// id kayen
  // block
  // in table
  // id == from_id
  @Post(':id')
  @UseGuards(JwtGuard)
  async addFriends(
    @Param('id') idUser: string,
    @Body() b,
    @Req() req: Request,
  ) {
    return this.friendsService.addFrineds(idUser, req);
  }
  @Post('/delete/:id')
  @UseGuards(JwtGuard)
  removeFriends(@Param('id') idUser: string, @Req() req: Request) {
    return this.friendsService.removeFriends(idUser, req);
  }

  @Post('/accepteFriend/:id')
  @UseGuards(JwtGuard)
  acceptFriends(@Param('id') idUser: string, @Req() req: Request) {
    return this.friendsService.acceptFriends(req);
  }
  // get Friends()
  @Get('/getfriends')
  @UseGuards(JwtGuard)
  getFriends(@Req() req: Request) {
    return this.friendsService.getFriends(req);
  }
  // Accepte add Friend
}
// Cancel add friend
// block , unblock

//    res.status(HttpStatus.CREATED).send();

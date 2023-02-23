import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  // Get All friend from table
  @Get('')
  fetchAllFriends(@Body() b, @Res() res: Response) {
    return this.friendsService.fetchAllfriends(b, res);
  }
  //// id kayen
  // block
  // in table
  // id == from_id
  @Post(':id')
  addFriends(@Param('id') idUser: string, @Body() b, @Res() res: Response) {
    return this.friendsService.addFrineds(idUser, b, res);
  }
  @Post('')
  removeFriends() {
    return 'sd';
  }
}

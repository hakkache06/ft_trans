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
  fetchAllFriends(@Body() b, @Res() res: Response) {
    return this.friendsService.fetchAllfriends(b, res);
  }
  //// id kayen
  // block
  // in table
  // id == from_id
  @Post(':id')
  @UseGuards(JwtGuard)
  addFriends(
    @Param('id') idUser: string,
    @Body() b,
    @Res() res: Response,
    @Req() req,
  ) {
    return this.friendsService.addFrineds(idUser, b, res, req);
  }
  @Post('')
  removeFriends(@Param('id') idUser: string, @Body() b, @Res() res: Response) {
    return this.friendsService.removeFriends(idUser, b, res);
  }
}

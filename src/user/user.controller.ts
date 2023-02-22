import { Body, Controller, Get, Param, Patch, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  //fetch All_user
  @Get('profile')
  fetchAlluser(@Body() b, @Res() res: Response) {
    return this.userService.fetchAlluser(b, res);
  }
  @Get(':id')
  getOneUser(@Param('id') idUser: string, @Res() res: Response) {
    return this.userService.getOneUser(idUser, res);
  }

  @Patch(':id')
  updateUserbyId(@Param('id') idUser: string, @Body() b, @Res() res: Response) {
    return this.userService.updateUserbyId(idUser, b, res);
  }
}

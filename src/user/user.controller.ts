import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserService } from './user.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  //fetch All_user
  @Get('profile')
  fetchAlluser(@Body() b, @Res() res: Response) {
    return this.userService.fetchAlluser(b, res);
  }
  //fetchByid
  @Get(':id')
  getOneUser(@Param('id') idUser: string, @Res() res: Response) {
    return this.userService.getOneUser(idUser, res);
  }
  //updateUser by Id
  @Patch(':id')
  updateUserbyId(@Param('id') idUser: string, @Body() b, @Res() res: Response) {
    return this.userService.updateUserbyId(idUser, b, res);
  }
  //deleteUser By Id
  @Delete(':id')
  deleteUserbyId(@Param('id') idUser: string, @Res() res: Response) {
    return this.userService.deleteUserbyId(idUser, res);
  }
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './files',
        filename: (req, file, callback) => {
          const uniqu = Date.now() + '-' + Math.round(Math.random() * 1e9); //  <==> id user
          const ext = extname(file.originalname);
          const filename = `${uniqu}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return file;
  }
}

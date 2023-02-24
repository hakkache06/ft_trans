import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserService } from './user.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtGuard } from 'src/auth/guards';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  //fetch All_user
  @Get()
  @UseGuards(JwtGuard)
  fetchAlluser() {
    return this.userService.fetchAlluser();
  }
  @Get('profile')
  @UseGuards(JwtGuard)
  getProfile(@Req() req: Request) {
    return this.userService.getProfile(req.user.id);
  }
  //fetchByid
  @Get(':id')
  @UseGuards(JwtGuard)
  getOneUser(@Param('id') idUser: string) {
    return this.userService.getOneUser(idUser);
  }
  //updateUser by Id
  @Patch(':id')
  @UseGuards(JwtGuard)
  updateUserbyId(@Param('id') idUser: string, @Body() b) {
    return this.userService.updateUserbyId(idUser, b);
  }
  //deleteUser By Id
  @Delete(':id')
  @UseGuards(JwtGuard)
  deleteUserbyId(@Param('id') idUser: string) {
    return this.userService.deleteUserbyId(idUser);
  }
  @Post('upload')
  @UseGuards(JwtGuard)
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

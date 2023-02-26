import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserService } from './user.service';
import { diskStorage, MulterError } from 'multer';
import { extname } from 'path';
import { JwtGuard } from 'src/auth/guards';
import { UpdateUserDto } from './dto/update.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  //fetch All_user
  @Get()
  @UseGuards(JwtGuard)
  fetchAlluser(@Query('search') search: string) {
    return this.userService.fetchAlluser(search);
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
  @Patch('profile')
  @UseGuards(JwtGuard)
  updateUserbyId(@Req() req: Request, @Body() b: UpdateUserDto) {
    return this.userService.updateUserbyId(req.user.id, b);
  }
  @Post('upload')
  @UseGuards(JwtGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
          cb(null, true);
        else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
        }
      },
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
    return { url: process.env.FILES_URL + file.filename };
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  gethistoryMatch(@Req() req: Request) {
    return this.userService.gethistoryMatch(req);
  }
}

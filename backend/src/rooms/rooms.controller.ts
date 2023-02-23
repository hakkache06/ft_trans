import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards';
import { RoomDto, UpdateRoomDto } from './dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @UsePipes(new ValidationPipe())
  @Post('create-room')
  @UseGuards(JwtGuard)
  async createRoom(@Body() body: RoomDto, @Req() req: Request) {
    return this.roomsService.createRoom(body, req);
  }

  @Get('all-rooms')
  @UseGuards(JwtGuard)
  async fetchAllRoom() {
    return this.roomsService.fetchAllRoom();
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async getOneRoom(@Param('id', ParseIntPipe) idRoom: number) {
    return this.roomsService.getOneRoom(idRoom);
  }

  @UsePipes(new ValidationPipe())
  @Post('update-password/:id')
  @UseGuards(JwtGuard)
  async updatePwd(
    @Param('id', ParseIntPipe) idRoom: number,
    @Req() req: Request,
    @Body() body: UpdateRoomDto,
  ) {
    return this.roomsService.updatePwd(idRoom, req, body.password);
  }

  @Delete('delete-room/:id')
  @UseGuards(JwtGuard)
  async deleteRoom(
    @Param('id', ParseIntPipe) idRoom: number,
    @Req() req : Request,
  ) {
    return this.roomsService.deleteRoom(idRoom, req);
  }

    @Patch('remove-password/:id')
    @UseGuards(JwtGuard)
    async removePwd(@Param('id', ParseIntPipe) idRoom: number) {
      return this.roomsService.removePwd(idRoom);
    }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards';
import { RoomDto, RoomUserDto, UpdateRoomDto } from './dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @UsePipes(new ValidationPipe())
  @Post()
  @UseGuards(JwtGuard)
  async createRoom(@Body() body: RoomDto, @Req() req: Request) {
    return this.roomsService.createRoom(body, req);
  }

  @Get()
  @UseGuards(JwtGuard)
  async getAllUserRooms(@Req() req: Request) {
    return this.roomsService.getAllUserRooms(req);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async getOneRoom(@Param('id', ParseIntPipe) idRoom: number) {
    return this.roomsService.getOneRoom(idRoom);
  }

  @UsePipes(new ValidationPipe())
  @Put(':id')
  @UseGuards(JwtGuard)
  async update(
    @Param('id', ParseIntPipe) idRoom: number,
    @Req() req: Request,
    @Body() body: UpdateRoomDto,
  ) {
    return this.roomsService.update(idRoom, req, body);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async deleteRoom(
    @Param('id', ParseIntPipe) idRoom: number,
    @Req() req: Request,
  ) {
    return this.roomsService.deleteRoom(idRoom, req);
  }

  @Post(':id/users')
  @UseGuards(JwtGuard)
  async joinRoom(
    @Param('id', ParseIntPipe) idRoom: number,
    @Req() req: Request,
  ) {
    return this.roomsService.joinRoom(idRoom, req);
  }

  @Delete(':id/users/:user_id')
  @UseGuards(JwtGuard)
  async kickUser(
    @Param('id', ParseIntPipe) idRoom: number,
    @Param('user_id') idUser: string,
    @Req() req: Request,
  ) {
    return this.roomsService.kickUser(idRoom, idUser, req);
  }

  @UsePipes(new ValidationPipe())
  @Put(':id/users/:user_id')
  @UseGuards(JwtGuard)
  async updateUser(
    @Param('id', ParseIntPipe) idRoom: number,
    @Param('user_id') idUser: string,
    @Body() body: RoomUserDto,
    @Req() req: Request,
  ) {
    return this.roomsService.updateUser(idRoom, idUser, body, req);
  }
}

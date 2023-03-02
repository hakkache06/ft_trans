import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards';
import { RoomDto, RoomUserDto, RoomWithPwd, UpdateRoomDto } from './dto';
import { RoomsService } from './rooms.service';
import { Request } from 'express';

@Controller('rooms')
@UseGuards(JwtGuard)
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Post('dm/:user_id')
  async dmUser(@Param('user_id') idUser: string, @Req() req: Request) {
    return this.roomsService.dmUser(idUser, req.user.id);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  async createRoom(@Body() body: RoomDto, @Req() req: Request) {
    return this.roomsService.createRoom(body, req.user.id);
  }

  @Get()
  async getAllUserRooms(@Req() req: Request) {
    return this.roomsService.getAllUserRooms(req.user.id);
  }

  @Get(':id')
  async getOneRoom(@Param('id') idRoom: string, @Req() req: Request) {
    return this.roomsService.getOneRoom(idRoom, req.user.id);
  }

  @UsePipes(new ValidationPipe())
  @Put(':id')
  async update(
    @Param('id') idRoom: string,
    @Req() req: Request,
    @Body() body: UpdateRoomDto,
  ) {
    await this.roomsService.verifyOwner(idRoom, req.user.id);
    await this.roomsService.update(idRoom, req.user.id, body);
  }

  @Post(':id/users')
  async joinRoom(
    @Param('id') idRoom: string,
    @Req() req: Request,
    @Body() body: RoomWithPwd,
  ) {
    await this.roomsService.joinRoom(idRoom, req.user.id, body?.password);
  }

  @Post(':id/users/:user_id')
  async addToRoom(
    @Param('id') idRoom: string,
    @Param('user_id') idUser: string,
    @Req() req: Request,
  ) {
    await this.roomsService.verifyAdmin(idRoom, req.user.id);
    await this.roomsService.addToRoom(idRoom, idUser);
  }

  @Delete(':id/users/:user_id')
  async kickUser(
    @Param('id') idRoom: string,
    @Param('user_id') idUser: string,
    @Req() req: Request,
  ) {
    await this.roomsService.verifyAdmin(idRoom, req.user.id);
    await this.roomsService.leaveRoom(idRoom, idUser);
  }

  @Delete(':id/users')
  async leaveRoom(@Param('id') idRoom: string, @Req() req: Request) {
    await this.roomsService.leaveRoom(idRoom, req.user.id);
  }

  @UsePipes(new ValidationPipe())
  @Patch(':id/users/:user_id')
  async updateUser(
    @Param('id') idRoom: string,
    @Param('user_id') idUser: string,
    @Body() body: RoomUserDto,
    @Req() req: Request,
  ) {
    this.roomsService.verifyAdmin(idRoom, req.user.id);
    if (body.admin !== undefined)
      await this.roomsService.verifyOwner(idRoom, req.user.id);
    return this.roomsService.updateUser(idRoom, idUser, body);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtGuard } from 'src/auth/guards';
import { MessageDto } from './dto';

@Controller('messages')
export class MessagesController {
  constructor(private messageService: MessagesService) {}

  @UsePipes(new ValidationPipe())
  @Post()
  @UseGuards(JwtGuard)
  async postMessage(@Req() req: Request, @Body() body: MessageDto) {
    return this.messageService.postMessage(req, body);
  }

  @Get(':room_id')
  @UseGuards(JwtGuard)
  async findMsgByRoomId(@Param('room_id') idRoom: string) {
    return this.messageService.findMsgByRoomId(idRoom);
  }
}

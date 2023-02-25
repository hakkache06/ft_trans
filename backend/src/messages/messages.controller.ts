import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtGuard } from 'src/auth/guards';

@Controller('messages')
export class MessagesController {
  constructor(private messageService: MessagesService) {}

  @Get(':room_id')
  @UseGuards(JwtGuard)
  async findMsgByRoomId(@Param('room_id') idRoom: string) {
    return this.messageService.findMsgByRoomId(idRoom);
  }
}

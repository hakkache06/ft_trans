import { IsNotEmpty } from 'class-validator';

export class MessageDto {
  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  room_id: string;
}

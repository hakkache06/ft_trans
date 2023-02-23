import { IsNotEmpty, Min } from 'class-validator';

export class UpdateRoomDto {
  @IsNotEmpty()
  password: string;
}

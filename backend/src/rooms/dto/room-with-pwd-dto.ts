import { IsOptional, IsString } from 'class-validator';

export class RoomWithPwd {
  @IsOptional()
  @IsString()
  password?: string;
}

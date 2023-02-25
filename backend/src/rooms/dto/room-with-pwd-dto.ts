import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RoomWithPwd {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;
}

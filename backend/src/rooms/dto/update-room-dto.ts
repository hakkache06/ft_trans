import { RoomType } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class UpdateRoomDto {
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @IsNotEmpty()
  @IsOptional()
  @IsEnum(RoomType)
  type: RoomType;

  @IsNotEmpty()
  @IsOptional()
  password: string;
}

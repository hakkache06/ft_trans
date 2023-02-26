import { RoomType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class RoomDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEnum(RoomType)
  type: RoomType;

  @IsOptional()
  password: string;
}

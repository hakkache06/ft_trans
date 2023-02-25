import { RoomType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RoomDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEnum(RoomType)
  type: RoomType;

  @IsString()
  @IsOptional()
  password: string;
}

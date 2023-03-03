import { RoomType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

export class RoomDto {
  @Length(3, 20, {
    message: 'Name of the room must be between 3 and 20 characters',
  })
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEnum(RoomType)
  type: RoomType;

  @ValidateIf((e) => e.type === 'protected')
  @IsOptional()
  @IsString()
  @Length(8, 20, {
    message: 'Password must be between 8 and 20 characters',
  })
  password: string;
}

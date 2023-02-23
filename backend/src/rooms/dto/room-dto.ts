import { IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class RoomDto {
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  password: string;
}

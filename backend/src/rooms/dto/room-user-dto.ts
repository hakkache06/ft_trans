import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class RoomUserDto {
  @IsOptional()
  @IsBoolean()
  admin: boolean;

  @IsOptional()
  @IsBoolean()
  ban: boolean;

  @IsOptional()
  @Type(() => Date)
  mute: Date;
}

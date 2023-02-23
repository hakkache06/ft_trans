import { IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class UpdateRoomDto {
  @IsNotEmpty()
  @IsOptional()
  @IsIn(["public", "private", "protected"])
  type: string;

  @IsNotEmpty()
  @IsOptional()
  password: string;
}

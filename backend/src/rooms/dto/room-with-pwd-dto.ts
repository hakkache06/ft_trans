import { IsOptional, IsString, Length } from 'class-validator';

export class RoomWithPwd {
  @IsOptional()
  @IsString()
  @Length(8, 20, {
    message: 'Password must be between 8 and 20 characters',
  })
  password?: string;
}

import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsUrl({
    require_tld: false,
  })
  avatar: string;
}

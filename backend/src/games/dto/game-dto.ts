import { IsNotEmpty } from 'class-validator';

export class gameDto {
  @IsNotEmpty()
  background: string;

  @IsNotEmpty()
  player1_id: string;

  @IsNotEmpty()
  player2_id: string;

  @IsNotEmpty()
  player1_score: number;

  @IsNotEmpty()
  player2_score: number;
}

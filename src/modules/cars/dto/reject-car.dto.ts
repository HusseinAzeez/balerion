import { IsNotEmpty } from 'class-validator';

export class RejectCarDto {
  @IsNotEmpty()
  reason: string;
}

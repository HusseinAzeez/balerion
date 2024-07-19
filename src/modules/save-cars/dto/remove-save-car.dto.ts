import { IsNumber } from 'class-validator';

export class RemoveSaveCarDto {
  @IsNumber()
  carId: number;
}

import { IsNumber } from 'class-validator';

export class CreateSaveCarDto {
  @IsNumber()
  carId: number;
}

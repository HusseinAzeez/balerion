import { IsNotEmpty } from 'class-validator';

export class QueryMonthlyInstallmentDto {
  @IsNotEmpty()
  downPayment: number;
}

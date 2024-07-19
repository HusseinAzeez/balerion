import { IsNotEmpty } from 'class-validator';

export class ApplyLoanInformation {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  url: string;

  @IsNotEmpty()
  phoneNumber: string;
}

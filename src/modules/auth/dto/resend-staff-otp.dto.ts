import { IsNotEmpty } from 'class-validator';

export class ResendStaffOTPDto {
  @IsNotEmpty()
  email: string;
}

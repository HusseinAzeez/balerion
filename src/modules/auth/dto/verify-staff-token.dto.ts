import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyStaffOtpDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  otp: string;

  @IsNotEmpty()
  @IsString()
  otpRefNo: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyUserOtpDto {
  @IsNotEmpty()
  @IsString()
  otp: string;
}

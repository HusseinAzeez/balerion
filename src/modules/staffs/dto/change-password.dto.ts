import { IsNotEmpty } from 'class-validator';

export class StaffChangePasswordDto {
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  newPassword: string;

  @IsNotEmpty()
  confirmNewPassword: string;
}

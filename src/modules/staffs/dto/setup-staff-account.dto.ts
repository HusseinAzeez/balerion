import { IsNotEmpty, IsOptional } from 'class-validator';

export class SetupStaffDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  inviteToken?: string;

  @IsOptional()
  verifiedToken?: string;
}

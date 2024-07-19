import { IsOptional } from 'class-validator';

export class FindByTokenDto {
  @IsOptional()
  resetPasswordToken?: string;

  @IsOptional()
  inviteToken?: string;

  @IsOptional()
  verifiedToken?: string;
}

import { UserRole } from '@/common/enums/user.enum';
import { IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class InviteUserObject {
  @IsNotEmpty()
  email: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
export class InviteUserDto {
  @IsArray()
  users?: InviteUserObject[];
}

export class ResendInviteDto {
  @IsArray()
  @IsNotEmpty()
  ids: number[];
}

import { StaffRole } from '@/common/enums/staff.eum';
import { IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class InviteStaffObject {
  @IsNotEmpty()
  email: string;

  @IsEnum(StaffRole)
  @IsNotEmpty()
  role: StaffRole;
}
export class InviteStaffDto {
  @IsArray()
  staffs?: InviteStaffObject[];
}

export class ResendInviteStaffDto {
  @IsArray()
  @IsNotEmpty()
  ids: number[];
}

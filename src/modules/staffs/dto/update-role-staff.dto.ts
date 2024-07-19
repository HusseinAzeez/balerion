import { StaffRole } from '@/common/enums/staff.eum';
import { IsEnum } from 'class-validator';

export class UpdateRoleStaffDto {
  @IsEnum(StaffRole)
  role: StaffRole = StaffRole.SUPER_ADMIN;
}

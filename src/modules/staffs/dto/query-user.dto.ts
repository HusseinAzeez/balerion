import { PaginateDto } from '@/modules/paginations/dto/paginate.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';
import { StaffRole, StaffStatus } from '@/common/enums/staff.eum';

export class QueryStaffDto extends PaginateDto {
  @ApiProperty({
    description: 'Search by email, first name, last name',
  })
  search?: string;

  @ApiProperty({
    description: 'Filter staffs by status',
    example: Object.values(StaffStatus),
  })
  @IsArray()
  @IsOptional()
  status?: StaffStatus[];

  @ApiProperty({
    description: 'ex. staff.id, staff.createdAt, staff.verifiedAt, fullName',
  })
  sortBy?: string = 'staff.id';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'DESC';

  @ApiProperty({
    description: 'Filter staff by role',
    example: Object.values(StaffRole),
  })
  @IsOptional()
  role?: StaffRole = StaffRole.SUPER_ADMIN;
}

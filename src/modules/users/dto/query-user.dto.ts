import { PaginateDto } from '@/modules/paginations/dto/paginate.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus, UserRole } from '@/common/enums/user.enum';
import { IsArray, IsOptional } from 'class-validator';

export class QueryUserDto extends PaginateDto {
  @ApiProperty({
    description: 'Search by email, first name, last name',
  })
  search?: string;

  @ApiProperty({
    description: 'Search by province',
  })
  searchByProvince?: string;

  @ApiProperty({
    description: 'Filter users by status',
    example: Object.values(UserStatus),
  })
  @IsArray()
  @IsOptional()
  status?: UserStatus[];

  @ApiProperty({
    description: 'ex. user.id, user.createdAt, user.verifiedAt, fullName',
  })
  sortBy?: string = 'user.id';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'DESC';

  @ApiProperty({
    description: 'Filter users by role',
    example: Object.values(UserRole),
  })
  @IsOptional()
  role?: UserRole = UserRole.PRIVATE;
}

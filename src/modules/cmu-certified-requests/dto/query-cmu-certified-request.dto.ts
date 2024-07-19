import { UserRole } from '@/common/enums/user.enum';
import { PaginateDto } from '@/modules/paginations/dto/paginate.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export class QueryCmuCertifiedRequest extends PaginateDto {
  @Transform((params) => (params.value === '' ? null : params.value))
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole | null;

  @ApiProperty({
    description:
      'Search by car.id, user.firstName, car.brandName, car.modelName, car.subModelName, car.bodyTypeName',
  })
  @IsOptional()
  search?: string;

  sortBy?: string = 'cmuCertifiedRequest.id';

  sortDirection?: string = 'DESC';
}

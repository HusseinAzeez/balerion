import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional } from 'class-validator';

import { PaginateDto } from '@/modules/paginations/dto/paginate.dto';
import { CarStatus } from '@/common/enums/car.enum';
import { UserRole } from '@/common/enums/user.enum';
import { AttachmentType } from '@/common/enums/attachment.enum';

export class QueryCarByStaffDto extends PaginateDto {
  @ApiProperty({
    description: 'Search by uid, brand name, model name, year, etc',
  })
  search?: string;

  @ApiProperty({
    description: 'Filter cars by brands',
  })
  @IsArray()
  @IsOptional()
  brands?: string[];

  @ApiProperty({
    description: 'Filter cars by models',
  })
  @IsArray()
  @IsOptional()
  models?: string[];

  @ApiProperty({
    description: 'Filter cars by sub models',
  })
  @IsArray()
  @IsOptional()
  subModels?: string[];

  @ApiProperty({
    description: 'Filter cars by status',
    example: Object.values(CarStatus),
  })
  @IsArray()
  @IsOptional()
  status?: CarStatus[];

  @ApiProperty({
    description: 'Filter cars by user roles',
    example: Object.values(UserRole),
  })
  @IsArray()
  @IsOptional()
  userRoles?: UserRole[];

  @ApiProperty({
    description: 'Filter cars social media flag',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  postOnSocialMedia?: boolean = false;

  @ApiProperty({
    description: 'Filter cars by a province',
  })
  province?: string;

  @ApiProperty({
    description: 'Filter cars by a district',
  })
  district?: string;

  @ApiProperty({
    description: 'Filter attachments by types',
    example: Object.values(AttachmentType),
  })
  @IsArray()
  @IsOptional()
  attachmentTypes?: AttachmentType[];

  @ApiProperty({
    description:
      'ex. car.brandName, car.modelName, car.subModelName, car.price, car.createdAt',
  })
  sortBy?: string = 'car.uid';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'DESC';
}

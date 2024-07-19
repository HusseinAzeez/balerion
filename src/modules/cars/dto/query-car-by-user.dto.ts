import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsOptional } from 'class-validator';

import { PaginateDto } from '@/modules/paginations/dto/paginate.dto';
import { CarStatus } from '@/common/enums/car.enum';
import { Transform } from 'class-transformer';

export class QueryCarByUserDto extends PaginateDto {
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
  @IsEnum(CarStatus, { each: true })
  @IsOptional()
  status?: CarStatus[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isHotDealed?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isCarsmeupCertified?: boolean;

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

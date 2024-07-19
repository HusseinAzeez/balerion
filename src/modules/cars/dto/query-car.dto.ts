import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional } from 'class-validator';

import { PaginateDto } from '@/modules/paginations/dto/paginate.dto';
import { CarType } from '@/common/enums/car.enum';

export class QueryCarDto extends PaginateDto {
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
    description: 'Filter cars by body types',
  })
  @IsArray()
  @IsOptional()
  bodyTypes?: string[];

  @ApiProperty({
    description: 'Filter cars by lifestyles',
  })
  @IsArray()
  @IsOptional()
  lifestyles?: string[];

  @ApiProperty({
    description: 'Filter cars by fuel types',
  })
  @IsArray()
  @IsOptional()
  fuelTypes?: string[];

  @ApiProperty({
    description: 'Filter cars by transmissions',
  })
  @IsArray()
  @IsOptional()
  transmissions?: string[];

  @ApiProperty({
    description: 'Filter cars by colors',
  })
  @IsArray()
  @IsOptional()
  colors?: string[];

  @ApiProperty({
    description: 'Filter cars by a milage range',
  })
  startMileage?: string;

  @ApiProperty({
    description: 'Filter cars by a milage range',
  })
  endMileage?: string;

  @ApiProperty({
    description: 'Filter cars by a price range',
  })
  startPrice?: string;

  @ApiProperty({
    description: 'Filter cars by a price range',
  })
  endPrice?: string;

  @ApiProperty({
    description: 'Flag to include the VAT with the price range',
  })
  @Transform(({ value }) => value === 'true' || value === true)
  vatIncluded?: boolean = false;

  @ApiProperty({
    description: 'Filter cars by a monthly installment range',
  })
  startMonthlyInstallment?: string;

  @ApiProperty({
    description: 'Filter cars by a monthly installment range',
  })
  endMonthlyInstallment?: string;

  @ApiProperty({
    description: 'Filter cars by a manufactured year',
  })
  startManufacturedYear?: string;

  @ApiProperty({
    description: 'Filter cars by a manufactured year',
  })
  endManufacturedYear?: string;

  @ApiProperty({
    description: 'Filter cars by a province',
  })
  province?: string;

  @ApiProperty({
    description: 'Filter cars by a district',
  })
  district?: string;

  @ApiProperty({
    description: 'Filter cars by video availability',
  })
  @Transform(({ value }) => value === 'true' || value === true)
  withVideo?: boolean = false;

  @ApiProperty({ description: 'Filter cars by type' })
  @IsEnum(CarType)
  @IsOptional()
  carType?: CarType;

  @ApiProperty({
    description:
      'ex. car.id, car.uid, car.status, car.uid, car.brandName, car.bumpedAt (popular)',
    default: 'car.bumpedAt',
  })
  sortBy?: string = 'car.bumpedAt';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'DESC';
}

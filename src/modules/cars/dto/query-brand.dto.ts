import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryBrandDto {
  @ApiProperty({
    description: 'Return brands with their models',
  })
  @Transform(({ value }) => value === 'true' || value === true)
  withModels?: false;

  @ApiProperty({
    description: 'ex. brand.name',
  })
  sortBy?: string = 'brand.name';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'ASC';
}

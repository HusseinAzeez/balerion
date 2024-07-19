import { ApiProperty } from '@nestjs/swagger';

export class QueryFuelTypeDto {
  @ApiProperty({
    description: 'Filter fuel types by sub model name',
  })
  subModelName?: string;

  @ApiProperty({
    description: 'ex. fuelType.name',
  })
  sortBy?: string = 'fuelType.name';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'ASC';
}

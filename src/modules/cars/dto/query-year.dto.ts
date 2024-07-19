import { ApiProperty } from '@nestjs/swagger';

export class QueryYearDto {
  @ApiProperty({
    description: 'ex. year.name',
  })
  sortBy?: string = 'year.name';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'ASC';
}

import { ApiProperty } from '@nestjs/swagger';

export class QueryBodyTypeDto {
  @ApiProperty({
    description: 'Filter fuel types by sub model name',
  })
  subModelName?: string;

  @ApiProperty({
    description: 'ex. bodyType.name',
  })
  sortBy?: string = 'bodyType.name';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'ASC';
}

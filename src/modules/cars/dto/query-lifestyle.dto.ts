import { ApiProperty } from '@nestjs/swagger';

export class QueryLifestyleDto {
  @ApiProperty({
    description: 'Filter lifestyles by model name',
  })
  modelName?: string;

  @ApiProperty({
    description: 'ex. lifestyle.name',
  })
  sortBy?: string = 'lifestyle.name';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'ASC';
}

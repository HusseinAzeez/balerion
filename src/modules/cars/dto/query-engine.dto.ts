import { ApiProperty } from '@nestjs/swagger';

export class QueryEngineDto {
  @ApiProperty({
    description: 'Filter engines by sub model name',
  })
  subModelName?: string;

  @ApiProperty({
    description: 'ex. engine.name',
  })
  sortBy?: string = 'engine.name';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'ASC';
}

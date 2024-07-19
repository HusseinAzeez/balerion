import { ApiProperty } from '@nestjs/swagger';

export class QueryTransmissionDto {
  @ApiProperty({
    description: 'ex. transmission.name',
  })
  sortBy?: string = 'transmission.name';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'ASC';
}

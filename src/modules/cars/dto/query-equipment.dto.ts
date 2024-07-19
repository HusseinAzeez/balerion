import { ApiProperty } from '@nestjs/swagger';

export class QueryEquipmentDto {
  @ApiProperty({
    description: 'Search by equipment name',
  })
  search?: string;

  @ApiProperty({
    description: 'ex. equipment.name',
  })
  sortBy?: string = 'equipment.name';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'ASC';
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class QueryModelDto {
  @ApiProperty({
    description: 'Filter models by brand name',
  })
  @IsNotEmpty()
  brandName: string;

  @ApiProperty({
    description: 'ex. model.name',
  })
  sortBy?: string = 'model.name';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'ASC';
}

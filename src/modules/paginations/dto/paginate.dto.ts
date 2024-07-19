import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PaginateDto {
  @ApiProperty({
    description: 'Default 20',
    required: false,
  })
  limitPerPage?: number = 20;

  @ApiProperty({
    description: 'Default 1',
    required: false,
  })
  page?: number = 1;

  @ApiProperty({
    description: 'Default false. Send true to return all data',
    required: false,
  })
  @Transform(({ value }) => value === 'true' || value === true)
  all?: boolean = false;
}

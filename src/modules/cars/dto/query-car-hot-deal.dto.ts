import { ApiProperty } from '@nestjs/swagger';
import { PaginateDto } from '@/modules/paginations/dto/paginate.dto';

export class QueryCarHotDealDto extends PaginateDto {
  @ApiProperty({ description: 'ex. car.hotDealedAt' })
  sortBy?: string = 'car.hotDealedAt';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'DESC';
}

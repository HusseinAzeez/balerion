import { BannerStatus, BannerType } from './../../../common/enums/banner.enum';
import { PaginateDto } from '@/modules/paginations/dto/paginate.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class QueryBannerDto extends PaginateDto {
  @IsArray()
  @ApiProperty({
    description: 'Filter banner status',
    example: Object.values(BannerStatus),
  })
  @IsOptional()
  status?: BannerStatus[];

  @ApiProperty({
    description: 'banner.createdAt, banner.scheduleAt banner.status',
  })
  sortBy?: string = 'banner.createdAt';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'DESC';

  @ApiProperty({
    description: 'Filter banner type',
    example: Object.values(BannerType),
  })
  bannerType?: BannerType;
}

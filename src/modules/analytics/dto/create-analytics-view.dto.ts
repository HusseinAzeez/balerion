import { IsArray, IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import { AnalyticsViewType } from '@/common/enums/analytics.enum';

export class CreateAnalyticsViewDto {
  @IsNotEmpty()
  uid: string;

  @IsEnum(AnalyticsViewType)
  viewType: AnalyticsViewType = AnalyticsViewType.CAR;

  @ValidateIf((o) => o.clickType === AnalyticsViewType.CAR)
  @IsArray()
  carIds?: number[];

  @ValidateIf((o) => o.clickType === AnalyticsViewType.BANNER)
  @IsArray()
  bannerIds?: number[];
}

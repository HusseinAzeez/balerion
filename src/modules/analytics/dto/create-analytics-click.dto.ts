import { IsArray, IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import { AnalyticsClickType } from '@/common/enums/analytics.enum';

export class CreateAnalyticsClickDto {
  @IsNotEmpty()
  uid: string;

  @IsEnum(AnalyticsClickType)
  clickType: AnalyticsClickType = AnalyticsClickType.CAR;

  @ValidateIf((o) => o.clickType === AnalyticsClickType.CAR)
  @IsArray()
  carIds: number[];

  @ValidateIf((o) => o.clickType === AnalyticsClickType.BANNER)
  @IsArray()
  bannerIds: number[];
}

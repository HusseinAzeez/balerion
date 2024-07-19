import { IsArray, IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import { AnalyticsImpressionType } from '@/common/enums/analytics.enum';

export class CreateAnalyticsImpressionDto {
  @IsNotEmpty()
  uid: string;

  @IsEnum(AnalyticsImpressionType)
  impressionType: AnalyticsImpressionType = AnalyticsImpressionType.CAR;

  @ValidateIf((o) => o.clickType === AnalyticsImpressionType.CAR)
  @IsArray()
  carIds?: number[];

  @ValidateIf((o) => o.clickType === AnalyticsImpressionType.BANNER)
  @IsArray()
  bannerIds?: number[];
}

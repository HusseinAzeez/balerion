import { BannerStatus, BannerType } from './../../../common/enums/banner.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class QueryPublishedBannerDto {
  @IsNotEmpty()
  @IsEnum(BannerType)
  bannerType: BannerType = BannerType.HERO_BANNER;
}

import { BannerStatus, BannerType } from '@/common/enums/banner.enum';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBannerDto {
  @IsOptional()
  name: string;

  @IsOptional()
  clientName: string;

  @IsOptional()
  url: string;

  @IsOptional()
  @IsDateString()
  scheduleAt: Date;

  @IsNotEmpty()
  @IsEnum(BannerStatus)
  status: BannerStatus = BannerStatus.DRAFT;

  @IsNotEmpty()
  @IsEnum(BannerType)
  bannerType: BannerType = BannerType.HERO_BANNER;
}

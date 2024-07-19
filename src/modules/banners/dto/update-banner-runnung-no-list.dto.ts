import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';

export class UpdateBannerRunningNoList {
  @IsArray()
  @ValidateNested()
  @Type(() => BannerDto)
  banners?: BannerDto[];
}

class BannerDto {
  id?: number;

  @IsNumber()
  runningNo: number;
}

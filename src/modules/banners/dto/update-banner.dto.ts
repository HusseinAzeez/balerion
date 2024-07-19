import { IsDateString, IsOptional } from 'class-validator';

export class UpdateBannerDto {
  @IsOptional()
  name: string;

  @IsOptional()
  clientName: string;

  @IsOptional()
  url: string;

  @IsOptional()
  @IsDateString()
  scheduleAt: Date;
}

import { CarSoldOnPlatform } from '@/common/enums/car.enum';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class SellCarDto {
  @IsEnum(CarSoldOnPlatform)
  soldOn: CarSoldOnPlatform;

  @IsString()
  @IsOptional()
  soldOnOther?: string;
}

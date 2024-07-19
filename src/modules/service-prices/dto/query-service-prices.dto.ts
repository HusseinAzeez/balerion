import { ServicePriceType } from '@/common/enums/service-price.enum';
import { UserRole } from '@/common/enums/user.enum';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class QueryServicePriceDto {
  @Transform((params) => (params.value === '' ? null : params.value))
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole | null;

  @IsNotEmpty()
  @IsEnum(ServicePriceType)
  serviceType: ServicePriceType = ServicePriceType.ROADSIDE_ASSIST;
}

import { ProductPriceType } from '@/common/enums/product-price.enum';
import { UserRole } from '@/common/enums/user.enum';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class QueryProductPriceDto {
  @Transform((params) => (params.value === '' ? null : params.value))
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole | null;

  @IsNotEmpty()
  @IsEnum(ProductPriceType)
  productType: ProductPriceType = ProductPriceType.HOT_DEAL;
}

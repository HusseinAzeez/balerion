import { ProductPriceType } from '@/common/enums/product-price.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class AddProductBalanceDto {
  @IsNotEmpty()
  amount: number;

  @IsEnum(ProductPriceType)
  productType: ProductPriceType;
}

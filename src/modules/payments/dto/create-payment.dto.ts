import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import {
  PaymentItemType,
  PaymentMethodType,
} from '@/common/enums/payment.enum';

class PaymentItemDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  quantity: number;

  @IsEnum(PaymentItemType)
  paymentItemType: PaymentItemType;
}

export class CreatePaymentDto {
  paymentMethodId?: string;

  @IsEnum(PaymentMethodType)
  @IsOptional()
  paymentMethodType?: PaymentMethodType = PaymentMethodType.CARD;

  @Transform(({ value }) => value === 'true' || value === true)
  rememberCard?: false;

  @ValidateNested()
  @Type(() => PaymentItemDto)
  paymentItems: PaymentItemDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

import { VoucherStatus, VoucherType } from '@/common/enums/voucher.enum';

export class QueryVoucherByUserDto {
  @ApiProperty({
    description: 'filter vouchers by type',
    type: 'array',
    items: { type: 'string' },
  })
  @IsOptional()
  @IsArray()
  @IsEnum(VoucherType, { each: true })
  voucherType?: VoucherType[];

  @ApiProperty({
    description: 'filter vouchers by status',
    type: 'array',
    items: { type: 'string' },
  })
  @IsOptional()
  @IsArray()
  @IsEnum(VoucherStatus, { each: true })
  status?: VoucherStatus[];

  @ApiProperty({
    description: `ex. voucher.uid, voucher.createdAt, voucher.expiredAt`,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'voucher.uid';

  @ApiProperty({
    description: 'ASC or DESC',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  sortDirection?: 'ASC' | 'DESC' = 'DESC';
}

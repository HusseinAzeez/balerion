import { VoucherStatus, VoucherType } from '@/common/enums/voucher.enum';
import { PaginateDto } from '@/modules/paginations/dto/paginate.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryVoucherByStaffDto extends PaginateDto {
  @IsEnum(VoucherType)
  voucherType: VoucherType;

  @IsOptional()
  @ApiProperty({
    description: 'statuses of voucher',
    type: 'array',
    items: { type: 'string' },
  })
  @IsArray()
  @IsEnum(VoucherStatus, { each: true })
  status?: VoucherStatus[];

  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: `ex. voucher.uid`,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'voucher.uid';

  @ApiProperty({
    description: 'ASC or DESC',
    type: 'string',
  })
  sortDirection?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;
}

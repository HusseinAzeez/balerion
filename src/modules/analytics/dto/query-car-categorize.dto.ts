import { UserRole } from '@/common/enums/user.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryCarCategorizeDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsString()
  brandName?: string;

  @IsOptional()
  @IsString()
  modelName?: string;

  @IsOptional()
  @IsString()
  manufacturedYear?: string;

  @IsOptional()
  @IsString()
  subModelName?: string;

  @IsOptional()
  @ApiProperty({
    description: 'type of user',
    type: 'array',
    items: { type: 'string' },
  })
  @IsArray()
  @IsEnum(UserRole, { each: true })
  userTypes?: UserRole[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isHotDealed?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isCarsmeupCertified?: boolean;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  district?: string;
}

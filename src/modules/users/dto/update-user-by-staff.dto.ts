import {
  AttachmentType,
  AttachmentTypeUser,
} from '@/common/enums/attachment.enum';
import { Attachment } from '@/db/entities/attachment.entity';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateUserByStaffDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  idCard?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsOptional()
  dealerName?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  club?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  postLimit?: number;

  @IsOptional()
  @IsString()
  lineId?: string;

  @IsOptional()
  @ValidateNested()
  @IsArray()
  @Type(() => UpdateAttachmentUserDto)
  attachments?: Attachment[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  deleteImage?: boolean;
}

export class UpdateAttachmentUserDto {
  id?: number;

  @IsNotEmpty()
  filename: string;

  @IsNotEmpty()
  extension: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  size: number;

  @IsNotEmpty()
  url: string;

  @IsEnum(AttachmentTypeUser)
  attachmentType: AttachmentType;

  @IsOptional()
  @IsNumber()
  sequence?: number;
}

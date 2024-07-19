import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AttachmentTypeVoucherDetail } from '@/common/enums/attachment.enum';
import { Attachment } from '@/db/entities/attachment.entity';

export class UpdateVoucherDto {
  @IsString()
  @IsNotEmpty()
  carBrand: string;

  @IsString()
  @IsNotEmpty()
  carModel: string;

  @IsString()
  @IsNotEmpty()
  carPlateNumber: string;

  @IsString()
  @IsNotEmpty()
  ownerFirstName: string;

  @IsString()
  @IsNotEmpty()
  ownerLastName: string;

  @IsOptional()
  @IsString()
  ownerPhoneNumber?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => UpdateAttachmentVoucherDto)
  attachments?: Attachment[];
}

class UpdateAttachmentVoucherDto {
  id?: number;

  @IsNotEmpty()
  filename: string;

  @IsNotEmpty()
  extension: string;

  @IsNotEmpty()
  size: number;

  @IsNotEmpty()
  url: string;

  @IsEnum(AttachmentTypeVoucherDetail)
  attachmentType: AttachmentTypeVoucherDetail;

  @IsOptional()
  @IsNumber()
  sequence?: number;
}

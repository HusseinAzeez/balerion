import {
  AttachmentType,
  AttachmentTypeUser,
} from '@/common/enums/attachment.enum';
import { Attachment } from '@/db/entities/attachment.entity';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class SetupAccountDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  lineId?: string;

  @IsOptional()
  club?: string;

  @IsOptional()
  idCard?: string;

  @IsOptional()
  province?: string;

  @IsOptional()
  district?: string;

  @IsOptional()
  zipCode?: string;

  @IsOptional()
  inviteToken?: string;

  @IsOptional()
  verifiedToken?: string;

  @IsOptional()
  dealerName?: string;

  @IsOptional()
  taxId?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => AttachmentDto)
  attachments?: Attachment[];
}

class AttachmentDto {
  id?: number;

  @IsNotEmpty()
  filename: string;

  @IsNotEmpty()
  extension: string;

  @IsNotEmpty()
  size: number;

  @IsNotEmpty()
  url: string;

  @IsEnum(AttachmentTypeUser)
  attachmentType: AttachmentType;

  @IsOptional()
  @IsNumber()
  sequence?: number;
}

import {
  AttachmentType,
  AttachmentTypeUser,
} from '@/common/enums/attachment.enum';
import { UserRole } from '@/common/enums/user.enum';
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

export class CreateUserSocialDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

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

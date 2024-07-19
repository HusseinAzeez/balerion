import { Attachment } from '@/db/entities/attachment.entity';
import {
  AttachmentType,
  AttachmentTypeCMUCertified,
} from '@/common/enums/attachment.enum';
import {
  CmuCertifiedRequestStatus,
  CmuCertifiedReviewStatus,
} from '@/common/enums/cmu-certified-request.enum';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsEnum(AttachmentTypeCMUCertified)
  attachmentType: AttachmentType;
}

export class ReviewCmuCertifiedRequest {
  @IsNotEmpty()
  @IsEnum(CmuCertifiedReviewStatus)
  interior: CmuCertifiedReviewStatus;

  @IsNotEmpty()
  @IsEnum(CmuCertifiedReviewStatus)
  exterior: CmuCertifiedReviewStatus;

  @IsNotEmpty()
  @IsEnum(CmuCertifiedReviewStatus)
  engineCompartment: CmuCertifiedReviewStatus;

  @IsNotEmpty()
  @IsEnum(CmuCertifiedRequestStatus)
  status: CmuCertifiedRequestStatus;

  @IsOptional()
  onHoldReason?: string;

  @ValidateNested()
  @Type(() => AttachmentDto)
  @IsOptional()
  attachment?: Attachment;
}

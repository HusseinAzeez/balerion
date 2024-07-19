import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { Attachment } from '@/db/entities/attachment.entity';
import {
  AttachmentType,
  AttachmentTypeCMUCertified,
} from '@/common/enums/attachment.enum';
import {
  CmuCertifiedRequestStatus,
  CmuCertifiedReviewStatus,
} from '@/common/enums/cmu-certified-request.enum';

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

export class UpdateCmuCertifiedRequestDto {
  @IsEnum(CmuCertifiedReviewStatus)
  interior: CmuCertifiedReviewStatus;

  @IsEnum(CmuCertifiedReviewStatus)
  exterior: CmuCertifiedReviewStatus;

  @IsEnum(CmuCertifiedReviewStatus)
  engineCompartment: CmuCertifiedReviewStatus;

  @IsEnum({
    on_hold: CmuCertifiedRequestStatus.ON_HOLD,
    approved: CmuCertifiedRequestStatus.APPROVED,
  })
  status: CmuCertifiedRequestStatus;

  @ValidateIf((dto) => dto.status === CmuCertifiedRequestStatus.ON_HOLD)
  @IsString()
  onHoldReason: string;

  @ValidateNested()
  @Type(() => AttachmentDto)
  @IsOptional()
  attachment?: Attachment;
}

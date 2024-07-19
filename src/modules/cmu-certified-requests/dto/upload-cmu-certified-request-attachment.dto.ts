import { IsEnum } from 'class-validator';
import {
  AttachmentType,
  AttachmentTypeCMUCertified,
} from '@/common/enums/attachment.enum';

export class UploadCMUCertifiedRequestAttachmentDto {
  @IsEnum(AttachmentTypeCMUCertified)
  attachmentType: AttachmentType;
}

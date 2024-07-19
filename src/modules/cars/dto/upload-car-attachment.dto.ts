import { IsEnum } from 'class-validator';
import {
  AttachmentType,
  AttachmentTypeCar,
} from '@/common/enums/attachment.enum';

export class UploadCarAttachmentDto {
  @IsEnum(AttachmentTypeCar)
  attachmentType: AttachmentType;
}

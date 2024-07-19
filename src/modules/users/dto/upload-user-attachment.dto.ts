import { IsEnum } from 'class-validator';
import {
  AttachmentType,
  AttachmentTypeUser,
} from '@/common/enums/attachment.enum';

export class UploadUserAttachmentDto {
  @IsEnum(AttachmentTypeUser)
  attachmentType: AttachmentType;
}

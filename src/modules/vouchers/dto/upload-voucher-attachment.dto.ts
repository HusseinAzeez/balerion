import { IsEnum } from 'class-validator';
import {
  AttachmentType,
  AttachmentTypeVoucherDetail,
} from '@/common/enums/attachment.enum';

export class UploadVoucherAttachmentDto {
  @IsEnum(AttachmentTypeVoucherDetail)
  attachmentType: AttachmentType;
}

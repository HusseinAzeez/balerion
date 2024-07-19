import { AttachmentTypeCar } from '@/common/enums/attachment.enum';

export const UploadCarAttachmentSchema = {
  schema: {
    type: 'object',
    required: ['attachmentType', 'file'],
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
      attachmentType: {
        type: 'string',
        enum: Object.values(AttachmentTypeCar),
      },
    },
  },
};

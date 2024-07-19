import { AttachmentTypeVoucherDetail } from '@/common/enums/attachment.enum';
import { VoucherTypeNonReviewable } from '@/common/enums/voucher.enum';

const CreateAttachmentVoucherDetailSchema = {
  type: 'object',
  required: ['filename', 'extension', 'size', 'url', 'attachmentType'],
  properties: {
    filename: {
      type: 'string',
    },
    extension: {
      type: 'string',
    },
    size: {
      type: 'number',
    },
    url: {
      type: 'string',
    },
    attachmentType: {
      type: 'string',
      enum: Object.values(AttachmentTypeVoucherDetail),
    },
    sequence: {
      type: 'number',
    },
  },
};

export const CreateVoucherSchema = {
  schema: {
    type: 'object',
    properties: {
      voucherType: {
        type: 'string',
        enum: Object.values(VoucherTypeNonReviewable),
      },
      carBrand: {
        type: 'string',
      },
      carModel: {
        type: 'string',
      },
      carPlateNumber: {
        type: 'string',
      },
      ownerFirstName: {
        type: 'string',
      },
      ownerLastName: {
        type: 'string',
      },
      ownerPhoneNumber: {
        type: 'string',
      },
      attachments: {
        type: 'array',
        items: CreateAttachmentVoucherDetailSchema,
      },
    },
  },
};

const UpdateAttachmentVoucherDetailSchema = {
  type: 'object',
  required: ['filename', 'extension', 'size', 'url', 'attachmentType'],
  properties: {
    filename: {
      type: 'string',
    },
    extension: {
      type: 'string',
    },
    size: {
      type: 'number',
    },
    url: {
      type: 'string',
    },
    attachmentType: {
      type: 'string',
      enum: Object.values(AttachmentTypeVoucherDetail),
    },
    id: {
      type: 'number',
    },
    sequence: {
      type: 'number',
    },
  },
};

export const UpdateVoucherSchema = {
  schema: {
    type: 'object',
    properties: {
      carBrand: {
        type: 'string',
      },
      carModel: {
        type: 'string',
      },
      carPlateNumber: {
        type: 'string',
      },
      ownerFirstName: {
        type: 'string',
      },
      ownerLastName: {
        type: 'string',
      },
      ownerPhoneNumber: {
        type: 'string',
      },
      attachments: {
        type: 'array',
        items: UpdateAttachmentVoucherDetailSchema,
      },
    },
  },
};

export const UploadVoucherAttachmentSchema = {
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
        enum: Object.values(AttachmentTypeVoucherDetail),
      },
    },
  },
};

import { AttachmentTypeCMUCertified } from '@/common/enums/attachment.enum';
import {
  CmuCertifiedRequestStatus,
  CmuCertifiedReviewStatus,
} from '@/common/enums/cmu-certified-request.enum';

export const ReviewCMUCertifiedRequestSchema = {
  schema: {
    type: 'object',
    required: ['interior', 'exterior', 'engineCompartment', 'status'],
    properties: {
      status: {
        type: 'string',
        enum: Object.values(CmuCertifiedRequestStatus),
      },
      interior: {
        type: 'string',
        enum: Object.values(CmuCertifiedReviewStatus),
      },
      exterior: {
        type: 'string',
        enum: Object.values(CmuCertifiedReviewStatus),
      },
      engineCompartment: {
        type: 'string',
        enum: Object.values(CmuCertifiedReviewStatus),
      },
      onHoldReason: {
        type: 'string',
      },
      attachment: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
            },
            filename: {
              type: 'string',
            },
            extension: {
              type: 'string',
            },
            size: {
              type: 'string',
            },
            url: {
              type: 'string',
            },

            attachmentType: {
              type: 'string',
              enum: Object.values(AttachmentTypeCMUCertified),
            },
          },
        },
      },
    },
  },
};

export const UploadCMUCertifiedRequestAttachmentSchema = {
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
        enum: Object.values(AttachmentTypeCMUCertified),
      },
    },
  },
};

export const CreateCMUCertifiedRequestSchema = {
  schema: {
    type: 'object',
    required: ['carId', 'plateNumber'],
    properties: {
      carDetails: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            carId: {
              type: 'number',
            },
            plateNumber: {
              type: 'string',
            },
          },
        },
      },
    },
  },
};

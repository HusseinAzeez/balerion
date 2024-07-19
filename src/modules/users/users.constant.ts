import { AttachmentTypeUser } from '@/common/enums/attachment.enum';
import { UserRole, UserStatus } from '@/common/enums/user.enum';

export const CreateUsersSchema = {
  schema: {
    type: 'object',
    required: ['email', 'role'],
    properties: {
      usersPayload: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
            },
          },
        },
      },
    },
  },
};

export const SetupProfileSchema = {
  schema: {
    type: 'object',
    required: ['firstName', 'lastName', 'password'],
    properties: {
      image: {
        type: 'string',
        format: 'binary',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
      province: {
        type: 'string',
      },
      district: {
        type: 'string',
      },
      zipCode: {
        type: 'string',
      },
    },
  },
};

export const UpdateUserSchema = {
  schema: {
    type: 'object',
    required: ['firstName', 'lastName'],
    properties: {
      image: {
        type: 'string',
        format: 'binary',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
      status: {
        type: 'string',
        enum: Object.values(UserStatus),
      },
      deleteImage: {
        type: 'boolean',
        default: false,
      },
      lineId: {
        type: 'string',
      },
      club: {
        type: 'string',
      },
      province: {
        type: 'string',
      },
      district: {
        type: 'string',
      },
      zipCode: {
        type: 'string',
      },
      attachments: {
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
              enum: [AttachmentTypeUser.pp20],
            },
            sequence: {
              type: 'number',
            },
          },
        },
      },
    },
  },
};

export const UpdateUserByStaffSchema = {
  schema: {
    type: 'object',
    required: ['firstName', 'lastName'],
    properties: {
      image: {
        type: 'string',
        format: 'binary',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      idCard: {
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
      lineId: {
        type: 'string',
      },
      deleteImage: {
        type: 'boolean',
        default: false,
      },
      dealerName: {
        type: 'string',
      },
      club: {
        type: 'string',
      },
      taxId: {
        type: 'string',
      },
      postLimit: {
        type: 'number',
      },
      province: {
        type: 'string',
      },
      district: {
        type: 'string',
      },
      zipCode: {
        type: 'string',
      },
      attachments: {
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
              enum: [AttachmentTypeUser.pp20],
            },
            sequence: {
              type: 'number',
            },
          },
        },
      },
    },
  },
};

export const SetupUserSchema = {
  schema: {
    type: 'object',
    required: ['firstName', 'lastName', 'password'],
    properties: {
      image: {
        type: 'string',
        format: 'binary',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
      club: {
        type: 'string',
      },
      idCard: {
        type: 'string',
      },
      lineId: {
        type: 'string',
      },
      province: {
        type: 'string',
      },
      district: {
        type: 'string',
      },
      zipCode: {
        type: 'string',
      },
      inviteToken: {
        type: 'string',
      },
      verifiedToken: {
        type: 'string',
      },
      dealerName: {
        type: 'string',
      },
      taxId: {
        type: 'string',
      },
      attachments: {
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
              enum: Object.values(AttachmentTypeUser),
            },
            sequence: {
              type: 'number',
            },
          },
        },
      },
    },
  },
};

export const CreateUserSocialSchema = {
  schema: {
    type: 'object',
    required: ['firstName', 'lastName', 'email', 'role'],
    properties: {
      image: {
        type: 'string',
        format: 'binary',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
      role: {
        type: 'string',
        enum: Object.values(UserRole),
      },
      phoneNumber: {
        type: 'string',
      },
      club: {
        type: 'string',
      },
      idCard: {
        type: 'string',
      },
      lineId: {
        type: 'string',
      },
      province: {
        type: 'string',
      },
      district: {
        type: 'string',
      },
      zipCode: {
        type: 'string',
      },
      dealerName: {
        type: 'string',
      },
      taxId: {
        type: 'string',
      },
      attachments: {
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
              enum: Object.values(AttachmentTypeUser),
            },
            sequence: {
              type: 'number',
            },
          },
        },
      },
    },
  },
};

export const UploadUserAttachmentSchema = {
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
        enum: Object.values(AttachmentTypeUser),
      },
    },
  },
};

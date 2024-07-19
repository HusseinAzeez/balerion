import { BannerStatus, BannerType } from '@/common/enums/banner.enum';

export const CreateBannerSchema = {
  schema: {
    type: 'object',
    required: ['status', 'bannerType', 'desktopImage', 'mobileImage'],
    properties: {
      desktopImage: {
        type: 'string',
        format: 'binary',
      },
      mobileImage: {
        type: 'string',
        format: 'binary',
      },
      status: {
        type: 'string',
        enum: Object.values(BannerStatus),
      },
      bannerType: {
        type: 'string',
        enum: Object.values(BannerType),
      },
      name: {
        type: 'string',
      },
      clientName: {
        type: 'string',
      },
      url: {
        type: 'string',
      },
      scheduleAt: {
        type: 'datetime',
      },
    },
  },
};

export const UpdateBannerSchema = {
  schema: {
    type: 'object',
    required: ['status'],
    properties: {
      desktopImage: {
        type: 'string',
        format: 'binary',
      },
      mobileImage: {
        type: 'string',
        format: 'binary',
      },
      status: {
        type: 'string',
        enum: Object.values(BannerStatus),
      },
      name: {
        type: 'string',
      },
      clientName: {
        type: 'string',
      },
      url: {
        type: 'string',
      },
      scheduleAt: {
        type: 'datetime',
      },
    },
  },
};

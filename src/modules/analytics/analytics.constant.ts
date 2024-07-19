import { CarStatus } from '@/common/enums/car.enum';

export const carCategorizeStatus = [
  CarStatus.PUBLISHED,
  CarStatus.RESERVED,
  CarStatus.SOLD_OUT,
  CarStatus.EXPIRED,
  CarStatus.NOT_APPROVED,
];

export const UserCountPerRoleResponseSchema = {
  schema: {
    type: 'object',
    properties: {
      private: {
        type: 'object',
        properties: {
          verified: {
            type: 'number',
            default: 0,
          },
          unverified: {
            type: 'number',
            default: 0,
          },
        },
      },
      dealer: {
        type: 'object',
        properties: {
          verified: {
            type: 'number',
            default: 0,
          },
          unverified: {
            type: 'number',
            default: 0,
          },
        },
      },
      agent: {
        type: 'object',
        properties: {
          verified: {
            type: 'number',
            default: 0,
          },
          unverified: {
            type: 'number',
            default: 0,
          },
        },
      },
      vendor: {
        type: 'object',
        properties: {
          verified: {
            type: 'number',
            default: 0,
          },
          unverified: {
            type: 'number',
            default: 0,
          },
        },
      },
    },
  },
};

export const CarCategorizeSchema = {
  schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
        },
        status: {
          type: 'string',
          enum: carCategorizeStatus,
        },
        percent: {
          type: 'number',
        },
      },
      example: carCategorizeStatus.map((status) => ({
        amount: 1,
        status,
        percent: 20,
      })),
    },
  },
};

export const CarTopModelSchema = {
  schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
        },
        name: {
          type: 'string',
        },
      },
      example: [
        {
          amount: 2000,
          name: '2019 - Toyota Forester, I-S 2.0',
        },
        {
          amount: 1346,
          name: '2020 - Toyota Corolla Cross, Hybrid Premium 1.8',
        },
        {
          amount: 700,
          name: '2019 - Mazda CX-5 Turbo, SP (4WD) 2.5',
        },
        {
          amount: 500,
          name: '2023 - Honda HR-V 1.8 E Limited',
        },
        {
          amount: 200,
          name: '2017 - Toyota Yaris, G 1.2',
        },
      ],
    },
  },
};

export const CarLineChartSchema = {
  schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        value: {
          type: 'number',
        },
        date: {
          type: 'string',
        },
      },
      example: [
        {
          value: 10,
          date: '2024-01-19T00:00:00.000Z',
        },
        {
          value: 5,
          date: '2024-01-20T00:00:00.000Z',
        },
        {
          value: 2,
          date: '2024-01-21T00:00:00.000Z',
        },
      ],
    },
  },
};

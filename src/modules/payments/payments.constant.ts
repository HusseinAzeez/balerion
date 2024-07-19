export const CreatePaymentSchema = {
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

export const CreatePaymentResponseSchema = {
  schema: {
    type: 'object',
    properties: {
      clientSecret: {
        type: 'string',
      },
    },
  },
};

export const PaymentMethodResponseSchema = {
  schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        createdAtUnix: {
          type: 'number',
        },
        card: {
          type: 'object',
          properties: {
            brand: {
              type: 'string',
            },
            expMonth: {
              type: 'number',
            },
            expYear: {
              type: 'number',
            },
            checkCvs: {
              type: 'string',
            },
          },
        },
      },
    },
  },
};

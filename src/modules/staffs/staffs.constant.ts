export const SetupUserAdminSchema = {
  schema: {
    type: 'object',
    required: ['inviteToken', 'firstName', 'lastName', 'password'],
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
      inviteToken: {
        type: 'string',
      },
    },
  },
};

export const UpdateStaffSchema = {
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
      deleteImage: {
        type: 'boolean',
        default: false,
      },
    },
  },
};

export const ImportUserSchema = {
  schema: {
    type: 'object',
    required: ['file'],
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  },
};

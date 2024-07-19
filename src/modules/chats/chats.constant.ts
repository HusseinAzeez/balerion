export const USER_CHAT_COLLECTION = 'userChats';
export const CHAT_COLLECTION = 'chats';

export const CHAT_QUEUE = 'chat';

export const CreateChatSchema = {
  schema: {
    type: 'object',
    required: ['chatId'],
    properties: {
      images: {
        type: 'array',
        items: { type: 'string', format: 'binary' },
      },
      message: {
        type: 'string',
        example: 'Have a new car ?',
      },
      chatId: {
        type: 'string',
        example: 'UI000001-ID000001-C1',
      },
      carId: {
        type: 'string',
        example: '1',
      },
    },
  },
};

export const CreateChatRoomOkResponseSchema = {
  schema: {
    type: 'object',
    required: ['chatId'],
    properties: {
      chatId: {
        type: 'string',
        example: 'UI000001-ID000001-C1',
      },
    },
  },
};

export const CreateChatOkResponseSchema = {
  schema: {
    type: 'object',
    required: ['message'],
    properties: {
      messages: {
        type: 'string',
        example: 'success',
      },
    },
  },
};

import { DateTimeResolver, URLResolver } from 'graphql-scalars';
import { chats, messages } from '../db';

const resolvers = {
  Date: DateTimeResolver,
  URL: URLResolver,

  Chat: {
    lastMessage(chat: any) {
      return messages.find(m => m.id === chat.lastMessage);
    },
  },

  Query: {
    chats() {
      return chats;
    },
  },
};

export default resolvers;

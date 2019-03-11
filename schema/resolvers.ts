import { GraphQLDateTime } from 'graphql-iso-date';
import { chats, messages } from '../db';

const resolvers = {
  Date: GraphQLDateTime,

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

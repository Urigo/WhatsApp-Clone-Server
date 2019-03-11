import { GraphQLDateTime } from 'graphql-iso-date';
import { chats } from '../db';

const resolvers = {
  Date: GraphQLDateTime,

  Query: {
    chats() {
      return chats;
    },
  },
};

export default resolvers;

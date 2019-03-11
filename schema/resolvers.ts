import { DateTimeResolver, URLResolver } from 'graphql-scalars';
import { chats } from '../db';

const resolvers = {
  Date: DateTimeResolver,
  URL: URLResolver,

  Query: {
    chats() {
      return chats;
    },
  },
};

export default resolvers;

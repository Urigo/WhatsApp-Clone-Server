import { gql } from 'apollo-server-express';
import { DateTimeResolver, URLResolver } from 'graphql-scalars';
import { Resolvers } from '../../types/graphql';

export const typeDefs = gql`
  scalar Date
  scalar URL

  type Query {
    _dummy: Boolean
  }

  type Mutation {
    _dummy: Boolean
  }

  type Subscription {
    _dummy: Boolean
  }
`;

export const resolvers: Resolvers = {
  Date: DateTimeResolver,
  URL: URLResolver,
};

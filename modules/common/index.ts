import { gql } from 'apollo-server-express';
import { GraphQLDateTime } from 'graphql-iso-date';
import { Resolvers } from '../../types/graphql';

export const typeDefs = gql`
  scalar Date

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
  Date: GraphQLDateTime,
};

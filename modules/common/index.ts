import { GraphQLModule } from '@graphql-modules/core';
import { gql } from 'apollo-server-express';
import { GraphQLDateTime } from 'graphql-iso-date';
import { pool } from '../../db';
import { Resolvers } from '../../types/graphql';

const { PostgresPubSub } = require('graphql-postgres-subscriptions');

const typeDefs = gql`
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

const resolvers: Resolvers = {
  Date: GraphQLDateTime,
};

const pubsub = new PostgresPubSub({
  host: 'localhost',
  port: 5432,
  user: 'testuser',
  password: 'testpassword',
  database: 'whatsapp',
});

export default new GraphQLModule({
  name: 'common',
  typeDefs,
  resolvers,
  async context({ res, connection }) {
    let db;

    if (!connection) {
      db = await pool.connect();
    }

    return {
      pubsub,
      res,
      db,
    };
  },
});

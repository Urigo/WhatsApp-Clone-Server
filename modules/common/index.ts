import { GraphQLModule } from '@graphql-modules/core';
import { gql } from 'apollo-server-express';
import { DateTimeResolver, URLResolver } from 'graphql-scalars';
import { pool } from '../../db';
import { Resolvers } from '../../types/graphql';

const { PostgresPubSub } = require('graphql-postgres-subscriptions');

const typeDefs = gql`
  scalar DateTime
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

const resolvers: Resolvers = {
  DateTime: DateTimeResolver,
  URL: URLResolver,
};

const pubsub = new PostgresPubSub({
  host: 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
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

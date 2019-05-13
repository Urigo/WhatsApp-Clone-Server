import { PubSub } from 'apollo-server-express';
import { User } from './db';
import { Response } from 'express';
import { PoolClient } from 'pg';
import { UnsplashApi } from './schema/unsplash.api';

export type MyContext = {
  pubsub: PubSub;
  currentUser: User;
  res: Response;
  db: PoolClient;
  dataSources: {
    unsplashApi: UnsplashApi;
  };
};

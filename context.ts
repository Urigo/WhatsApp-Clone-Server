import { PubSub } from 'apollo-server-express';
import { User } from './db';
import { Response } from 'express';
import { PoolClient } from 'pg';
import { UnsplashApi } from './modules/chats/unsplash.api';

export type MyContext = {
  pubsub: PubSub;
  currentUser: User;
  res: Response;
  db: PoolClient;
  unsplashApi: UnsplashApi;
};

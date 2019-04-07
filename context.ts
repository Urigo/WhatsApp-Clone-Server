import { PubSub } from 'apollo-server-express';

export type MyContext = {
  pubsub: PubSub;
};

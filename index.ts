import { ApolloServer } from 'apollo-server-express';
import { GraphQLModule } from '@graphql-modules/core';
import http from 'http';
import { app } from './app';
import { origin, port } from './env';
import { MyContext } from './context';
import { UnsplashApi } from './schema/unsplash.api';

import usersModule from './modules/users';
import chatsModule from './modules/chats';

export const rootModule = new GraphQLModule({
  name: 'root',
  imports: [usersModule, chatsModule],
});

const server = new ApolloServer({
  schema: rootModule.schema,
  context: rootModule.context,
  subscriptions: rootModule.subscriptions,
  formatResponse: (res: any, { context }: { context: MyContext }) => {
    context.db.release();

    return res;
  },
  dataSources: () => ({
    unsplashApi: new UnsplashApi(),
  }),
});

server.applyMiddleware({
  app,
  path: '/graphql',
  cors: { credentials: true, origin },
});

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

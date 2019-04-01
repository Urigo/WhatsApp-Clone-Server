import { ApolloServer, gql, PubSub } from 'apollo-server-express';
import cors from 'cors';
import express from 'express';
import http from 'http';
import { users } from './db';
import schema from './schema';

const app = express();

const origin = process.env.ORIGIN || 'http://localhost:3000';
app.use(cors({ credentials: true, origin }));
app.use(express.json());

app.get('/_ping', (req, res) => {
  res.send('pong');
});

const pubsub = new PubSub();
const server = new ApolloServer({
  schema,
  context: () => ({
    currentUser: users.find(u => u.id === '1'),
    pubsub,
  }),
});

server.applyMiddleware({
  app,
  path: '/graphql',
  cors: { credentials: true, origin },
});

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const port = process.env.PORT || 4000;

httpServer.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

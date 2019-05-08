import { ApolloServer } from 'apollo-server-express';
import cookie from 'cookie';
import http from 'http';
import jwt from 'jsonwebtoken';
import { app } from './app';
import { pool } from './db';
import { origin, port, secret } from './env';
import schema from './schema';
import { MyContext } from './context';
import sql from 'sql-template-strings';
const { PostgresPubSub } = require('graphql-postgres-subscriptions');

const pubsub = new PostgresPubSub({
  host: 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  user: 'testuser',
  password: 'testpassword',
  database: 'whatsapp',
});
const server = new ApolloServer({
  schema,
  context: async (session: any) => {
    // Access the request object
    let req = session.connection
      ? session.connection.context.request
      : session.req;

    // It's subscription
    if (session.connection) {
      req.cookies = cookie.parse(req.headers.cookie || '');
    }

    let currentUser;
    if (req.cookies.authToken) {
      const username = jwt.verify(req.cookies.authToken, secret) as string;
      if (username) {
        const { rows } = await pool.query(
          sql`SELECT * FROM users WHERE username = ${username}`
        );
        currentUser = rows[0];
      }
    }

    let db;

    if (!session.connection) {
      db = await pool.connect();
    }

    return {
      currentUser,
      pubsub,
      db,
      res: session.res,
    };
  },
  subscriptions: {
    onConnect(params, ws, ctx) {
      // pass the request object to context
      return {
        request: ctx.request,
      };
    },
  },
  formatResponse: (res: any, { context }: { context: MyContext }) => {
    context.db.release();

    return res;
  },
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

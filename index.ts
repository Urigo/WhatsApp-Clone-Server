// For TypeORM
import "reflect-metadata";
//import { schema } from "./schema";
import bodyParser from "body-parser";
import cors from 'cors';
import express from 'express';
import { ApolloServer, PubSub } from "apollo-server-express";
import passport from "passport";
import { createServer } from "http";
import { createConnection } from "typeorm";
import { addSampleData } from "./db";
import { AppModule } from "./modules/app.module";
//import { User } from "./entity/User";
//import { validPassword } from "./modules/auth/providers/auth.provider";

createConnection().then(async connection => {
  await addSampleData(connection);

  const PORT = 3000;

  const app = express();

  app.use(cors());
  app.use(bodyParser.json());
  app.use(passport.initialize());

  const pubsub = new PubSub();

  const { schema, context, subscriptions } = AppModule.forRoot({
    connection,
    app,
  });

  const apollo = new ApolloServer({
    schema,
    context,
    subscriptions,
    /*subscriptions: {
      onConnect: async (connectionParams: any, webSocket: any) => {
        if (connectionParams.authToken) {
          // Create a buffer and tell it the data coming in is base64
          const buf = new Buffer(connectionParams.authToken.split(' ')[1], 'base64');
          // Read it back out as a string
          const [username, password]: string[] = buf.toString().split(':');
          if (username && password) {
            const user = await connection.getRepository(User).findOne({where: { username }});

            if (user && validPassword(password, user.password)) {
              // Set context for the WebSocket
              return {user};
            } else {
              throw new Error('Wrong credentials!');
            }
          }
        }
        throw new Error('Missing auth token!');
      }
    },*/
  });

  apollo.applyMiddleware({
    app,
    path: '/graphql'
  });

  // Wrap the Express server
  const ws = createServer(app);

  apollo.installSubscriptionHandlers(ws);

  ws.listen(PORT, () => {
    console.log(`Apollo Server is now running on http://localhost:${PORT}`);
  });
});

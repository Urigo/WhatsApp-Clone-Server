require('dotenv').config();

import 'reflect-metadata';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { createConnection } from 'typeorm';
import { addSampleData } from './db';
import { AppModule } from './modules/app.module';

createConnection().then(async connection => {
  if (process.argv.includes('--add-sample-data')) {
    addSampleData(connection);
  }

  const PORT = 4000;

  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  const { schema, context, subscriptions } = AppModule.forRoot({ connection, app, });

  const apollo = new ApolloServer({ schema, context, subscriptions });

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

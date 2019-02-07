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
import { AccountsTypeorm } from '@accounts/typeorm';
import AccountsServer from '@accounts/server';
import AccountsPassword from '@accounts/password';
import { User } from './entity/User';

createConnection().then(async connection => {

  const PORT = 4000;

  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  const accountsPassword = new AccountsPassword({
    validateNewUser: ({ username, password, name, picture, phone }) => ({ username, password, name, picture, phone })
  });

  const accountsTypeorm = new AccountsTypeorm({
    connection,
    userEntity: User,
  });

  const accountsServer = new AccountsServer({
    db: accountsTypeorm,
    tokenSecret: 'WHATSAPP',
  }, {
    password: accountsPassword
  });

  if (process.argv.includes('--add-sample-data')) {
    await addSampleData(connection, accountsPassword);
  }

  const { schema, context, subscriptions } = AppModule.forRoot({ connection, accountsServer });

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

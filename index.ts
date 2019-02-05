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
import { AccountsTypeorm, entities } from '@accounts/typeorm';
import AccountsServer from '@accounts/server';
import AccountsPassword from '@accounts/password';
import { Chat } from './entity/Chat';
import { Message } from './entity/Message';
import { Recipient } from './entity/Recipient';
import { User } from './entity/User';

createConnection({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "deneme12",
  database: "whatsapp2",
  synchronize: true,
  logging: false,
  entities: [
    ...entities,
    Chat,
    Message,
    Recipient,
    User,
  ]
}).then(async connection => {

  const PORT = 4000;

  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  const accountsTypeorm = new AccountsTypeorm({
    connection,
    userEntity: User,
  });

  if (process.argv.includes('--add-sample-data')) {
    addSampleData(connection);
  }

  const accountsPassword = new AccountsPassword();

  const accountsServer = new AccountsServer({
    db: accountsTypeorm,
    tokenSecret: 'WHATSAPP',
  }, {
    password: accountsPassword
  });

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

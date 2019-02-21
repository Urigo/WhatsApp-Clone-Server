import { GraphQLModule } from '@graphql-modules/core';
import { Connection } from 'typeorm';
import { Express } from 'express';
import { CommonModule } from './common';
import { UserModule } from './user';
import { ChatModule } from './chat';
import { MessageModule } from './message';
import { RecipientModule } from './recipient';
import { AccountsModule } from '@accounts/graphql-api';
import AccountsServer from '@accounts/server';

export interface IAppModuleConfig {
  connection: Connection,
  accountsServer: AccountsServer
}

export const AppModule = new GraphQLModule<IAppModuleConfig>({
  name: 'App',
  imports: ({config: {connection, accountsServer}}) => [
    CommonModule.forRoot({
      connection,
    }),
    AccountsModule.forRoot({
      accountsServer
    }),
    UserModule,
    ChatModule,
    MessageModule,
    RecipientModule,
  ],
  configRequired: true,
});

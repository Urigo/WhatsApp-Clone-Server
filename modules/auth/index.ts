import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from 'graphql-toolkit';
import { Connection } from 'typeorm';
import { AuthProvider } from './providers/auth.provider';
import { PubSub } from 'apollo-server-express';
import { AccountsModule } from '@accounts/graphql-api';

export interface IAppModuleConfig {
  connection: Connection,
}

export const AuthModule = new GraphQLModule<IAppModuleConfig>({
  name: "Auth",
  imports: [
    AccountsModule,
  ],
  providers: ({config: {connection}}) => [
    {provide: Connection, useValue: connection},
    PubSub,
    AuthProvider,
  ],
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
  configRequired: true
});

import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { Express } from "express";
import { Connection } from "typeorm";
import { AuthProvider } from "./providers/auth.provider";
import { APP } from "../app.symbols";
import { PubSub } from "apollo-server-express";
import { CurrentUserProvider } from './providers/current-user.provider';

export interface IAppModuleConfig {
  connection: Connection,
  app: Express;
}

export const AuthModule = new GraphQLModule<IAppModuleConfig>({
  name: "Auth",
  providers: ({config: {connection, app}}) => [
    {provide: Connection, useValue: connection},
    {provide: APP, useValue: app},
    PubSub,
    AuthProvider,
    CurrentUserProvider,
  ],
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
});

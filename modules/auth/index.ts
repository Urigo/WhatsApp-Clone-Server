import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { Connection } from "typeorm";
import { Express } from "express";
import { User } from "../../entity/User";
import { AuthProvider } from "./providers/auth.provider";
import { APP } from "../app.symbols";
import { CurrentUserProvider } from './providers/current-user.provider';

export interface IAuthModuleConfig {
  connection?: Connection,
  app?: Express;
}

export interface IAuthModuleSession {
  req: {
    user: User;
  }
}

export interface IAuthModuleContext {
}

export const AuthModule = new GraphQLModule<IAuthModuleConfig, IAuthModuleSession, IAuthModuleContext>({
  name: "Auth",
  providers: ({ config: { connection, app } }) => [
    { provide: Connection, useValue: connection },
    { provide: APP, useValue: app },
    AuthProvider,
    CurrentUserProvider,
  ],
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
  configRequired: true,
});

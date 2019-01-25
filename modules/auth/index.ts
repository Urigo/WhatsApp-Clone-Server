import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { Connection } from "typeorm";
import { Express } from "express";
import { User } from "../../entity/User";
import { SubscriptionHandler } from "./providers/subscription-handler"
import { AuthProvider } from "./providers/auth.provider";
import { APP } from "../app.symbols";
import { PubSub } from "apollo-server-express";

export interface IAuthModuleConfig {
  connection?: Connection,
  app?: Express;
  pubsub?: PubSub;
}

export interface IAuthModuleSession {
  req: {
    user: User;
  }
}

export interface IAuthModuleContext {
  user: User;
}

export const AuthModule = new GraphQLModule<IAuthModuleConfig, IAuthModuleSession, IAuthModuleContext>({
  name: "Auth",
  providers: ({config: {connection, app, pubsub}}) => [
    {provide: Connection, useValue: connection},
    {provide: APP, useValue: app},
    {provide: PubSub, useValue: pubsub},
    AuthProvider,
    SubscriptionHandler,
  ],
  context: session => ({user: session.req && session.req.user}),
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
  configRequired: true,
});

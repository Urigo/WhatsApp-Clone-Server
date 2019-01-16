import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { Connection } from "typeorm";
import { Express } from "express";
import { User } from "../../entity/User";
import { SubscriptionHandler } from "./providers/subscription-handler"
import { AuthProvider } from "./providers/auth.provider";
import { APP } from "../config-symbols";

export interface IAuthModuleConfig {
  connection: Connection,
  app: Express;
}

export interface IAuthModuleRequest {
  req: {
    user: User;
  }
}

export interface IAuthModuleContext {
  user: User;
}

export const AuthModule = new GraphQLModule<IAuthModuleConfig, IAuthModuleRequest, IAuthModuleContext>({
  name: 'Auth',
  providers: ({ config: { connection, app } }) => [
    { provide: Connection, useValue: connection },
    { provide: APP, useValue: app },
    AuthProvider,
    SubscriptionHandler,
  ],
  context: (request, currentContext, moduleSessionInfo) => {
    if (!request.req) {
      console.log('request.req is undefined');
    }
    return ({ ...currentContext, user: request.req && request.req.user });
  },
  subscriptions: ({ injector }) => injector.get(SubscriptionHandler),
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
  configRequired: true,
});

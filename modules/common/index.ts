import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { Connection } from "typeorm";
import { AuthModule, IAuthModuleContext } from "../auth";
import { PubSub } from "apollo-server-express";

export interface ICommonModuleConfig {
  connection?: Connection,
  pubsub?: PubSub;
}

export interface ICommonModuleSession {
}

export interface ICommonModuleContext extends IAuthModuleContext {
  connection: Connection,
}

export const CommonModule = new GraphQLModule<ICommonModuleConfig, ICommonModuleSession, ICommonModuleContext>({
  name: "Common",
  imports: [
    AuthModule,
  ],
  providers: ({ config: { connection, pubsub } }) => [
    { provide: Connection, useValue: connection },
    { provide: PubSub, useValue: pubsub },
  ],
  context: (session, currentContext, moduleSessionInfo) => ({ ...currentContext, connection: moduleSessionInfo.module.config.connection! }),
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
  configRequired: true,
});

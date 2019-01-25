import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { AuthModule, IAuthModuleContext } from "../auth";
import { PubSub } from "apollo-server-express";

export interface ICommonModuleConfig {
  pubsub?: PubSub;
}

export interface ICommonModuleSession {
}

export interface ICommonModuleContext extends IAuthModuleContext {
}

export const CommonModule = new GraphQLModule<ICommonModuleConfig, ICommonModuleSession, ICommonModuleContext>({
  name: "Common",
  imports: [
    AuthModule,
  ],
  providers: ({config: {pubsub}}) => [
    {provide: PubSub, useValue: pubsub},
  ],
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
  configRequired: true,
});

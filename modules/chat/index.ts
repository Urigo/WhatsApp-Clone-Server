import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { Connection } from "typeorm";
import { AuthModule } from "../auth";

export interface IChatsModuleConfig {
  connection: Connection,
}

export interface IChatsModuleSession {}

export interface IChatsModuleContext {
  //connection: Connection,
}

export const ChatsModule = new GraphQLModule<IChatsModuleConfig, IChatsModuleSession, IChatsModuleContext>({
  name: 'Chats',
  imports: [ AuthModule ],
  context: (session, currentContext, moduleSessionInfo) => ({ ...currentContext, connection: moduleSessionInfo.module.config.connection }),
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
  configRequired: true,
});

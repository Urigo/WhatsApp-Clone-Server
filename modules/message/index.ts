import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { CommonModule, ICommonModuleContext } from "../common";
import { UserModule } from "../user";
import { ChatModule, IChatModuleContext } from "../chat";

export interface IMessageModuleConfig {}

export interface IMessageModuleSession {}

export interface IMessageModuleContext extends ICommonModuleContext, IChatModuleContext {}

export const MessageModule = new GraphQLModule<IMessageModuleConfig, IMessageModuleSession, IMessageModuleContext>({
  name: 'Chats',
  imports: [
    CommonModule,
    UserModule,
    ChatModule,
  ],
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
});

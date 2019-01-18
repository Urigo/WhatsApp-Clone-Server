import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { CommonModule, ICommonModuleContext } from "../common";
import { IUserModuleContext, UserModule } from "../user";
import { ChatModule, IChatModuleContext } from "../chat";

export interface IMessageModuleConfig {}

export interface IMessageModuleSession {}

export interface IMessageModuleContext extends ICommonModuleContext, IUserModuleContext, IChatModuleContext {}

export const MessageModule = new GraphQLModule<IMessageModuleConfig, IMessageModuleSession, IMessageModuleContext>({
  name: 'Message',
  imports: [
    CommonModule,
    UserModule,
    ChatModule,
  ],
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
});

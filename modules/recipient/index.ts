import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { CommonModule, ICommonModuleContext } from "../common";
import { IUserModuleContext, UserModule } from "../user";
import { IMessageModuleContext, MessageModule } from "../message";
import { ChatModule, IChatModuleContext } from "../chat";

export interface IRecipientModuleConfig {}

export interface IRecipientModuleSession {}

export interface IRecipientModuleContext extends ICommonModuleContext, IUserModuleContext, IMessageModuleContext, IChatModuleContext {}

export const RecipientModule = new GraphQLModule<IRecipientModuleConfig, IRecipientModuleSession, IRecipientModuleContext>({
  name: 'Recipient',
  imports: [
    CommonModule,
    UserModule,
    MessageModule,
    ChatModule,
  ],
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
});

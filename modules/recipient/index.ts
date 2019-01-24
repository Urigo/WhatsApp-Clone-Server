import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { AuthModule, IAuthModuleContext } from "../auth";
import { IUserModuleContext, UserModule } from "../user";
import { IMessageModuleContext, MessageModule } from "../message";
import { ChatModule, IChatModuleContext } from "../chat";
import { RecipientProvider } from "./providers/recipient.provider";

export interface IRecipientModuleConfig {}

export interface IRecipientModuleSession {}

export interface IRecipientModuleContext extends IAuthModuleContext, IUserModuleContext, IMessageModuleContext, IChatModuleContext {}

export const RecipientModule = new GraphQLModule<IRecipientModuleConfig, IRecipientModuleSession, IRecipientModuleContext>({
  name: "Recipient",
  imports: [
    AuthModule,
    UserModule,
    ChatModule,
    MessageModule,
  ],
  providers: [
    RecipientProvider,
  ],
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
});

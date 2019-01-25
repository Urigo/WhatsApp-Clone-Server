import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { IUserModuleContext, UserModule } from "../user";
import { IMessageModuleContext, MessageModule } from "../message";
import { ChatModule, IChatModuleContext } from "../chat";
import { RecipientProvider } from "./providers/recipient.provider";
import { AuthModule, IAuthModuleContext } from "../auth";

export interface IRecipientModuleConfig {
}

export interface IRecipientModuleSession {
}

export interface IRecipientModuleContext extends IAuthModuleContext, IUserModuleContext, IChatModuleContext, IMessageModuleContext {
}

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

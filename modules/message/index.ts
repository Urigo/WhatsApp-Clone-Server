import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { IUserModuleContext, UserModule } from "../user";
import { ChatModule, IChatModuleContext } from "../chat";
import { MessageProvider } from "./providers/message.provider";
import { AuthModule, IAuthModuleContext } from "../auth";

export interface IMessageModuleConfig {
}

export interface IMessageModuleSession {
}

export interface IMessageModuleContext extends IAuthModuleContext, IUserModuleContext, IChatModuleContext {
}

export const MessageModule = new GraphQLModule<IMessageModuleConfig, IMessageModuleSession, IMessageModuleContext>({
  name: "Message",
  imports: [
    AuthModule,
    UserModule,
    ChatModule,
  ],
  providers: [
    MessageProvider,
  ],
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
});

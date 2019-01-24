import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { AuthModule, IAuthModuleContext } from "../auth";
import { IUserModuleContext, UserModule } from "../user";
import { ChatProvider } from "./providers/chat.provider";

export interface IChatModuleConfig {
}

export interface IChatModuleSession {
}

export interface IChatModuleContext extends IAuthModuleContext, IUserModuleContext {
}

export const ChatModule = new GraphQLModule<IChatModuleConfig, IChatModuleSession, IChatModuleContext>({
  name: "Chat",
  imports: [
    AuthModule,
    UserModule,
  ],
  providers: [
    ChatProvider,
  ],
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
});

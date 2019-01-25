import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { UserProvider } from "./providers/user.provider";
import { AuthModule, IAuthModuleContext } from "../auth";

export interface IUserModuleConfig {
}

export interface IUserModuleSession {
}

export interface IUserModuleContext extends IAuthModuleContext {
}

export const UserModule = new GraphQLModule<IUserModuleConfig, IUserModuleSession, IUserModuleContext>({
  name: 'User',
  imports: [
    AuthModule,
  ],
  providers: [
    UserProvider,
  ],
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
});

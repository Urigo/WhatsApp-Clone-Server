import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { CommonModule, ICommonModuleContext } from "../common";

export interface IUserModuleConfig {}

export interface IUserModuleSession {}

export interface IUserModuleContext extends ICommonModuleContext {}

export const UserModule = new GraphQLModule<IUserModuleConfig, IUserModuleSession, IUserModuleContext>({
  name: 'User',
  imports: [
    CommonModule,
  ],
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
});

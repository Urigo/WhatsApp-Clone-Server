import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { Connection } from "typeorm";

export const CONNECTION = Symbol.for('CONNECTION');

export interface CommonModuleConfig {
  connection: Connection,
}

export const CommonModule = new GraphQLModule<CommonModuleConfig>({
  providers: ({ config: { connection } }) => [
    { provide: CONNECTION, useValue: connection },
  ],
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
  configRequired: true,
});

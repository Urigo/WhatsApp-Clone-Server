import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from 'graphql-toolkit';
import { Connection } from 'typeorm';
import { PubSub } from 'apollo-server-express';

export interface ICommonModuleConfig {
  connection: Connection,
}

export const CommonModule = new GraphQLModule<ICommonModuleConfig>({
  name: 'Common',
  providers: ({config: {connection}}) => [
    {provide: Connection, useValue: connection},
    PubSub,
  ],
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
  configRequired: true
});

import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { getConnection, Connection } from 'typeorm';
import { AuthProvider } from './providers/auth.provider';
import { PubSub } from 'apollo-server-express';

export const AuthModule = new GraphQLModule({
  name: "Auth",
  providers: [
    {provide: Connection, useFactory: () => getConnection() },
    PubSub,
    AuthProvider,
  ],
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
});

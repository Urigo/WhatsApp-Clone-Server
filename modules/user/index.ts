import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { UserProvider } from './providers/user.provider';
import { AuthModule } from '../auth';

export const UserModule = new GraphQLModule({
  name: 'User',
  imports: [
    AuthModule,
  ],
  providers: [
    UserProvider,
  ],
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
});

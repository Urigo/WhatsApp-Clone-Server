import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from 'graphql-toolkit';
import { UserProvider } from './providers/user.provider';
import { AuthModule } from '../auth';
import { ProviderScope, InjectFunction } from '@graphql-modules/di';
import { PubSub } from 'graphql-subscriptions';
import AccountsServer, { ServerHooks } from '@accounts/server';

export const UserModule = new GraphQLModule({
  name: 'User',
  imports: [
    AuthModule,
  ],
  providers: [
    UserProvider,
  ],
  defaultProviderScope: ProviderScope.Session,
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
  middleware: InjectFunction(PubSub, AccountsServer)((pubSub, accountsServer) => {
    accountsServer.on(ServerHooks.CreateUserSuccess, data => pubSub.publish('userAdded', { data }));
    return {};
  })
});

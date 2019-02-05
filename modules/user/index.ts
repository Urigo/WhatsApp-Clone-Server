/// <reference path="../../cloudinary.d.ts" />
import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from 'graphql-toolkit';
import { UserProvider } from './providers/user.provider';
import { CommonModule } from '../common';
import { ProviderScope, InjectFunction } from '@graphql-modules/di';
import { PubSub } from 'graphql-subscriptions';
import AccountsServer, { ServerHooks } from '@accounts/server';
import { AccountsModule } from '@accounts/graphql-api';
import cloudinary from 'cloudinary';

export const UserModule = new GraphQLModule({
  name: 'User',
  imports: [
    CommonModule,
    AccountsModule,
  ],
  providers: [
    UserProvider,
  ],
  defaultProviderScope: ProviderScope.Session,
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
  middleware: InjectFunction(PubSub, AccountsServer)((pubSub, accountsServer) => {

    const CLOUDINARY_URL = process.env.CLOUDINARY_URL || '';
    const match = CLOUDINARY_URL.match(/cloudinary:\/\/(\d+):(\w+)@(\.+)/);
    
    if (match) {
      const [api_key, api_secret, cloud_name] = match.slice(1);
      cloudinary.config({ api_key, api_secret, cloud_name });
    }

    accountsServer.on(ServerHooks.CreateUserSuccess, data => pubSub.publish('userAdded', { data }));

    return {};
  
  })
});

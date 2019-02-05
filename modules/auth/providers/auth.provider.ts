import { Injectable, ProviderScope } from '@graphql-modules/di';
import { ModuleSessionInfo, OnRequest, OnConnect } from '@graphql-modules/core';
import { User } from '../../../entity/User';
import AccountsServer from '@accounts/server';
import { AccountsModuleContext } from '@accounts/graphql-api';

@Injectable({
  scope: ProviderScope.Session
})
export class AuthProvider implements OnRequest, OnConnect {
  currentUser: User;
  constructor(
    private accountsServer: AccountsServer,
  ) {}

  onRequest({ context }: ModuleSessionInfo<any, any, AccountsModuleContext>) {
    if (context.user) {
      this.currentUser = context.user as User;
    }
  }

  async onConnect(connectionParams: { 'accounts-access-token'?: string }) {
    if (connectionParams['accounts-access-token']) {
      this.currentUser = await this.accountsServer.resumeSession(connectionParams['accounts-access-token']) as User;
    }
  }
}

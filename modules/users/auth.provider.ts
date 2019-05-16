import { Injectable, Inject, ProviderScope } from '@graphql-modules/di';
import { ModuleSessionInfo } from '@graphql-modules/core';
import jwt from 'jsonwebtoken';
import { secret } from '../../env';
import { Users } from './users.provider';
import { User } from '../../db';

@Injectable({
  scope: ProviderScope.Session,
})
export class Auth {
  @Inject() private users: Users;
  @Inject() private module: ModuleSessionInfo;

  private get req() {
    return this.module.session.req || this.module.session.request;
  }

  async currentUser(): Promise<User | null> {
    if (this.req.cookies.authToken) {
      const username = jwt.verify(this.req.cookies.authToken, secret) as string;

      if (username) {
        return this.users.findByUsername(username);
      }
    }

    return null;
  }
}

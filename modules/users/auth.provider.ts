import { Injectable, Inject, ProviderScope } from '@graphql-modules/di';
import { ModuleSessionInfo } from '@graphql-modules/core';
import jwt from 'jsonwebtoken';
import { secret } from '../../env';
import { validateLength, validatePassword } from '../../validators';
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

  async signUp({
    name,
    password,
    passwordConfirm,
    username,
  }: {
    name: string;
    password: string;
    passwordConfirm: string;
    username: string;
  }) {
    validateLength('req.name', name, 3, 50);
    validateLength('req.username', username, 3, 18);
    validatePassword('req.password', password);

    if (password !== passwordConfirm) {
      throw Error("req.password and req.passwordConfirm don't match");
    }

    const existingUser = await this.users.findByUsername(username);

    if (existingUser) {
      throw Error('username already exists');
    }

    return this.users.newUser({
      username,
      name,
      password,
    });
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

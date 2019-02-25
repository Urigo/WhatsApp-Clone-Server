import { Injectable, ProviderScope } from '@graphql-modules/di';
import { ModuleSessionInfo, OnRequest, OnConnect } from '@graphql-modules/core';
import { Connection } from 'typeorm';
import { User } from '../../../entity/User';
import bcrypt from 'bcrypt-nodejs';
import { PubSub } from 'apollo-server-express'

@Injectable({
  scope: ProviderScope.Session
})
export class AuthProvider implements OnRequest, OnConnect {

  currentUser: User;
  constructor(
    private connection: Connection,
    private pubsub: PubSub,
  ) {}

  onRequest({ session }: ModuleSessionInfo) {
    if ('req' in session) {
      this.currentUser = session.req.user;
    }
  }

  async onConnect(connectionParams: { authToken?: string }) {
    if (connectionParams.authToken) {
      // Create a buffer and tell it the data coming in is base64
      const buf = Buffer.from(connectionParams.authToken.split(' ')[1], 'base64');
      // Read it back out as a string
      const [username, password]: string[] = buf.toString().split(':');
      const user = await this.signIn(username, password);
      if (user) {
        // Set context for the WebSocket
        this.currentUser = user;
      } else {
        throw new Error('Wrong credentials!');
      }
    } else {
      throw new Error('Missing auth token!');
    }
  }

  getUserByUsername(username: string) {
    return this.connection.getRepository(User).findOne({where: { username }});
  }

  async signIn(username: string, password: string): Promise<User | false> {
    const user = await this.getUserByUsername(username);
    if (user && this.validPassword(password, user.password)) {
      return user;
    } else {
      return false;
    }
  }

  async signUp(username: string, password: string, name: string): Promise<User | false> {
    const userExists = !!(await this.getUserByUsername(username));
    if (!userExists) {
      const user = this.connection.manager.save(
        new User({
          username,
          password: this.generateHash(password),
          name,
        })
      );
      this.pubsub.publish('userAdded', {
        userAdded: user,
      });
      return user;
    } else {
      return false;
    }
  }

  generateHash(password: string) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
  }

  validPassword(password: string, localPassword: string) {
    return bcrypt.compareSync(password, localPassword);
  }
}

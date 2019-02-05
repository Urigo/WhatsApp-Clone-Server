import { Injectable } from '@graphql-modules/di'
import { PubSub } from 'apollo-server-express'
import { Connection } from 'typeorm'
import { User } from '../../../entity/User';
import AccountsServer from '@accounts/server';
import { UploadedFile } from '../../../types';
import { ModuleSessionInfo, OnRequest, OnConnect } from '@graphql-modules/core';
import { AccountsModuleContext } from '@accounts/graphql-api';
import cloudinary from 'cloudinary';

@Injectable()
export class UserProvider implements OnRequest, OnConnect {

  constructor(
    private pubsub: PubSub,
    private connection: Connection,
    private accountsServer: AccountsServer,
  ) { }

  public repository = this.connection.getRepository(User);
  currentUser: User;

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

  createQueryBuilder() {
    return this.connection.createQueryBuilder(User, 'user');
  }

  getUsers() {
    return this.createQueryBuilder().where('user.id != :id', {id: this.currentUser.id}).getMany();
  }

  async updateUser({
    name,
    picture,
  }: {
    name?: string,
    picture?: string,
  } = {}) {
    if (name === this.currentUser.name && picture === this.currentUser.picture) {
      return this.currentUser;
    }
    
    this.currentUser.name = name || this.currentUser.name;
    this.currentUser.picture = picture || this.currentUser.picture;

    await this.repository.save(this.currentUser);

    this.pubsub.publish('userUpdated', {
      userUpdated: this.currentUser,
    });

    return this.currentUser;
  }

  filterUserAddedOrUpdated(userAddedOrUpdated: User) {
    return userAddedOrUpdated.id !== this.currentUser.id;
  }

  uploadProfilePic(readableStream: NodeJS.ReadableStream) {
    return new Promise<UploadedFile>((resolve, reject) => {
      const writeStream = cloudinary.v2.uploader.upload_stream((error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
      readableStream.pipe(writeStream);
    });
  }
}

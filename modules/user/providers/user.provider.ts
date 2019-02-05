/// <reference path="../../../cloudinary.d.ts" />
import { Injectable } from '@graphql-modules/di'
import { PubSub } from 'apollo-server-express'
import { Connection } from 'typeorm'
import { User } from '../../../entity/User';
import { AuthProvider } from '../../auth/providers/auth.provider';
import cloudinary from 'cloudinary';
import { UploadedFile } from '../../../types';

export const CLOUDINARY_URL = process.env.CLOUDINARY_URL || '';
const match = CLOUDINARY_URL.match(/cloudinary:\/\/(\d+):(\w+)@(\.+)/);

if (match) {
  const [api_key, api_secret, cloud_name] = match.slice(1);
  cloudinary.config({ api_key, api_secret, cloud_name });
}

@Injectable()
export class UserProvider {

  constructor(
    private pubsub: PubSub,
    private connection: Connection,
    private authProvider: AuthProvider,
  ) { }

  public repository = this.connection.getRepository(User);
  private currentUser = this.authProvider.currentUser;

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

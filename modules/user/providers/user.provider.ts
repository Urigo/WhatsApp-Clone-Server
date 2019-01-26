import { Inject, Injectable } from '@graphql-modules/di'
import { PubSub } from 'apollo-server-express'
import { Connection } from 'typeorm'
import { User } from "../../../entity/User";
import { APP } from "../../app.symbols";
import { Express } from "express";
import multer from 'multer';
import tmp from 'tmp';
import '../../../types/cloudinary';
import cloudinary from 'cloudinary';
export const CLOUDINARY_URL = process.env.CLOUDINARY_URL || '';

@Injectable()
export class UserProvider {
  constructor(
    private pubsub: PubSub,
    private connection: Connection,
    @Inject(APP) private app: Express,
  ) {
    const match = CLOUDINARY_URL.match(/cloudinary:\/\/(\d+):(\w+)@(\.+)/);

    if (match) {
      const [api_key, api_secret, cloud_name] = match.slice(1);
      cloudinary.config({ api_key, api_secret, cloud_name });
    }

    const upload = multer({
      dest: tmp.dirSync({ unsafeCleanup: true }).name,
    });

    app.post('/upload-profile-pic', upload.single('file'), (req: any, res, done) => {
      cloudinary.v2.uploader.upload(req.file.path, (error, result) => {
        if (error) {
          done(error);
        } else {
          res.json(result);
        }
      })
    });
  }

  getMe(currentUser: User) {
    return currentUser;
  }

  async getUsers(currentUser: User) {
    return await this.connection
      .createQueryBuilder(User, 'user')
      .where('user.id != :id', {id: currentUser.id})
      .getMany();
  }

  async updateUser(currentUser: User, {
    name,
    picture,
  }: {
    name?: string,
    picture?: string,
  } = {}) {
    if (name === currentUser.name && picture === currentUser.picture) {
      return currentUser;
    }

    currentUser.name = name || currentUser.name;
    currentUser.picture = picture || currentUser.picture;

    await this.connection.getRepository(User).save(currentUser);

    this.pubsub.publish('userUpdated', {
      userUpdated: currentUser,
    });

    return currentUser;
  }

  filterUserAddedOrUpdated(currentUser: User, userAddedOrUpdated: User) {
    return userAddedOrUpdated.id !== currentUser.id;
  }
}

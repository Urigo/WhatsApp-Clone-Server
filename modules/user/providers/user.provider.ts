import { Injectable } from '@graphql-modules/di'
import { PubSub } from 'apollo-server-express'
import { Connection } from 'typeorm'
import { User } from "../../../entity/User";

@Injectable()
export class UserProvider {
  constructor(
    private pubsub: PubSub,
    private connection: Connection,
  ) {
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

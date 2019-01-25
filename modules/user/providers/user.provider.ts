import { Injectable, ProviderScope } from '@graphql-modules/di'
import { PubSub } from 'apollo-server-express'
import { Connection } from 'typeorm'
import { User } from "../../../entity/User";
import { CurrentUserProvider } from '../../auth/providers/current-user.provider';

@Injectable({
  scope: ProviderScope.Session
})
export class UserProvider {
  constructor(
    private pubsub: PubSub,
    private connection: Connection,
    private currentUserProvider: CurrentUserProvider,
  ) {
  }

  async getMe() {
    const { currentUser } = this.currentUserProvider;
    return currentUser;
  }

  async getUsers() {
    const { currentUser } = this.currentUserProvider;
    return await this.connection
      .createQueryBuilder(User, 'user')
      .where('user.id != :id', {id: currentUser.id})
      .getMany();
  }

  async updateUser({
    name,
    picture,
  }: {
    name?: string,
    picture?: string,
  } = {}) {
    const { currentUser } = this.currentUserProvider;
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

  filterUserAddedOrUpdated(userAddedOrUpdated: User) {
    const { currentUser } = this.currentUserProvider;
    return userAddedOrUpdated.id !== currentUser.id;
  }
}

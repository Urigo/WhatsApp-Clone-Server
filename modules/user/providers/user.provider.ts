import { Injectable, ProviderScope } from '@graphql-modules/di'
import { Connection } from 'typeorm'
import { User } from '../../../entity/user'
import { AuthProvider } from '../../auth/providers/auth.provider'

@Injectable()
export class UserProvider {
  constructor(private connection: Connection, private authProvider: AuthProvider) {}

  public repository = this.connection.getRepository(User)
  private currentUser = this.authProvider.currentUser

  createQueryBuilder() {
    return this.connection.createQueryBuilder(User, 'user')
  }

  getMe() {
    return this.currentUser
  }

  getUsers() {
    return this.createQueryBuilder()
      .where('user.id != :id', { id: this.currentUser.id })
      .getMany()
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

    return this.currentUser;
  }
}

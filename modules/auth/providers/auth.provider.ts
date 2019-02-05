import { OnRequest } from '@graphql-modules/core'
import { Injectable } from '@graphql-modules/di'
import { Connection } from 'typeorm'
import { User } from '../../../entity/user'

@Injectable()
export class AuthProvider implements OnRequest {
  currentUser: User

  constructor(
    private connection: Connection
  ) {}

  async onRequest() {
    if (this.currentUser) return


    const currentUser = await this.connection
      .createQueryBuilder(User, 'user')
      .getOne()

    if (currentUser) {
      console.log(currentUser)
      this.currentUser = currentUser
    }
  }
}

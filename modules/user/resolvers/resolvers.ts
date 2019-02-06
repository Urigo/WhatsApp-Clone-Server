import { ModuleContext } from '@graphql-modules/core'
import { User } from '../../../entity/User'
import { IResolvers } from '../../../types'
import { UserProvider } from '../providers/user.provider'

export default {
  Query: {
    me: (obj, args, { injector }) => injector.get(UserProvider).getMe(),
    users: (obj, args, { injector }) => injector.get(UserProvider).getUsers(),
  },
  Mutation: {
    updateUser: (obj, { name, picture }, { injector }) => injector.get(UserProvider).updateUser({
      name: name || '',
      picture: picture || '',
    }),
  },
} as IResolvers

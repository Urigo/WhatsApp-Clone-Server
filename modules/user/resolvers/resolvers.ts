import { ModuleContext } from '@graphql-modules/core'
import { User } from '../../../entity/User'
import { IResolvers } from '../../../types'
import { UserProvider } from '../providers/user.provider'

export default {
  Query: {
    users: (obj, args, { injector }) => injector.get(UserProvider).getUsers(),
  },
} as IResolvers

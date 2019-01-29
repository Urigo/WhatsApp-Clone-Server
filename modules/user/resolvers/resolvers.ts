import { PubSub } from 'apollo-server-express';
import { withFilter } from 'apollo-server-express';
import { UserProvider } from '../providers/user.provider';
import { User } from '../../../entity/User';
import { IResolvers } from '../../../types';
import { ModuleContext } from '@graphql-modules/core';

export default {
  Query: {
    me: (_, __, { injector }) => injector.get(UserProvider).getMe(),
    users: (obj, args, { injector }) => injector.get(UserProvider).getUsers(),
  },
  Mutation: {
    updateUser: (obj, {name, picture}, { injector }) => injector.get(UserProvider).updateUser({
        name: name || '',
        picture: picture || '',
      }),
  },
  Subscription: {
    userAdded: {
      subscribe: withFilter(
        (root, args, { injector }: ModuleContext) => injector.get(PubSub).asyncIterator('userAdded'),
        (data: { userAdded: User }, variables, { injector }: ModuleContext) => data && injector.get(UserProvider).filterUserAddedOrUpdated(data.userAdded),
      ),
    },
    userUpdated: {
      subscribe: withFilter(
        (root, args, { injector }: ModuleContext) => injector.get(PubSub).asyncIterator('userAdded'),
        (data: { userUpdated: User }, variables, { injector }: ModuleContext) => data && injector.get(UserProvider).filterUserAddedOrUpdated(data.userUpdated)
      ),
    },
  },
} as IResolvers;

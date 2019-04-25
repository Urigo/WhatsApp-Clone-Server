import { IResolvers } from '../../../types';
import { ModuleContext } from '@graphql-modules/core';
import { PubSub } from 'apollo-server-express';
import { User } from '../../../entity/User';
import { UserProvider } from '../providers/user.provider';
import { withFilter } from 'apollo-server-express';

export default {
    Query: {
        me: (_: any, __: any, { injector }: any) => injector.get(UserProvider).getMe(),
        users: (obj: any, args: any, { injector }: any) => injector.get(UserProvider).getUsers(),
    },
    Mutation: {
        updateUser: (obj: any, { name, picture }: any, { injector }: any) => injector.get(UserProvider).updateUser({
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
                (root, args, { injector }: ModuleContext) => injector.get(PubSub).asyncIterator('userUpdated'),
                (data: { userUpdated: User }, variables, { injector }: ModuleContext) => data && injector.get(UserProvider).filterUserAddedOrUpdated(data.userUpdated)
            ),
        },
    },
} as unknown as IResolvers;

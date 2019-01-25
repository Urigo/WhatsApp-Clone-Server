import { InjectFunction } from '@graphql-modules/di';
import { PubSub } from "apollo-server-express";
import { withFilter } from 'apollo-server-express';
import { IResolvers } from "../../../types/user";
import { UserProvider } from "../providers/user.provider";
import { User } from "../../../entity/User";

export default InjectFunction(PubSub, UserProvider)((pubsub, userProvider): IResolvers => ({
  Query: {
    me: (obj, args, {user: currentUser}) => userProvider.getMe(currentUser),
    users: (obj, args, {user: currentUser}) => userProvider.getUsers(currentUser),
  },
  Mutation: {
    updateUser: (obj, {name, picture}, {user: currentUser}) => userProvider.updateUser(currentUser, {
      name: name || '',
      picture: picture || '',
    }),
  },
  Subscription: {
    userAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('userAdded'),
        ({userAdded}: { userAdded: User }, variables, {currentUser}) =>
          userProvider.filterUserAddedOrUpdated(currentUser, userAdded),
      ),
    },
    userUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('userAdded'),
        ({userUpdated}: { userUpdated: User }, variables, {currentUser}) =>
          userProvider.filterUserAddedOrUpdated(currentUser, userUpdated),
      ),
    },
  },
}));

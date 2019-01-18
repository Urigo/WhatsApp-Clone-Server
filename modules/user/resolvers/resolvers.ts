import { IResolvers } from "../../../types";
import { User } from "../../../entity/User";

export default ((): IResolvers => ({
  Query: {
    // Show all users for the moment.
    users: async (obj, args, {user: currentUser, connection}) => {
      return await connection
        .createQueryBuilder(User, "user")
        .where('user.id != :id', {id: currentUser.id})
        .getMany();
    },
  },
}));

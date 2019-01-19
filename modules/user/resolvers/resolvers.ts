import { User } from "../../../entity/User";
import { IResolvers } from "../../../types";
import { InjectFunction } from "@graphql-modules/di";
import { Connection } from "typeorm";
import { CurrentUserProvider } from "../../auth/providers/current-user.provider";

export default InjectFunction(Connection)((connection): IResolvers => ({
  Query: {
    // Show all users for the moment.
    users: async (obj, args, { injector }) => {
      const { currentUser } = injector.get(CurrentUserProvider);
      return await connection
        .createQueryBuilder(User, "user")
        .where('user.id != :id', { id: currentUser.id })
        .getMany();
    },
  },
}));

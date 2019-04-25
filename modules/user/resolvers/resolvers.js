"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const user_provider_1 = require("../providers/user.provider");
const apollo_server_express_2 = require("apollo-server-express");
exports.default = {
    Query: {
        me: (_, __, { injector }) => injector.get(user_provider_1.UserProvider).getMe(),
        users: (obj, args, { injector }) => injector.get(user_provider_1.UserProvider).getUsers(),
    },
    Mutation: {
        updateUser: (obj, { name, picture }, { injector }) => injector.get(user_provider_1.UserProvider).updateUser({
            name: name || '',
            picture: picture || '',
        }),
    },
    Subscription: {
        userAdded: {
            subscribe: apollo_server_express_2.withFilter((root, args, { injector }) => injector.get(apollo_server_express_1.PubSub).asyncIterator('userAdded'), (data, variables, { injector }) => data && injector.get(user_provider_1.UserProvider).filterUserAddedOrUpdated(data.userAdded)),
        },
        userUpdated: {
            subscribe: apollo_server_express_2.withFilter((root, args, { injector }) => injector.get(apollo_server_express_1.PubSub).asyncIterator('userUpdated'), (data, variables, { injector }) => data && injector.get(user_provider_1.UserProvider).filterUserAddedOrUpdated(data.userUpdated)),
        },
    },
};

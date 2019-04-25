"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@graphql-modules/core");
const sonar_1 = require("@graphql-modules/sonar");
const user_1 = require("../user");
const chat_provider_1 = require("./providers/chat.provider");
const auth_1 = require("../auth");
const di_1 = require("@graphql-modules/di");
exports.ChatModule = new core_1.GraphQLModule({
    name: "Chat",
    imports: [
        auth_1.AuthModule,
        user_1.UserModule,
    ],
    providers: [
        chat_provider_1.ChatProvider,
    ],
    defaultProviderScope: di_1.ProviderScope.Session,
    typeDefs: sonar_1.loadSchemaFiles(__dirname + '/schema/'),
    resolvers: sonar_1.loadResolversFiles(__dirname + '/resolvers/'),
});

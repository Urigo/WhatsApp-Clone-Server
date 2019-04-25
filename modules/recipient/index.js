"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@graphql-modules/core");
const sonar_1 = require("@graphql-modules/sonar");
const user_1 = require("../user");
const message_1 = require("../message");
const chat_1 = require("../chat");
const recipient_provider_1 = require("./providers/recipient.provider");
const auth_1 = require("../auth");
exports.RecipientModule = new core_1.GraphQLModule({
    name: "Recipient",
    imports: [
        auth_1.AuthModule,
        user_1.UserModule,
        chat_1.ChatModule,
        message_1.MessageModule,
    ],
    providers: [
        recipient_provider_1.RecipientProvider,
    ],
    typeDefs: sonar_1.loadSchemaFiles(__dirname + '/schema/'),
    resolvers: sonar_1.loadResolversFiles(__dirname + '/resolvers/'),
});

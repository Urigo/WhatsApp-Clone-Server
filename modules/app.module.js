"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@graphql-modules/core");
const auth_1 = require("./auth");
const user_1 = require("./user");
const chat_1 = require("./chat");
const message_1 = require("./message");
const recipient_1 = require("./recipient");
exports.AppModule = new core_1.GraphQLModule({
    name: 'App',
    imports: ({ config: { connection, app } }) => [
        auth_1.AuthModule.forRoot({
            connection,
            app,
        }),
        user_1.UserModule,
        chat_1.ChatModule,
        message_1.MessageModule,
        recipient_1.RecipientModule,
    ],
    configRequired: true,
});

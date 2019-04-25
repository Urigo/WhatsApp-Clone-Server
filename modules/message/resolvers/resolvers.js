"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const message_provider_1 = require("../providers/message.provider");
const apollo_server_express_1 = require("apollo-server-express");
const apollo_server_express_2 = require("apollo-server-express");
exports.default = {
    Query: {
        // The ordering depends on the messages
        chats: (obj, args, { injector }) => injector.get(message_provider_1.MessageProvider).getChats(),
    },
    Mutation: {
        addMessage: async (obj, { chatId, content }, { injector }) => injector.get(message_provider_1.MessageProvider).addMessage(chatId, content),
        removeMessages: async (obj, { chatId, messageIds, all }, { injector }) => injector.get(message_provider_1.MessageProvider).removeMessages(chatId, {
            messageIds: messageIds || undefined,
            all: all || false,
        }),
        // We may need to also remove the messages
        removeChat: async (obj, { chatId }, { injector }) => injector.get(message_provider_1.MessageProvider).removeChat(chatId),
    },
    Subscription: {
        messageAdded: {
            subscribe: apollo_server_express_2.withFilter((root, args, { injector }) => injector.get(apollo_server_express_1.PubSub).asyncIterator('messageAdded'), (data, variables, { injector }) => data && injector.get(message_provider_1.MessageProvider).filterMessageAdded(data.messageAdded)),
        },
    },
    Chat: {
        messages: async (chat, { amount }, { injector }) => injector.get(message_provider_1.MessageProvider).getChatMessages(chat, amount || 0),
        lastMessage: async (chat, args, { injector }) => injector.get(message_provider_1.MessageProvider).getChatLastMessage(chat),
        updatedAt: async (chat, args, { injector }) => injector.get(message_provider_1.MessageProvider).getChatUpdatedAt(chat),
    },
    Message: {
        sender: async (message, args, { injector }) => injector.get(message_provider_1.MessageProvider).getMessageSender(message),
        ownership: async (message, args, { injector }) => injector.get(message_provider_1.MessageProvider).getMessageOwnership(message),
        holders: async (message, args, { injector }) => injector.get(message_provider_1.MessageProvider).getMessageHolders(message),
        chat: async (message, args, { injector }) => injector.get(message_provider_1.MessageProvider).getMessageChat(message),
    },
};

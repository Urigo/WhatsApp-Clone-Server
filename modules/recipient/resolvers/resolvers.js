"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const recipient_provider_1 = require("../providers/recipient.provider");
exports.default = {
    Mutation: {
        // TODO: implement me
        markAsReceived: async (obj, { chatId }) => false,
        // TODO: implement me
        markAsRead: async (obj, { chatId }) => false,
        // We may also need to remove the recipients
        removeChat: async (obj, { chatId }, { injector }) => injector.get(recipient_provider_1.RecipientProvider).removeChat(chatId),
        // We also need to create the recipients
        addMessage: async (obj, { chatId, content }, { injector }) => injector.get(recipient_provider_1.RecipientProvider).addMessage(chatId, content),
        // We may also need to remove the recipients
        removeMessages: async (obj, { chatId, messageIds, all }, { injector }) => injector.get(recipient_provider_1.RecipientProvider).removeMessages(chatId, {
            messageIds: messageIds || undefined,
            all: all || false,
        }),
    },
    Chat: {
        unreadMessages: async (chat, args, { injector }) => injector.get(recipient_provider_1.RecipientProvider).getChatUnreadMessagesCount(chat),
    },
    Message: {
        recipients: async (message, args, { injector }) => injector.get(recipient_provider_1.RecipientProvider).getMessageRecipients(message),
    },
    Recipient: {
        chat: async (recipient, args, { injector }) => injector.get(recipient_provider_1.RecipientProvider).getRecipientChat(recipient),
    },
};

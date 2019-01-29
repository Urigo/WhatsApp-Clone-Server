import { IResolvers } from '../../../types';
import { RecipientProvider } from '../providers/recipient.provider';

export default {
  Mutation: {
    // TODO: implement me
    markAsReceived: async (obj, { chatId }) => false,
    // TODO: implement me
    markAsRead: async (obj, { chatId }) => false,
    // We may also need to remove the recipients
    removeChat: async (obj, { chatId }, { injector }) => injector.get(RecipientProvider).removeChat(chatId),
    // We also need to create the recipients
    addMessage: async (obj, { chatId, content }, { injector }) => injector.get(RecipientProvider).addMessage(chatId, content),
    // We may also need to remove the recipients
    removeMessages: async (obj, { chatId, messageIds, all }, { injector }) => injector.get(RecipientProvider).removeMessages(chatId, {
      messageIds: messageIds || undefined,
      all: all || false,
    }),
  },
  Chat: {
    unreadMessages: async (chat, args, { injector }) => injector.get(RecipientProvider).getChatUnreadMessagesCount(chat),
  },
  Message: {
    recipients: async (message, args, { injector }) => injector.get(RecipientProvider).getMessageRecipients(message),
  },
  Recipient: {
    chat: async (recipient, args, { injector }) => injector.get(RecipientProvider).getRecipientChat(recipient),
  },
} as IResolvers;

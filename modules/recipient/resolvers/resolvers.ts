import { InjectFunction } from '@graphql-modules/di';
import { PubSub } from "apollo-server-express";
import { Message } from "../../../entity/Message";
import { IResolvers } from "../../../types/recipient";
import { RecipientProvider } from "../providers/recipient.provider";

export default InjectFunction(PubSub, RecipientProvider)((pubsub, recipientProvider): IResolvers => ({
  Mutation: {
    markAsReceived: async (obj, {chatId}, {user: currentUser}) => false,
    markAsRead: async (obj, {chatId}, {user: currentUser}) => false,
    // We may also need to remove the recipients
    removeChat: async (obj, {chatId}, {user: currentUser}) => recipientProvider.removeChat(currentUser, chatId),
    // We also need to create the recipients
    addMessage: async (obj, {chatId, content}, {user: currentUser}) =>
      recipientProvider.addMessage(currentUser, chatId, content),
    // We may also need to remove the recipients
    removeMessages: async (obj, {chatId, messageIds, all}, {user: currentUser}) =>
      recipientProvider.removeMessages(currentUser, chatId, {
        messageIds: messageIds || undefined,
        all: all || false,
      }),
  },
  Chat: {
    unreadMessages: async (chat, args, {user: currentUser}) =>
      recipientProvider.getChatUnreadMessagesCount(currentUser, chat),
  },
  Message: {
    recipients: async (message: Message, args, {user: currentUser}) =>
      recipientProvider.getMessageRecipients(currentUser, message),
  },
  Recipient: {},
}));

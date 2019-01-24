import { InjectFunction } from '@graphql-modules/di';
import { PubSub } from "apollo-server-express";
import { withFilter } from 'apollo-server-express';
import { User } from "../../../entity/User";
import { Message } from "../../../entity/Message";
import { IResolvers } from "../../../types/message";
import { MessageProvider } from "../providers/message.provider";

export default InjectFunction(PubSub, MessageProvider)((pubsub, messageProvider): IResolvers => ({
  Query: {
    // The ordering depends on the messages
    chats: (obj, args, {user: currentUser}) => messageProvider.getChats(currentUser),
  },
  Mutation: {
    addMessage: async (obj, {chatId, content}, {user: currentUser}) =>
      messageProvider.addMessage(currentUser, chatId, content),
    removeMessages: async (obj, {chatId, messageIds, all}, {user: currentUser}) =>
      messageProvider.removeMessages(currentUser, chatId, {
        messageIds: messageIds || undefined,
        all: all || false,
      }),
    // We may need to also remove the messages
    removeChat: async (obj, {chatId}, {user: currentUser}) => messageProvider.removeChat(currentUser, chatId),
  },
  Subscription: {
    messageAdded: {
      subscribe: withFilter(() => pubsub.asyncIterator('messageAdded'),
        ({messageAdded}: { messageAdded: Message }, variables, {user: currentUser}: { user: User }) =>
          messageProvider.filterMessageAdded(currentUser, messageAdded)
      ),
    },
  },
  Chat: {
    messages: async (chat, {amount}, {user: currentUser}) =>
      messageProvider.getChatMessages(currentUser, chat, amount || 0),
    updatedAt: async (chat, args, {user: currentUser}) => messageProvider.getChatUpdatedAt(currentUser, chat),
  },
  Message: {
    sender: async (message, args, {user: currentUser}) =>
      messageProvider.getMessageSender(currentUser, message),
    ownership: async (message, args, {user: currentUser}) =>
      messageProvider.getMessageOwnership(currentUser, message),
    holders: async (message, args, {user: currentUser}) =>
      messageProvider.getMessageHolders(currentUser, message),
    chat: async (message, args, {user: currentUser}) => messageProvider.getMessageChat(currentUser, message),
  },
}));

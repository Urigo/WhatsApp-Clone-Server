import { PubSub } from 'apollo-server-express';
import { withFilter } from 'apollo-server-express';
import { Message } from '../../../entity/Message';
import { IResolvers } from '../../../types';
import { MessageProvider } from '../providers/message.provider';
import { ModuleContext } from '@graphql-modules/core';

export default {
  Query: {
    // The ordering depends on the messages
    chats: (obj, args, { injector }) => injector.get(MessageProvider).getChats(),
  },
  Mutation: {
    addMessage: async (obj, { chatId, content }, { injector }) =>
      injector.get(MessageProvider).addMessage(chatId, content),
    removeMessages: async (obj, { chatId, messageIds, all }, { injector }) =>
      injector.get(MessageProvider).removeMessages(chatId, {
        messageIds: messageIds || undefined,
        all: all || false,
      }),
    // We may need to also remove the messages
    removeChat: async (obj, { chatId }, { injector }) => injector.get(MessageProvider).removeChat(chatId),
  },
  Subscription: {
    messageAdded: {
      subscribe: withFilter((root, args, { injector }: ModuleContext) => injector.get(PubSub).asyncIterator('messageAdded'),
        (data: { messageAdded: Message }, variables, { injector }: ModuleContext) => data && injector.get(MessageProvider).filterMessageAdded(data.messageAdded)
      ),
    },
  },
  Chat: {
    messages: async (chat, { amount }, { injector }) =>
      injector.get(MessageProvider).getChatMessages(chat, amount || 0),
    lastMessage: async (chat, args, { injector }) =>
      injector.get(MessageProvider).getChatLastMessage(chat),
    updatedAt: async (chat, args, { injector }) => injector.get(MessageProvider).getChatUpdatedAt(chat),
  },
  Message: {
    sender: async (message, args, { injector }) =>
      injector.get(MessageProvider).getMessageSender(message),
    ownership: async (message, args, { injector }) =>
      injector.get(MessageProvider).getMessageOwnership(message),
    holders: async (message, args, { injector }) =>
      injector.get(MessageProvider).getMessageHolders(message),
    chat: async (message, args, { injector }) => injector.get(MessageProvider).getMessageChat(message),
  },
} as IResolvers;

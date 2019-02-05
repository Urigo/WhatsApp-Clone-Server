import { ModuleContext } from '@graphql-modules/core'
import { Message } from '../../../entity/message'
import { IResolvers } from '../../../types'
import { MessageProvider } from '../providers/message.provider'

export default {
  Query: {
    // The ordering depends on the messages
    chats: (obj, args, { injector }) => injector.get(MessageProvider).getChats(),
  },
  Chat: {
    messages: async (chat, { amount }, { injector }) =>
      injector.get(MessageProvider).getChatMessages(chat, amount || 0),
    lastMessage: async (chat, args, { injector }) =>
      injector.get(MessageProvider).getChatLastMessage(chat),
    updatedAt: async (chat, args, { injector }) =>
      injector.get(MessageProvider).getChatUpdatedAt(chat),
  },
  Message: {
    sender: async (message, args, { injector }) =>
      injector.get(MessageProvider).getMessageSender(message),
    ownership: async (message, args, { injector }) =>
      injector.get(MessageProvider).getMessageOwnership(message),
    holders: async (message, args, { injector }) =>
      injector.get(MessageProvider).getMessageHolders(message),
    chat: async (message, args, { injector }) =>
      injector.get(MessageProvider).getMessageChat(message),
  },
} as IResolvers

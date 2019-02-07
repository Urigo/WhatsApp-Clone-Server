import { PubSub, withFilter } from 'apollo-server-express'
import { ModuleContext } from '@graphql-modules/core'
import { IResolvers } from '../../../types'
import { ChatProvider } from '../providers/chat.provider'
import { Chat } from '../../../entity/chat'

export default {
  Query: {
    chats: (obj, args, { injector }) => injector.get(ChatProvider).getChats(),
    chat: (obj, { chatId }, { injector }) => injector.get(ChatProvider).getChat(chatId),
  },
  Mutation: {
    updateUser: (obj, { name, picture }, { injector }) => injector.get(ChatProvider).updateUser({
      name: name || '',
      picture: picture || '',
    }),
    addChat: (obj, { userId }, { injector }) => injector.get(ChatProvider).addChat(userId),
    removeChat: (obj, { chatId }, { injector }) => injector.get(ChatProvider).removeChat(chatId),
  },
  Subscription: {
    chatAdded: {
      subscribe: withFilter((root, args, { injector }: ModuleContext) => injector.get(PubSub).asyncIterator('chatAdded'),
        (data: { chatAdded: Chat, creatorId: string }, variables, { injector }: ModuleContext) =>
          data && injector.get(ChatProvider).filterChatAddedOrUpdated(data.chatAdded, data.creatorId)
      ),
    },
    chatUpdated: {
      subscribe: withFilter((root, args, { injector }: ModuleContext) => injector.get(PubSub).asyncIterator('chatUpdated'),
        (data: { chatUpdated: Chat, updaterId: string }, variables, { injector }: ModuleContext) =>
          data && injector.get(ChatProvider).filterChatAddedOrUpdated(data.chatUpdated, data.updaterId)
      ),
    },
  },
  Chat: {
    name: (chat, args, { injector }) => injector.get(ChatProvider).getChatName(chat),
    picture: (chat, args, { injector }) => injector.get(ChatProvider).getChatPicture(chat),
    allTimeMembers: (chat, args, { injector }) =>
      injector.get(ChatProvider).getChatAllTimeMembers(chat),
    listingMembers: (chat, args, { injector }) =>
      injector.get(ChatProvider).getChatListingMembers(chat),
    owner: (chat, args, { injector }) => injector.get(ChatProvider).getChatOwner(chat),
  },
} as IResolvers

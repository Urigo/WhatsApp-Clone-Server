import { ModuleContext } from '@graphql-modules/core'
import { IResolvers } from '../../../types'
import { ChatProvider } from '../providers/chat.provider'

export default {
  Query: {
    chats: (obj, args, { injector }) => injector.get(ChatProvider).getChats(),
    chat: (obj, { chatId }, { injector }) => injector.get(ChatProvider).getChat(chatId),
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

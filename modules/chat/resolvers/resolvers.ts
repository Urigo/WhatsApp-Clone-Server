import { PubSub, withFilter } from 'apollo-server-express';
import { Chat } from '../../../entity/Chat';
import { IResolvers } from '../../../types';
import { ChatProvider } from '../providers/chat.provider';
import { ModuleContext } from '@graphql-modules/core';

export default {
  Query: {
    chats: (obj, args, { injector }) => injector.get(ChatProvider).getChats(),
    chat: (obj, { chatId }, { injector }) => injector.get(ChatProvider).getChat(chatId),
  },
  Mutation: {
    addChat: (obj, { userId }, { injector }) => injector.get(ChatProvider).addChat(userId),
    addGroup: (obj, { userIds, groupName, groupPicture }, { injector }) =>
      injector.get(ChatProvider).addGroup(userIds, {
        groupName: groupName || '',
        groupPicture: groupPicture || '',
      }),
    updateGroup: (obj, { chatId, groupName, groupPicture }, { injector }) => injector.get(ChatProvider).updateGroup(chatId, {
      groupName: groupName || '',
      groupPicture: groupPicture || '',
    }),
    removeChat: (obj, { chatId }, { injector }) => injector.get(ChatProvider).removeChat(chatId),
    updateUser: (obj, { name, picture }, { injector }) => injector.get(ChatProvider).updateUser({
      name: name || '',
      picture: picture || '',
    }),
  },
  Subscription: {
    chatAdded: {
      subscribe: withFilter((root, args, { injector }: ModuleContext) => injector.get(PubSub).asyncIterator('chatAdded'),
        (data: { chatAdded: Chat, creatorId: number }, variables, { injector }: ModuleContext) =>
          data && injector.get(ChatProvider).filterChatAddedOrUpdated(data.chatAdded, data.creatorId)
      ),
    },
    chatUpdated: {
      subscribe: withFilter((root, args, { injector }: ModuleContext) => injector.get(PubSub).asyncIterator('chatUpdated'),
        (data: { chatUpdated: Chat, updaterId: number }, variables, { injector }: ModuleContext) =>
          data && injector.get(ChatProvider).filterChatAddedOrUpdated(data.chatUpdated, data.updaterId)
      ),
    },
  },
  Chat: {
    name: (chat, args, { injector }) => injector.get(ChatProvider).getChatName(chat),
    picture: (chat, args, { injector }) => injector.get(ChatProvider).getChatPicture(chat),
    allTimeMembers: (chat, args, { injector }) => injector.get(ChatProvider).getChatAllTimeMembers(chat),
    listingMembers: (chat, args, { injector }) => injector.get(ChatProvider).getChatListingMembers(chat),
    actualGroupMembers: (chat, args, { injector }) => injector.get(ChatProvider).getChatActualGroupMembers(chat),
    admins: (chat, args, { injector }) => injector.get(ChatProvider).getChatAdmins(chat),
    owner: (chat, args, { injector }) => injector.get(ChatProvider).getChatOwner(chat),
    isGroup: (chat, args, { injector }) => injector.get(ChatProvider).isChatGroup(chat),
  },
} as IResolvers;

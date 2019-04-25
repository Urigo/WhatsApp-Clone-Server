import { PubSub, withFilter } from 'apollo-server-express';

import { Chat } from '../../../entity/Chat';
import { ChatProvider } from '../providers/chat.provider';
import { IResolvers } from '../../../types';
import { ModuleContext } from '@graphql-modules/core';

export default {
    Query: {
        chats: (obj: any, args: any, { injector }: any) => injector.get(ChatProvider).getChats(),
        chat: (obj: any, { chatId }: any, { injector }: any) => injector.get(ChatProvider).getChat(chatId),
    },
    Mutation: {
        addChat: (obj: any, { userId }: any, { injector }: any) => injector.get(ChatProvider).addChat(userId),
        addGroup: (obj: any, { userIds, groupName, groupPicture }: any, { injector }: any) =>
            injector.get(ChatProvider).addGroup(userIds, {
                groupName: groupName || '',
                groupPicture: groupPicture || '',
            }),
        updateGroup: (obj: any, { chatId, groupName, groupPicture }: any, { injector }: any) => injector.get(ChatProvider).updateGroup(chatId, {
            groupName: groupName || '',
            groupPicture: groupPicture || '',
        }),
        removeChat: (obj: any, { chatId }: any, { injector }: any) => injector.get(ChatProvider).removeChat(chatId),
        updateUser: (obj: any, { name, picture }: any, { injector }: any) => injector.get(ChatProvider).updateUser({
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
        name: (chat: any, args: any, { injector }: any) => injector.get(ChatProvider).getChatName(chat),
        picture: (chat: any, args: any, { injector }: any) => injector.get(ChatProvider).getChatPicture(chat),
        allTimeMembers: (chat: any, args: any, { injector }: any) => injector.get(ChatProvider).getChatAllTimeMembers(chat),
        listingMembers: (chat: any, args: any, { injector }: any) => injector.get(ChatProvider).getChatListingMembers(chat),
        actualGroupMembers: (chat: any, args: any, { injector }: any) => injector.get(ChatProvider).getChatActualGroupMembers(chat),
        admins: (chat: any, args: any, { injector }: any) => injector.get(ChatProvider).getChatAdmins(chat),
        owner: (chat: any, args: any, { injector }: any) => injector.get(ChatProvider).getChatOwner(chat),
        isGroup: (chat: any, args: any, { injector }: any) => injector.get(ChatProvider).isChatGroup(chat),
    },
} as unknown as IResolvers;

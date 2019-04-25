"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const chat_provider_1 = require("../providers/chat.provider");
exports.default = {
    Query: {
        chats: (obj, args, { injector }) => injector.get(chat_provider_1.ChatProvider).getChats(),
        chat: (obj, { chatId }, { injector }) => injector.get(chat_provider_1.ChatProvider).getChat(chatId),
    },
    Mutation: {
        addChat: (obj, { userId }, { injector }) => injector.get(chat_provider_1.ChatProvider).addChat(userId),
        addGroup: (obj, { userIds, groupName, groupPicture }, { injector }) => injector.get(chat_provider_1.ChatProvider).addGroup(userIds, {
            groupName: groupName || '',
            groupPicture: groupPicture || '',
        }),
        updateGroup: (obj, { chatId, groupName, groupPicture }, { injector }) => injector.get(chat_provider_1.ChatProvider).updateGroup(chatId, {
            groupName: groupName || '',
            groupPicture: groupPicture || '',
        }),
        removeChat: (obj, { chatId }, { injector }) => injector.get(chat_provider_1.ChatProvider).removeChat(chatId),
        updateUser: (obj, { name, picture }, { injector }) => injector.get(chat_provider_1.ChatProvider).updateUser({
            name: name || '',
            picture: picture || '',
        }),
    },
    Subscription: {
        chatAdded: {
            subscribe: apollo_server_express_1.withFilter((root, args, { injector }) => injector.get(apollo_server_express_1.PubSub).asyncIterator('chatAdded'), (data, variables, { injector }) => data && injector.get(chat_provider_1.ChatProvider).filterChatAddedOrUpdated(data.chatAdded, data.creatorId)),
        },
        chatUpdated: {
            subscribe: apollo_server_express_1.withFilter((root, args, { injector }) => injector.get(apollo_server_express_1.PubSub).asyncIterator('chatUpdated'), (data, variables, { injector }) => data && injector.get(chat_provider_1.ChatProvider).filterChatAddedOrUpdated(data.chatUpdated, data.updaterId)),
        },
    },
    Chat: {
        name: (chat, args, { injector }) => injector.get(chat_provider_1.ChatProvider).getChatName(chat),
        picture: (chat, args, { injector }) => injector.get(chat_provider_1.ChatProvider).getChatPicture(chat),
        allTimeMembers: (chat, args, { injector }) => injector.get(chat_provider_1.ChatProvider).getChatAllTimeMembers(chat),
        listingMembers: (chat, args, { injector }) => injector.get(chat_provider_1.ChatProvider).getChatListingMembers(chat),
        actualGroupMembers: (chat, args, { injector }) => injector.get(chat_provider_1.ChatProvider).getChatActualGroupMembers(chat),
        admins: (chat, args, { injector }) => injector.get(chat_provider_1.ChatProvider).getChatAdmins(chat),
        owner: (chat, args, { injector }) => injector.get(chat_provider_1.ChatProvider).getChatOwner(chat),
        isGroup: (chat, args, { injector }) => injector.get(chat_provider_1.ChatProvider).isChatGroup(chat),
    },
};

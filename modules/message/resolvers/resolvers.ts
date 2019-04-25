import { IResolvers } from '../../../types';
import { Message } from '../../../entity/Message';
import { MessageProvider } from '../providers/message.provider';
import { ModuleContext } from '@graphql-modules/core';
import { PubSub } from 'apollo-server-express';
import { withFilter } from 'apollo-server-express';

export default {
    Query: {
        // The ordering depends on the messages
        chats: (obj: any, args: any, { injector }: any) => injector.get(MessageProvider).getChats(),
    },
    Mutation: {
        addMessage: async (obj: any, { chatId, content }: any, { injector }: any) =>
            injector.get(MessageProvider).addMessage(chatId, content),
        removeMessages: async (obj: any, { chatId, messageIds, all }: any, { injector }: any) =>
            injector.get(MessageProvider).removeMessages(chatId, {
                messageIds: messageIds || undefined,
                all: all || false,
            }),
        // We may need to also remove the messages
        removeChat: async (obj: any, { chatId }: any, { injector }: any) => injector.get(MessageProvider).removeChat(chatId),
    },
    Subscription: {
        messageAdded: {
            subscribe: withFilter((root, args, { injector }: ModuleContext) => injector.get(PubSub).asyncIterator('messageAdded'),
                (data: { messageAdded: Message }, variables, { injector }: ModuleContext) => data && injector.get(MessageProvider).filterMessageAdded(data.messageAdded)
            ),
        },
    },
    Chat: {
        messages: async (chat: any, { amount }: any, { injector }: any) =>
            injector.get(MessageProvider).getChatMessages(chat, amount || 0),
        lastMessage: async (chat: any, args: any, { injector }: any) =>
            injector.get(MessageProvider).getChatLastMessage(chat),
        updatedAt: async (chat: any, args: any, { injector }: any) => injector.get(MessageProvider).getChatUpdatedAt(chat),
    },
    Message: {
        sender: async (message: any, args: any, { injector }: any) =>
            injector.get(MessageProvider).getMessageSender(message),
        ownership: async (message: any, args: any, { injector }: any) =>
            injector.get(MessageProvider).getMessageOwnership(message),
        holders: async (message: any, args: any, { injector }: any) =>
            injector.get(MessageProvider).getMessageHolders(message),
        chat: async (message: any, args: any, { injector }: any) => injector.get(MessageProvider).getMessageChat(message),
    },
} as unknown as IResolvers;

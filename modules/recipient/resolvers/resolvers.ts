import { IResolvers } from '../../../types';
import { RecipientProvider } from '../providers/recipient.provider';

export default {
    Mutation: {
        // TODO: implement me
        markAsReceived: async (obj: any, { chatId }: any) => false,
        // TODO: implement me
        markAsRead: async (obj: any, { chatId }: any) => false,
        // We may also need to remove the recipients
        removeChat: async (obj: any, { chatId }: any, { injector }: any) => injector.get(RecipientProvider).removeChat(chatId),
        // We also need to create the recipients
        addMessage: async (obj: any, { chatId, content }: any, { injector }: any) => injector.get(RecipientProvider).addMessage(chatId, content),
        // We may also need to remove the recipients
        removeMessages: async (obj: any, { chatId, messageIds, all }: any, { injector }: any) => injector.get(RecipientProvider).removeMessages(chatId, {
            messageIds: messageIds || undefined,
            all: all || false,
        }),
    },
    Chat: {
        unreadMessages: async (chat: any, args: any, { injector }: any) => injector.get(RecipientProvider).getChatUnreadMessagesCount(chat),
    },
    Message: {
        recipients: async (message: any, args: any, { injector }: any) => injector.get(RecipientProvider).getMessageRecipients(message),
    },
    Recipient: {
        chat: async (recipient: any, args: any, { injector }: any) => injector.get(RecipientProvider).getRecipientChat(recipient),
    },
} as unknown as IResolvers;

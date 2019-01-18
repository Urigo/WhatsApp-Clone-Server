import { Inject } from '@graphql-modules/di'
import { PubSub, withFilter } from 'apollo-server-express';
import { IResolvers, MessageAddedSubscriptionArgs } from "../../../types";
import { User } from "../../../entity/User";
import { Chat } from "../../../entity/Chat";
import { Message } from "../../../entity/Message";
import { Recipient } from "../../../entity/Recipient";

export default Inject(PubSub)((pubsub): IResolvers => ({
  Mutation: {
    markAsReceived: async (obj, {chatId}, {user: currentUser, connection}) => false,
    markAsRead: async (obj, {chatId}, {user: currentUser, connection}) => false,
  },
  Subscription: {
    messageAdded: {
      subscribe: withFilter(() => pubsub.asyncIterator('messageAdded'),
        ({messageAdded}: {messageAdded: Message}, {chatId}: MessageAddedSubscriptionArgs, {user: currentUser}: { user: User }) => {
          return (!chatId || messageAdded.chat.id === Number(chatId)) &&
            !!messageAdded.recipients.find((recipient: Recipient) => recipient.user.id === currentUser.id);
        }),
    },
    chatAdded: {
      subscribe: withFilter(() => pubsub.asyncIterator('chatAdded'),
        ({creatorId, chatAdded}: {creatorId: string, chatAdded: Chat}, variables, {user: currentUser}: { user: User }) => {
          return Number(creatorId) !== currentUser.id &&
            !!chatAdded.listingMembers.find((user: User) => user.id === currentUser.id);
        }),
    }
  },
  Recipient: {},
  Message: {
    recipients: async (message: Message, args, {user: currentUser, connection}) => {
      return await connection
        .createQueryBuilder(Recipient, "recipient")
        .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {messageId: message.id})
        .innerJoinAndSelect('recipient.user', 'user')
        .innerJoinAndSelect('recipient.chat', 'chat')
        .getMany();
    },
  },
}));

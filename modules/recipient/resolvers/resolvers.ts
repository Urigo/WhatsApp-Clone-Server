import { Message } from "../../../entity/Message";
import { Recipient } from "../../../entity/Recipient";
import { IResolvers } from "../../../types/recipient";

export default ((): IResolvers => ({
  Mutation: {
    markAsReceived: async (obj, {chatId}, {user: currentUser, connection}) => false,
    markAsRead: async (obj, {chatId}, {user: currentUser, connection}) => false,
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

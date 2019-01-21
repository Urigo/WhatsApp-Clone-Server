import { Message } from "../../../entity/Message";
import { Recipient } from "../../../entity/Recipient";
import { IResolvers } from "../../../types/recipient";
import { MessageModule } from "../../message";

export default ((): IResolvers => ({
  Mutation: {
    markAsReceived: async (obj, {chatId}, {user: currentUser, connection}) => false,
    markAsRead: async (obj, {chatId}, {user: currentUser, connection}) => false,
    removeChat: async (root, args, context, info) => {
      console.log("RecipientModule's removeChat");
      const {user: currentUser, connection} = context;
      const {chatId} = args;

      const messages = await connection
        .createQueryBuilder(Message, "message")
        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', {chatId})
        .leftJoinAndSelect('message.holders', 'holders')
        .getMany();

      for (let message of messages) {
        message.holders = message.holders.filter(user => user.id !== currentUser.id);

        if (message.holders.filter(user => user.id !== currentUser.id).length === 0) {
          const recipients = await connection
            .createQueryBuilder(Recipient, "recipient")
            .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {messageId: message.id})
            .innerJoinAndSelect('recipient.user', 'user')
            .getMany();

          for (let recipient of recipients) {
            await connection.getRepository(Recipient).remove(recipient);
          }
        }
      }

      const { resolvers: { Mutation } } = MessageModule;
      return await (<any>Mutation).removeChat(root, args, context, info);
    },
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

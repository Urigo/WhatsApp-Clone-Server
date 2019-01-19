import { Message } from "../../../entity/Message";
import { Recipient } from "../../../entity/Recipient";
import { IResolvers } from "../../../types";
import { Connection } from "typeorm";
import { InjectFunction } from "@graphql-modules/di";

export default InjectFunction(Connection)((connection): IResolvers => ({
  Mutation: {
    markAsReceived: async () => false,
    markAsRead: async () => false,
  },
  Recipient: {},
  Message: {
    recipients: async (message: Message) => {
      return await connection
        .createQueryBuilder(Recipient, "recipient")
        .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {messageId: message.id})
        .innerJoinAndSelect('recipient.user', 'user')
        .innerJoinAndSelect('recipient.chat', 'chat')
        .getMany();
    },
  },
}));

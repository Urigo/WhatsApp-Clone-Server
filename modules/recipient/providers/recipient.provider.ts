import { Injectable } from '@graphql-modules/di'
import { PubSub } from 'apollo-server-express'
import { Connection } from 'typeorm'
import { MessageProvider } from "../../message/providers/message.provider";
import { User } from "../../../entity/User";
import { Chat } from "../../../entity/Chat";
import { Message } from "../../../entity/Message";
import { Recipient } from "../../../entity/Recipient";

@Injectable()
export class RecipientProvider {
  constructor(
    private pubsub: PubSub,
    private connection: Connection,
    private messageProvider: MessageProvider,
  ) {
  }

  getChatUnreadMessagesCount(currentUser: User, chat: Chat) {
    return this.connection
      .createQueryBuilder(Message, "message")
      .innerJoin('message.chat', 'chat', 'chat.id = :chatId', {chatId: chat.id})
      .innerJoin('message.recipients', 'recipients', 'recipients.user.id = :userId AND recipients.readAt IS NULL', {
        userId: currentUser.id
      })
      .getCount();
  }

  async getMessageRecipients(currentUser: User, message: Message) {
    return await this.connection
      .createQueryBuilder(Recipient, 'recipient')
      .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {
        messageId: message.id,
      })
      .innerJoinAndSelect('recipient.user', 'user')
      .innerJoinAndSelect('recipient.chat', 'chat')
      .getMany();
  }

  async removeChat(currentUser: User, chatId: string) {
    console.log("DEBUG: RecipientModule's removeChat");

    const messages = await this.messageProvider._removeChatGetMessages(currentUser, chatId);

    for (let message of messages) {
      if (message.holders.length === 0) {
        const recipients = await this.connection
          .createQueryBuilder(Recipient, "recipient")
          .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {messageId: message.id})
          .innerJoinAndSelect('recipient.user', 'user')
          .getMany();

        for (let recipient of recipients) {
          await this.connection.getRepository(Recipient).remove(recipient);
        }
      }
    }

    return await this.messageProvider.removeChat(currentUser, chatId, messages);
  }

  async addMessage(currentUser: User, chatId: string, content: string) {
    console.log("DEBUG: RecipientModule's addMessage");

    const message = await this.messageProvider.addMessage(currentUser, chatId, content);

    for (let user of message.holders) {
      if (user.id !== currentUser.id) {
        await this.connection.getRepository(Recipient).save(new Recipient({user, message}));
      }
    }

    return message;
  }

  async removeMessages(
    currentUser: User,
    chatId: string,
    {
      messageIds,
      all,
    }: {
      messageIds?: string[]
      all?: boolean
    } = {},
  ) {
    const {deletedIds, removedMessages} = await this.messageProvider._removeMessages(currentUser, chatId, {messageIds, all});

    for (let message of removedMessages) {
      const recipients = await this.connection
        .createQueryBuilder(Recipient, 'recipient')
        .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {messageId: message.id})
        .innerJoinAndSelect('recipient.user', 'user')
        .getMany();

      for (let recipient of recipients) {
        await this.connection.getRepository(Recipient).remove(recipient);
      }

      await this.connection.getRepository(Message).remove(message);
    }

    return deletedIds;
  }
}

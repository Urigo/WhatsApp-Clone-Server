import { Injectable, ProviderScope } from '@graphql-modules/di'
import { Connection } from 'typeorm'
import { MessageProvider } from "../../message/providers/message.provider";
import { Chat } from "../../../entity/Chat";
import { Message } from "../../../entity/Message";
import { Recipient } from "../../../entity/Recipient";
import { CurrentUserProvider } from '../../auth/providers/current-user.provider';

@Injectable({
  scope: ProviderScope.Session,
})
export class RecipientProvider {
  constructor(
    private currentUserProvider: CurrentUserProvider,
    private connection: Connection,
    private messageProvider: MessageProvider,
  ) {
  }

  getChatUnreadMessagesCount(chat: Chat) {
    const { currentUser } = this.currentUserProvider;
    return this.connection
      .createQueryBuilder(Message, "message")
      .innerJoin('message.chat', 'chat', 'chat.id = :chatId', {chatId: chat.id})
      .innerJoin('message.recipients', 'recipients', 'recipients.user.id = :userId AND recipients.readAt IS NULL', {
        userId: currentUser.id
      })
      .getCount();
  }

  async getMessageRecipients(message: Message) {
    return await this.connection
      .createQueryBuilder(Recipient, 'recipient')
      .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {
        messageId: message.id,
      })
      .innerJoinAndSelect('recipient.user', 'user')
      .innerJoinAndSelect('recipient.chat', 'chat')
      .getMany();
  }

  async removeChat(chatId: string) {
    console.log("DEBUG: RecipientModule's removeChat");

    const messages = await this.messageProvider._removeChatGetMessages(chatId);

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

    return await this.messageProvider.removeChat(chatId, messages);
  }

  async addMessage(chatId: string, content: string) {
    const { currentUser } = this.currentUserProvider;
    console.log("DEBUG: RecipientModule's addMessage");

    const message = await this.messageProvider.addMessage(chatId, content);

    for (let user of message.holders) {
      if (user.id !== currentUser.id) {
        await this.connection.getRepository(Recipient).save(new Recipient({user, message}));
      }
    }

    return message;
  }

  async removeMessages(
    chatId: string,
    {
      messageIds,
      all,
    }: {
      messageIds?: string[]
      all?: boolean
    } = {},
  ) {
    const {deletedIds, removedMessages} = await this.messageProvider._removeMessages(chatId, {messageIds, all});

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

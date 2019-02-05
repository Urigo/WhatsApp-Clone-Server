import { Injectable } from '@graphql-modules/di'
import { Connection } from 'typeorm'
import { MessageType } from '../../../db'
import { Chat } from '../../../entity/chat'
import { Message } from '../../../entity/message'
import { User } from '../../../entity/user'
import { AuthProvider } from '../../auth/providers/auth.provider'
import { ChatProvider } from '../../chat/providers/chat.provider'
import { UserProvider } from '../../user/providers/user.provider'

@Injectable()
export class MessageProvider {
  constructor(
    private connection: Connection,
    private chatProvider: ChatProvider,
    private authProvider: AuthProvider,
    private userProvider: UserProvider
  ) {}

  repository = this.connection.getRepository(Message)
  currentUser = this.authProvider.currentUser

  createQueryBuilder() {
    return this.connection.createQueryBuilder(Message, 'message')
  }

  async getMessageSender(message: Message) {
    const sender = await this.userProvider
      .createQueryBuilder()
      .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {
        messageId: message.id,
      })
      .getOne()

    if (!sender) {
      throw new Error(`Message must have a sender.`)
    }

    return sender
  }

  async getMessageOwnership(message: Message) {
    return !!(await this.userProvider
      .createQueryBuilder()
      .whereInIds(this.currentUser.id)
      .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {
        messageId: message.id,
      })
      .getCount())
  }

  async getMessageHolders(message: Message) {
    return await this.userProvider
      .createQueryBuilder()
      .innerJoin('user.holderMessages', 'holderMessages', 'holderMessages.id = :messageId', {
        messageId: message.id,
      })
      .getMany()
  }

  async getMessageChat(message: Message) {
    const chat = await this.chatProvider
      .createQueryBuilder()
      .innerJoin('chat.messages', 'messages', 'messages.id = :messageId', {
        messageId: message.id,
      })
      .getOne()

    if (!chat) {
      throw new Error(`Message must have a chat.`)
    }

    return chat
  }

  async getChats() {
    const chats = await this.chatProvider
      .createQueryBuilder()
      .leftJoin('chat.listingMembers', 'listingMembers')
      .where('listingMembers.id = :id', { id: this.currentUser.id })
      .getMany()

    for (let chat of chats) {
      chat.messages = await this.getChatMessages(chat)
    }

    return chats.sort((chatA, chatB) => {
      const dateA = chatA.messages.length
        ? chatA.messages[chatA.messages.length - 1].createdAt
        : chatA.createdAt
      const dateB = chatB.messages.length
        ? chatB.messages[chatB.messages.length - 1].createdAt
        : chatB.createdAt
      return dateB.valueOf() - dateA.valueOf()
    })
  }

  async getChatMessages(chat: Chat, amount?: number) {
    if (chat.messages) {
      return amount ? chat.messages.slice(-amount) : chat.messages
    }

    let query = this.createQueryBuilder()
      .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId: chat.id })
      .innerJoin('message.holders', 'holders', 'holders.id = :userId', {
        userId: this.currentUser.id,
      })
      .orderBy({ 'message.createdAt': { order: 'DESC', nulls: 'NULLS LAST' } })

    if (amount) {
      query = query.take(amount)
    }

    return (await query.getMany()).reverse()
  }

  async getChatLastMessage(chat: Chat) {
    if (chat.messages) {
      return chat.messages.length ? chat.messages[chat.messages.length - 1] : null
    }

    const messages = await this.getChatMessages(chat, 1)

    return messages && messages.length ? messages[0] : null
  }

  async getChatUpdatedAt(chat: Chat) {
    if (chat.messages) {
      return chat.messages.length ? chat.messages[0].createdAt : null
    }

    const latestMessage = await this.createQueryBuilder()
      .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId: chat.id })
      .innerJoin('message.holders', 'holders', 'holders.id = :userId', {
        userId: this.currentUser.id,
      })
      .orderBy({ 'message.createdAt': 'DESC' })
      .getOne()

    return latestMessage ? latestMessage.createdAt : null
  }
}

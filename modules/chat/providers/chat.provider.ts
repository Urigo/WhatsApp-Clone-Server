import { Injectable } from '@graphql-modules/di'
import { Connection } from 'typeorm'
import { Chat } from '../../../entity/chat'
import { User } from '../../../entity/user'
import { AuthProvider } from '../../auth/providers/auth.provider'
import { UserProvider } from '../../user/providers/user.provider'

@Injectable()
export class ChatProvider {
  constructor(
    private connection: Connection,
    private userProvider: UserProvider,
    private authProvider: AuthProvider
  ) {}

  repository = this.connection.getRepository(Chat)
  currentUser = this.authProvider.currentUser

  createQueryBuilder() {
    return this.connection.createQueryBuilder(Chat, 'chat')
  }

  async getChats() {
    return this.createQueryBuilder()
      .leftJoin('chat.listingMembers', 'listingMembers')
      .where('listingMembers.id = :id', { id: this.currentUser.id })
      .orderBy('chat.createdAt', 'DESC')
      .getMany()
  }

  async getChat(chatId: string) {
    const chat = await this.createQueryBuilder()
      .whereInIds(chatId)
      .getOne()

    return chat || null
  }

  async getChatName(chat: Chat) {
    if (chat.name) {
      return chat.name
    }

    const user = await this.userProvider
      .createQueryBuilder()
      .where('user.id != :userId', { userId: this.currentUser.id })
      .innerJoin(
        'user.allTimeMemberChats',
        'allTimeMemberChats',
        'allTimeMemberChats.id = :chatId',
        { chatId: chat.id }
      )
      .getOne()

    return (user && user.name) || null
  }

  async getChatPicture(chat: Chat) {
    if (chat.name) {
      return chat.picture
    }

    const user = await this.userProvider
      .createQueryBuilder()
      .where('user.id != :userId', { userId: this.currentUser.id })
      .innerJoin(
        'user.allTimeMemberChats',
        'allTimeMemberChats',
        'allTimeMemberChats.id = :chatId',
        { chatId: chat.id }
      )
      .getOne()

    return user ? user.picture : null
  }

  getChatAllTimeMembers(chat: Chat) {
    return this.userProvider
      .createQueryBuilder()
      .innerJoin(
        'user.listingMemberChats',
        'listingMemberChats',
        'listingMemberChats.id = :chatId',
        { chatId: chat.id }
      )
      .getMany()
  }

  getChatListingMembers(chat: Chat) {
    return this.userProvider
      .createQueryBuilder()
      .innerJoin(
        'user.listingMemberChats',
        'listingMemberChats',
        'listingMemberChats.id = :chatId',
        { chatId: chat.id }
      )
      .getMany()
  }

  async getChatOwner(chat: Chat) {
    const owner = await this.userProvider
      .createQueryBuilder()
      .innerJoin('user.ownerChats', 'ownerChats', 'ownerChats.id = :chatId', {
        chatId: chat.id,
      })
      .getOne()

    return owner || null
  }
}

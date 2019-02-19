import { Injectable } from '@graphql-modules/di'
import { PubSub } from 'apollo-server-express'
import { Connection } from 'typeorm'
import { User } from '../../../entity/User';
import { Chat } from '../../../entity/Chat';
import { UserProvider } from '../../user/providers/user.provider';
import { AuthProvider } from '../../auth/providers/auth.provider';

@Injectable()
export class ChatProvider {
  constructor(
    private pubsub: PubSub,
    private connection: Connection,
    private userProvider: UserProvider,
    private authProvider: AuthProvider,
  ) {
  }

  repository = this.connection.getRepository(Chat);
  currentUser = this.authProvider.currentUser;

  createQueryBuilder() {
    return this.connection.createQueryBuilder(Chat, 'chat');
  }

  async getChats() {
    return this
      .createQueryBuilder()
      .leftJoin('chat.listingMembers', 'listingMembers')
      .where('listingMembers.id = :id', { id: this.currentUser.id })
      .orderBy('chat.createdAt', 'DESC')
      .getMany();
  }

  async getChat(chatId: string) {
    const chat = await this
      .createQueryBuilder()
      .whereInIds(chatId)
      .getOne();

    return chat || null;
  }

  async addChat(userId: string) {
    const user = await this.userProvider
      .createQueryBuilder()
      .whereInIds(userId)
      .getOne();

    if (!user) {
      throw new Error(`User ${userId} doesn't exist.`);
    }

    let chat = await this
      .createQueryBuilder()
      .where('chat.name IS NULL')
      .innerJoin('chat.allTimeMembers', 'allTimeMembers1', 'allTimeMembers1.id = :currentUserId', {
        currentUserId: this.currentUser.id,
      })
      .innerJoin('chat.allTimeMembers', 'allTimeMembers2', 'allTimeMembers2.id = :userId', {
        userId: userId,
      })
      .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
      .getOne();

    if (chat) {
      // Chat already exists. Both users are already in the userIds array
      const listingMembers = await this.userProvider
        .createQueryBuilder()
        .innerJoin(
          'user.listingMemberChats',
          'listingMemberChats',
          'listingMemberChats.id = :chatId',
          { chatId: chat.id },
        )
        .getMany();

      if (!listingMembers.find(user => user.id === this.currentUser.id)) {
        // The chat isn't listed for the current user. Add him to the memberIds
        chat.listingMembers.push(this.currentUser);
        chat = await this.repository.save(chat);

        return chat || null;
      } else {
        return chat;
      }
    } else {
      // Create the chat
      chat = await this.repository.save(
        new Chat({
          allTimeMembers: [this.currentUser, user],
          // Chat will not be listed to the other user until the first message gets written
          listingMembers: [this.currentUser],
        }),
      );

      return chat || null;
    }
  }

  async addGroup(
    userIds: string[],
    {
      groupName,
      groupPicture,
    }: {
      groupName?: string
      groupPicture?: string
    } = {},
  ) {
    let users: User[] = [];
    for (let userId of userIds) {
      const user = await this.userProvider
        .createQueryBuilder()
        .whereInIds(userId)
        .getOne();

      if (!user) {
        throw new Error(`User ${userId} doesn't exist.`);
      }

      users.push(user);
    }

    const chat = await this.repository.save(
      new Chat({
        name: groupName,
        admins: [this.currentUser],
        picture: groupPicture || undefined,
        owner: this.currentUser,
        allTimeMembers: [...users, this.currentUser],
        listingMembers: [...users, this.currentUser],
        actualGroupMembers: [...users, this.currentUser],
      }),
    );

    this.pubsub.publish('chatAdded', {
      creatorId: this.currentUser.id,
      chatAdded: chat,
    });

    return chat || null;
  }

  async updateGroup(
    chatId: string,
    {
      groupName,
      groupPicture,
    }: {
      groupName?: string
      groupPicture?: string
    } = {},
  ) {
    const chat = await this.createQueryBuilder()
      .whereInIds(chatId)
      .getOne();

    if (!chat) {
      throw new Error(`The chat ${chatId} doesn't exist.`);
    }

    if (!chat.name) {
      throw new Error(`The chat ${chatId} is not a group.`);
    }

    chat.name = groupName || chat.name;
    chat.picture = groupPicture || chat.picture;

    // Update the chat
    await this.repository.save(chat);

    this.pubsub.publish('chatUpdated', {
      updaterId: this.currentUser.id,
      chatUpdated: chat,
    });

    return chat;
  }

  async removeChat(chatId: string) {
    const chat = await this.createQueryBuilder()
      .whereInIds(Number(chatId))
      .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
      .leftJoinAndSelect('chat.actualGroupMembers', 'actualGroupMembers')
      .leftJoinAndSelect('chat.admins', 'admins')
      .leftJoinAndSelect('chat.owner', 'owner')
      .getOne();

    if (!chat) {
      throw new Error(`The chat ${chatId} doesn't exist.`)
    }

    if (!chat.name) {
      // Chat
      if (!chat.listingMembers.find(user => user.id === this.currentUser.id)) {
        throw new Error(`The user is not a listing member of the chat ${chatId}.`)
      }

      // Remove the current user from who gets the chat listed. The chat will no longer appear in his list
      chat.listingMembers = chat.listingMembers.filter(user => user.id !== this.currentUser.id);

      // Check how many members are left
      if (chat.listingMembers.length === 0) {
        // Delete the chat
        await this.repository.remove(chat);
      } else {
        // Update the chat
        await this.repository.save(chat);
      }

      return chatId;
    } else {
      // Group

      // Remove the current user from who gets the group listed. The group will no longer appear in his list
      chat.listingMembers = chat.listingMembers.filter(user => user.id !== this.currentUser.id);

      // Check how many members (including previous ones who can still access old messages) are left
      if (chat.listingMembers.length === 0) {
        // Remove the group
        await this.repository.remove(chat);
      } else {
        // Update the group

        // Remove the current user from the chat members. He is no longer a member of the group
        chat.actualGroupMembers = chat.actualGroupMembers && chat.actualGroupMembers.filter(user =>
          user.id !== this.currentUser.id
        );
        // Remove the current user from the chat admins
        chat.admins = chat.admins && chat.admins.filter(user => user.id !== this.currentUser.id);
        // If there are no more admins left the group goes read only
        // A null owner means the group is read-only
        chat.owner = chat.admins && chat.admins[0] || null;

        await this.repository.save(chat);
      }

      return chatId;
    }
  }

  async getChatName(chat: Chat) {
    if (chat.name) {
      return chat.name;
    }

    const user = await this.userProvider
      .createQueryBuilder()
      .where('user.id != :userId', { userId: this.currentUser.id })
      .innerJoin(
        'user.allTimeMemberChats',
        'allTimeMemberChats',
        'allTimeMemberChats.id = :chatId',
        { chatId: chat.id },
      )
      .getOne();

    return (user && user.name) || null;
  }

  async getChatPicture(chat: Chat) {

    if (chat.name) {
      return chat.picture;
    }

    const user = await this.userProvider
      .createQueryBuilder()
      .where('user.id != :userId', { userId: this.currentUser.id })
      .innerJoin(
        'user.allTimeMemberChats',
        'allTimeMemberChats',
        'allTimeMemberChats.id = :chatId',
        { chatId: chat.id },
      )
      .getOne();

    return user ? user.picture : null;
  }

  getChatAllTimeMembers(chat: Chat) {
    return this.userProvider
      .createQueryBuilder()
      .innerJoin(
        'user.listingMemberChats',
        'listingMemberChats',
        'listingMemberChats.id = :chatId',
        { chatId: chat.id },
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
        { chatId: chat.id },
      )
      .getMany();
  }

  getChatActualGroupMembers(chat: Chat) {
    return this.userProvider
      .createQueryBuilder()
      .innerJoin(
        'user.actualGroupMemberChats',
        'actualGroupMemberChats',
        'actualGroupMemberChats.id = :chatId',
        { chatId: chat.id },
      )
      .getMany();
  }

  getChatAdmins(chat: Chat) {
    return this.userProvider
      .createQueryBuilder()
      .innerJoin('user.adminChats', 'adminChats', 'adminChats.id = :chatId', {
        chatId: chat.id,
      })
      .getMany();
  }

  async getChatOwner(chat: Chat) {
    const owner = await this.userProvider
      .createQueryBuilder()
      .innerJoin('user.ownerChats', 'ownerChats', 'ownerChats.id = :chatId', {
        chatId: chat.id,
      })
      .getOne();

    return owner || null;
  }

  async isChatGroup(chat: Chat) {
    return !!chat.name;
  }

  async filterChatAddedOrUpdated(chatAddedOrUpdated: Chat, creatorOrUpdaterId: number) {

    return Number(creatorOrUpdaterId) !== this.currentUser.id &&
      chatAddedOrUpdated.listingMembers.some((user: User) => user.id === this.currentUser.id);
  }

  async updateUser({
    name,
    picture,
  }: {
    name?: string,
    picture?: string,
  } = {}) {
    await this.userProvider.updateUser({ name, picture });


    const data = await this.connection
      .createQueryBuilder(User, 'user')
      .where('user.id = :id', { id: this.currentUser.id })
      // Get a list of the chats who have/had currentUser involved
      .innerJoinAndSelect(
        'user.allTimeMemberChats',
        'allTimeMemberChats',
        // Groups are unaffected
        'allTimeMemberChats.name IS NULL',
      )
      // We need to notify only those who get the chat listed (except currentUser of course)
      .innerJoin(
        'allTimeMemberChats.listingMembers',
        'listingMembers',
        'listingMembers.id != :currentUserId',
        {
          currentUserId: this.currentUser.id,
        })
      .getOne();

    const chatsAffected = data && data.allTimeMemberChats || [];

    chatsAffected.forEach(chat => {
      this.pubsub.publish('chatUpdated', {
        updaterId: this.currentUser.id,
        chatUpdated: chat,
      })
    });

    return this.currentUser;
  }
}

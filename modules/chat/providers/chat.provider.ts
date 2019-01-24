import { Injectable } from '@graphql-modules/di'
import { PubSub } from 'apollo-server-express'
import { Connection } from 'typeorm'
import { User } from "../../../entity/User";
import { Chat } from "../../../entity/Chat";

@Injectable()
export class ChatProvider {
  constructor(
    private pubsub: PubSub,
    private connection: Connection,
  ) {
  }

  async getChats(currentUser: User) {
    return this.connection
      .createQueryBuilder(Chat, 'chat')
      .leftJoin('chat.listingMembers', 'listingMembers')
      .where('listingMembers.id = :id', {id: currentUser.id})
      .orderBy('chat.createdAt', 'DESC')
      .getMany();
  }

  async getChat(chatId: string) {
    const chat = await this.connection
      .createQueryBuilder(Chat, 'chat')
      .whereInIds(chatId)
      .getOne();

    return chat || null;
  }

  async addChat(currentUser: User, userId: string) {
    const user = await this.connection
      .createQueryBuilder(User, 'user')
      .whereInIds(userId)
      .getOne();

    if (!user) {
      throw new Error(`User ${userId} doesn't exist.`);
    }

    let chat = await this.connection
      .createQueryBuilder(Chat, 'chat')
      .where('chat.name IS NULL')
      .innerJoin('chat.allTimeMembers', 'allTimeMembers1', 'allTimeMembers1.id = :currentUserId', {
        currentUserId: currentUser.id,
      })
      .innerJoin('chat.allTimeMembers', 'allTimeMembers2', 'allTimeMembers2.id = :userId', {
        userId: userId,
      })
      .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
      .getOne();

    if (chat) {
      // Chat already exists. Both users are already in the userIds array
      const listingMembers = await this.connection
        .createQueryBuilder(User, 'user')
        .innerJoin(
          'user.listingMemberChats',
          'listingMemberChats',
          'listingMemberChats.id = :chatId',
          {chatId: chat.id},
        )
        .getMany();

      if (!listingMembers.find(user => user.id === currentUser.id)) {
        // The chat isn't listed for the current user. Add him to the memberIds
        chat.listingMembers.push(currentUser);
        chat = await this.connection.getRepository(Chat).save(chat);

        return chat || null;
      } else {
        return chat;
      }
    } else {
      // Create the chat
      chat = await this.connection.getRepository(Chat).save(
        new Chat({
          allTimeMembers: [currentUser, user],
          // Chat will not be listed to the other user until the first message gets written
          listingMembers: [currentUser],
        }),
      );

      return chat || null;
    }
  }

  async addGroup(
    currentUser: User,
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
      const user = await this.connection
        .createQueryBuilder(User, 'user')
        .whereInIds(userId)
        .getOne();

      if (!user) {
        throw new Error(`User ${userId} doesn't exist.`);
      }

      users.push(user);
    }

    const chat = await this.connection.getRepository(Chat).save(
      new Chat({
        name: groupName,
        admins: [currentUser],
        picture: groupPicture || undefined,
        owner: currentUser,
        allTimeMembers: [...users, currentUser],
        listingMembers: [...users, currentUser],
        actualGroupMembers: [...users, currentUser],
      }),
    );

    this.pubsub.publish('chatAdded', {
      creatorId: currentUser.id,
      chatAdded: chat,
    });

    return chat || null;
  }

  async updateChat(
    currentUser: User,
    chatId: string,
    {
      name,
      picture,
    }: {
      name?: string
      picture?: string
    } = {},
  ) {
    const chat = await this.connection
      .createQueryBuilder(Chat, 'chat')
      .whereInIds(chatId)
      .getOne();

    if (!chat) return null;
    if (!chat.name) return chat;

    name = name || chat.name;
    picture = picture || chat.picture;
    Object.assign(chat, {name, picture});

    // Update the chat
    await this.connection.getRepository(Chat).save(chat);

    this.pubsub.publish('chatUpdated', {
      updaterId: currentUser.id,
      chatUpdated: chat,
    });

    return chat || null;
  }

  async removeChat(currentUser: User, chatId: string) {
    console.log("DEBUG: ChatModule's removeChat");
    const chat = await this.connection
      .createQueryBuilder(Chat, 'chat')
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
      if (!chat.listingMembers.find(user => user.id === currentUser.id)) {
        throw new Error(`The user is not a listing member of the chat ${chatId}.`)
      }

      // Remove the current user from who gets the chat listed. The chat will no longer appear in his list
      chat.listingMembers = chat.listingMembers.filter(user => user.id !== currentUser.id);

      // Check how many members are left
      if (chat.listingMembers.length === 0) {
        // Delete the chat
        await this.connection.getRepository(Chat).remove(chat);
      } else {
        // Update the chat
        await this.connection.getRepository(Chat).save(chat);
      }

      return chatId;
    } else {
      // Group

      // Remove the current user from who gets the group listed. The group will no longer appear in his list
      chat.listingMembers = chat.listingMembers.filter(user => user.id !== currentUser.id);

      // Check how many members (including previous ones who can still access old messages) are left
      if (chat.listingMembers.length === 0) {
        // Remove the group
        await this.connection.getRepository(Chat).remove(chat);
      } else {
        // Update the group

        // Remove the current user from the chat members. He is no longer a member of the group
        chat.actualGroupMembers = chat.actualGroupMembers && chat.actualGroupMembers.filter(user =>
          user.id !== currentUser.id
        );
        // Remove the current user from the chat admins
        chat.admins = chat.admins && chat.admins.filter(user => user.id !== currentUser.id);
        // If there are no more admins left the group goes read only
        // A null owner means the group is read-only
        chat.owner = chat.admins && chat.admins[0] || null;

        await this.connection.getRepository(Chat).save(chat);
      }

      return chatId;
    }
  }

  async getChatName(currentUser: User, chat: Chat) {
    if (chat.name) {
      return chat.name;
    }

    const user = await this.connection
      .createQueryBuilder(User, 'user')
      .where('user.id != :userId', {userId: currentUser.id})
      .innerJoin(
        'user.allTimeMemberChats',
        'allTimeMemberChats',
        'allTimeMemberChats.id = :chatId',
        {chatId: chat.id},
      )
      .getOne();

    return (user && user.name) || null;
  }

  async getChatPicture(currentUser: User, chat: Chat) {
    if (chat.name) {
      return chat.picture;
    }

    const user = await this.connection
      .createQueryBuilder(User, 'user')
      .where('user.id != :userId', {userId: currentUser.id})
      .innerJoin(
        'user.allTimeMemberChats',
        'allTimeMemberChats',
        'allTimeMemberChats.id = :chatId',
        {chatId: chat.id},
      )
      .getOne();

    return user ? user.picture : null;
  }

  async getChatAllTimeMembers(currentUser: User, chat: Chat) {
    return await this.connection
      .createQueryBuilder(User, 'user')
      .innerJoin(
        'user.listingMemberChats',
        'listingMemberChats',
        'listingMemberChats.id = :chatId',
        {chatId: chat.id},
      )
      .getMany()
  }

  async getChatListingMembers(currentUser: User, chat: Chat) {
    return await this.connection
      .createQueryBuilder(User, 'user')
      .innerJoin(
        'user.listingMemberChats',
        'listingMemberChats',
        'listingMemberChats.id = :chatId',
        {chatId: chat.id},
      )
      .getMany();
  }

  async getChatActualGroupMembers(currentUser: User, chat: Chat) {
    return await this.connection
      .createQueryBuilder(User, 'user')
      .innerJoin(
        'user.actualGroupMemberChats',
        'actualGroupMemberChats',
        'actualGroupMemberChats.id = :chatId',
        {chatId: chat.id},
      )
      .getMany();
  }

  getChatAdmins(currentUser: User, chat: Chat) {
    return this.connection
      .createQueryBuilder(User, "user")
      .innerJoin('user.adminChats', 'adminChats', 'adminChats.id = :chatId', {
        chatId: chat.id,
      })
      .getMany();
  }

  async getChatOwner(currentUser: User, chat: Chat) {
    const owner = await this.connection
      .createQueryBuilder(User, 'user')
      .innerJoin('user.ownerChats', 'ownerChats', 'ownerChats.id = :chatId', {
        chatId: chat.id,
      })
      .getOne();

    return owner || null;
  }

  async isChatGroup(chat: Chat) {
    return !!chat.name;
  }

  async filterChatAddedOrUpdated(currentUser: User, chatAddedOrUpdated: Chat, creatorOrUpdaterId: number) {
    return Number(creatorOrUpdaterId) !== currentUser.id &&
      chatAddedOrUpdated.listingMembers.some((user: User) => user.id === currentUser.id);
  }
}

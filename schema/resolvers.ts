import { MessageType } from "../db";
import { IResolvers } from "graphql-tools/dist/Interfaces";
import {
  AddChatMutationArgs, AddGroupMutationArgs, AddMessageMutationArgs, ChatQueryArgs, MessageAddedSubscriptionArgs,
  MessageFeedChatArgs, MessagesChatArgs, RemoveChatMutationArgs, RemoveMessagesMutationArgs
} from "../types";
import * as moment from "moment";
import { PubSub, withFilter } from "graphql-subscriptions";
import { User } from "../entity/User";
import { Chat } from "../entity/Chat";
import { Message } from "../entity/Message";
import { Recipient } from "../entity/Recipient";
import { Connection } from "typeorm";
import { GraphQLDateTime } from "graphql-iso-date";

export const pubsub = new PubSub();

export const resolvers: IResolvers = {
  Date: GraphQLDateTime,
  Query: {
    // Show all users for the moment.
    users: async (obj: any, args: any, {user: currentUser, connection}: { user: User, connection: Connection }): Promise<User[]> => {
      return await connection
        .createQueryBuilder(User, "user")
        .where('user.id != :id', {id: currentUser.id})
        .getMany();
    },
    chats: async (obj: any, args: any, {user: currentUser, connection}: { user: User, connection: Connection }): Promise<any[]> => {
      return await connection
        .createQueryBuilder(Chat, "chat")
        .leftJoin('chat.listingMembers', 'listingMembers')
        .where('listingMembers.id = :id', {id: currentUser.id})
        .getMany();
    },
    chat: async (obj: any, {chatId}: ChatQueryArgs, {connection}: { user: User, connection: Connection }): Promise<any> => {
      return await connection
        .createQueryBuilder(Chat, "chat")
        .whereInIds(chatId)
        .getOne();
    },
  },
  Mutation: {
    addChat: async (obj: any, {recipientId}: AddChatMutationArgs, {user: currentUser, connection}: { user: User, connection: Connection }): Promise<Chat | null> => {
      const recipient = await connection
        .createQueryBuilder(User, "user")
        .whereInIds(recipientId)
        .getOne();

      if (!recipient) {
        throw new Error(`Recipient ${recipientId} doesn't exist.`);
      }

      let chat = await connection
        .createQueryBuilder(Chat, "chat")
        .where('chat.name IS NULL')
        .innerJoin('chat.allTimeMembers', 'allTimeMembers1', 'allTimeMembers1.id = :currentUserId', {currentUserId: currentUser.id})
        .innerJoin('chat.allTimeMembers', 'allTimeMembers2', 'allTimeMembers2.id = :recipientId', {recipientId})
        .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
        .getOne();

      if (chat) {
        // Chat already exists. Both users are already in the userIds array
        const listingMembers = await connection
          .createQueryBuilder(User, "user")
          .innerJoin('user.listingMemberChats', 'listingMemberChats', 'listingMemberChats.id = :chatId', {chatId: chat.id})
          .getMany();

        if (!listingMembers.find(user => user.id === currentUser.id)) {
          // The chat isn't listed for the current user. Add him to the memberIds
          chat.listingMembers.push(currentUser);
          chat = await connection.getRepository(Chat).save(chat);

          return chat || null;
        } else {
          throw new Error(`Chat already exists.`);
        }
      } else {
        // Create the chat
        chat = await connection.getRepository(Chat).save(new Chat({
          allTimeMembers: [currentUser, recipient],
          // Chat will not be listed to the other user until the first message gets written
          listingMembers: [currentUser],
        }));

        return chat || null;
      }
    },
    addGroup: async (obj: any, {recipientIds, groupName}: AddGroupMutationArgs, {user: currentUser, connection}: { user: User, connection: Connection }): Promise<Chat | null> => {
      let recipients: User[] = [];
      for (let recipientId of recipientIds) {
        const recipient = await connection
          .createQueryBuilder(User, "user")
          .whereInIds(recipientId)
          .getOne();
        if (!recipient) {
          throw new Error(`Recipient ${recipientId} doesn't exist.`);
        }
        recipients.push(recipient);
      }

      const chat = await connection.getRepository(Chat).save(new Chat({
        name: groupName,
        admins: [currentUser],
        owner: currentUser,
        allTimeMembers: [...recipients, currentUser],
        listingMembers: [...recipients, currentUser],
        actualGroupMembers: [...recipients, currentUser],
      }));

      pubsub.publish('chatAdded', {
        creatorId: currentUser.id,
        chatAdded: chat,
      });

      return chat || null;
    },
    removeChat: async (obj: any, {chatId}: RemoveChatMutationArgs, {user: currentUser, connection}: { user: User, connection: Connection }) => {
      const chat = await connection
        .createQueryBuilder(Chat, "chat")
        .whereInIds(Number(chatId))
        .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
        .leftJoinAndSelect('chat.actualGroupMembers', 'actualGroupMembers')
        .leftJoinAndSelect('chat.admins', 'admins')
        .leftJoinAndSelect('chat.owner', 'owner')
        .leftJoinAndSelect('chat.messages', 'messages')
        .leftJoinAndSelect('messages.holders', 'holders')
        .getOne();

      if (!chat) {
        throw new Error(`The chat ${chatId} doesn't exist.`);
      }

      if (!chat.name) {
        // Chat
        if (!chat.listingMembers.find(user => user.id === currentUser.id)) {
          throw new Error(`The user is not a listing member of the chat ${chatId}.`);
        }

        // Instead of chaining map and filter we can loop once using reduce
        chat.messages = await chat.messages.reduce<Promise<Message[]>>(async (filtered$, message) => {
          const filtered = await filtered$;

          message.holders = message.holders.filter(user => user.id !== currentUser.id);

          if (message.holders.length !== 0) {
            // Remove the current user from the message holders
            await connection.getRepository(Message).save(message);
            filtered.push(message);
          } else {
            // Simply remove the message
            const recipients = await connection
              .createQueryBuilder(Recipient, "recipient")
              .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {messageId: message.id})
              .innerJoinAndSelect('recipient.user', 'user')
              .getMany();
            for (let recipient of recipients) {
              await connection.getRepository(Recipient).remove(recipient);
            }
            await connection.getRepository(Message).remove(message);
          }

          return filtered;
        }, Promise.resolve([]));

        // Remove the current user from who gets the chat listed. The chat will no longer appear in his list
        chat.listingMembers = chat.listingMembers.filter(user => user.id !== currentUser.id);

        // Check how many members are left
        if (chat.listingMembers.length === 0) {
          // Delete the chat
          await connection.getRepository(Chat).remove(chat);
        } else {
          // Update the chat
          await connection.getRepository(Chat).save(chat);
        }
        return chatId;
      } else {
        // Group

        // Instead of chaining map and filter we can loop once using reduce
        chat.messages = await chat.messages.reduce<Promise<Message[]>>(async (filtered$, message) => {
          const filtered = await filtered$;

          message.holders = message.holders.filter(user => user.id !== currentUser.id);

          if (message.holders.length !== 0) {
            // Remove the current user from the message holders
            await connection.getRepository(Message).save(message);
            filtered.push(message);
          } else {
            // Simply remove the message
            const recipients = await connection
              .createQueryBuilder(Recipient, "recipient")
              .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {messageId: message.id})
              .innerJoinAndSelect('recipient.user', 'user')
              .getMany();
            for (let recipient of recipients) {
              await connection.getRepository(Recipient).remove(recipient);
            }
            await connection.getRepository(Message).remove(message);
          }

          return filtered;
        }, Promise.resolve([]));

        // Remove the current user from who gets the group listed. The group will no longer appear in his list
        chat.listingMembers = chat.listingMembers.filter(user => user.id !== currentUser.id);

        // Check how many members (including previous ones who can still access old messages) are left
        if (chat.listingMembers.length === 0) {
          // Remove the group
          await connection.getRepository(Chat).remove(chat);
        } else {
          // Update the group

          // Remove the current user from the chat members. He is no longer a member of the group
          chat.actualGroupMembers = chat.actualGroupMembers && chat.actualGroupMembers.filter(user => user.id !== currentUser.id);
          // Remove the current user from the chat admins
          chat.admins = chat.admins && chat.admins.filter(user => user.id !== currentUser.id);
          // If there are no more admins left the group goes read only
          chat.owner = chat.admins && chat.admins[0] || null; // A null owner means the group is read-only

          await connection.getRepository(Chat).save(chat);
        }
        return chatId;
      }
    },
    addMessage: async (obj: any, {chatId, content}: AddMessageMutationArgs, {user: currentUser, connection}: { user: User, connection: Connection }): Promise<Message | null> => {
      if (content === null || content === '') {
        throw new Error(`Cannot add empty or null messages.`);
      }

      let chat = await connection
        .createQueryBuilder(Chat, "chat")
        .whereInIds(chatId)
        .innerJoinAndSelect('chat.allTimeMembers', 'allTimeMembers')
        .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
        .leftJoinAndSelect('chat.actualGroupMembers', 'actualGroupMembers')
        .getOne();

      if (!chat) {
        throw new Error(`Cannot find chat ${chatId}.`);
      }

      let holders: User[];

      if (!chat.name) {
        // Chat
        if (!chat.listingMembers.map(user => user.id).includes(currentUser.id)) {
          throw new Error(`The chat ${chatId} must be listed for the current user before adding a message.`);
        }

        const recipientUser = chat.allTimeMembers.find(user => user.id !== currentUser.id);

        if (!recipientUser) {
          throw new Error(`Cannot find recipient user.`);
        }

        if (!chat.listingMembers.find(user => user.id === recipientUser.id)) {
          // Chat is not listed for the recipient. Add him to the listingIds
          chat.listingMembers.push(recipientUser);

          await connection.getRepository(Chat).save(chat);

          pubsub.publish('chatAdded', {
            creatorId: currentUser.id,
            chatAdded: chat,
          });
        }

        holders = chat.listingMembers;
      } else {
        // Group
        if (!chat.actualGroupMembers || !chat.actualGroupMembers.find(user => user.id === currentUser.id)) {
          throw new Error(`The user is not a member of the group ${chatId}. Cannot add message.`);
        }

        holders = chat.actualGroupMembers;
      }

      const message = await connection.getRepository(Message).save(new Message({
        chat: chat,
        sender: currentUser,
        content,
        type: MessageType.TEXT,
        holders,
        recipients: holders.reduce<Recipient[]>((filtered, user) => {
          if (user.id !== currentUser.id) {
            filtered.push(new Recipient({
              user,
            }));
          }
          return filtered;
        }, []),
      }));

      pubsub.publish('messageAdded', {
        messageAdded: message,
      });

      return message || null;
    },
    removeMessages: async (obj: any, {chatId, messageIds, all}: RemoveMessagesMutationArgs, {user: currentUser, connection}: { user: User, connection: Connection }) => {
      const chat = await connection
        .createQueryBuilder(Chat, "chat")
        .whereInIds(chatId)
        .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
        .innerJoinAndSelect('chat.messages', 'messages')
        .innerJoinAndSelect('messages.holders', 'holders')
        .getOne();

      if (!chat) {
        throw new Error(`Cannot find chat ${chatId}.`);
      }

      if (!chat.listingMembers.find(user => user.id === currentUser.id)) {
        throw new Error(`The chat/group ${chatId} is not listed for the current user, so there is nothing to delete.`);
      }

      if (all && messageIds) {
        throw new Error(`Cannot specify both 'all' and 'messageIds'.`);
      }

      if (!all && !(messageIds && messageIds.length)) {
        throw new Error(`'all' and 'messageIds' cannot be both null`);
      }

      let deletedIds: number[] = [];
      // Instead of chaining map and filter we can loop once using reduce
      chat.messages = await chat.messages.reduce<Promise<Message[]>>(async (filtered$, message) => {
        const filtered = await filtered$;

        if (all || messageIds!.includes(String(message.id))) {
          deletedIds.push(message.id);
          // Remove the current user from the message holders
          message.holders = message.holders.filter(user => user.id !== currentUser.id);

        }

        if (message.holders.length !== 0) {
          // Remove the current user from the message holders
          await connection.getRepository(Message).save(message);
          filtered.push(message);
        } else {
          // Simply remove the message
          const recipients = await connection
            .createQueryBuilder(Recipient, "recipient")
            .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {messageId: message.id})
            .innerJoinAndSelect('recipient.user', 'user')
            .getMany();
          for (let recipient of recipients) {
            await connection.getRepository(Recipient).remove(recipient);
          }
          await connection.getRepository(Message).remove(message);
        }

        return filtered;
      }, Promise.resolve([]));

      await connection.getRepository(Chat).save(chat);

      return deletedIds;
    },
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
  Chat: {
    name: async (chat: Chat, args: any, {user: currentUser, connection}: {user: User, connection: Connection}): Promise<string | null> => {
      if (chat.name) {
        return chat.name;
      }
      const user = await connection
        .createQueryBuilder(User, "user")
        .where('user.id != :userId', {userId: currentUser.id})
        .innerJoin('user.allTimeMemberChats', 'allTimeMemberChats', 'allTimeMemberChats.id = :chatId', {chatId: chat.id})
        .getOne();
      return user && user.name || null;
    },
    picture: async (chat: Chat, args: any, {user: currentUser, connection}: {user: User, connection: Connection}): Promise<string | null> => {
      if (chat.name) {
        return chat.picture;
      }
      const user = await connection
        .createQueryBuilder(User, "user")
        .where('user.id != :userId', {userId: currentUser.id})
        .innerJoin('user.allTimeMemberChats', 'allTimeMemberChats', 'allTimeMemberChats.id = :chatId', {chatId: chat.id})
        .getOne();
      return user ? user.picture : null;
    },
    allTimeMembers: async (chat: Chat, args: any, {user: currentUser, connection}: {user: User, connection: Connection}): Promise<User[]> => {
      return await connection
        .createQueryBuilder(User, "user")
        .innerJoin('user.allTimeMemberChats', 'allTimeMemberChats', 'allTimeMemberChats.id = :chatId', {chatId: chat.id})
        .getMany();
    },
    listingMembers: async (chat: Chat, args: any, {user: currentUser, connection}: {user: User, connection: Connection}): Promise<User[]> => {
      return await connection
        .createQueryBuilder(User, "user")
        .innerJoin('user.listingMemberChats', 'listingMemberChats', 'listingMemberChats.id = :chatId', {chatId: chat.id})
        .getMany();
    },
    actualGroupMembers: async (chat: Chat, args: any, {user: currentUser, connection}: {user: User, connection: Connection}): Promise<User[]> => {
      return await connection
        .createQueryBuilder(User, "user")
        .innerJoin('user.actualGroupMemberChats', 'actualGroupMemberChats', 'actualGroupMemberChats.id = :chatId', {chatId: chat.id})
        .getMany();
    },
    admins: async (chat: Chat, args: any, {user: currentUser, connection}: {user: User, connection: Connection}): Promise<User[]> => {
      return await connection
        .createQueryBuilder(User, "user")
        .innerJoin('user.adminChats', 'adminChats', 'adminChats.id = :chatId', {chatId: chat.id})
        .getMany();
    },
    owner: async (chat: Chat, args: any, {user: currentUser, connection}: {user: User, connection: Connection}): Promise<User | null> => {
      return await connection
        .createQueryBuilder(User, "user")
        .innerJoin('user.ownerChats', 'ownerChats', 'ownerChats.id = :chatId', {chatId: chat.id})
        .getOne() || null;
    },
    messages: async (chat: Chat, {before, amount}: MessagesChatArgs, {user: currentUser, connection}: {user: User, connection: Connection}): Promise<Message[]> => {
      let query = connection
        .createQueryBuilder(Message, "message")
        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', {chatId: chat.id})
        .innerJoin('message.holders', 'holders', 'holders.id = :userId', {userId: currentUser.id})
        .orderBy({"message.createdAt": "DESC"});

      if (amount) {
        query = query.take(amount);
      }

      if (before) {
        query = query.where('message.createdAt < :before', {before: new Date(before)});
      }

      return (await query.getMany()).reverse();
    },
    messageFeed: async (chat: Chat, {before, amount}: MessageFeedChatArgs, {user: currentUser, connection}: {user: User, connection: Connection}): Promise<{hasNextPage: boolean, cursor: Date | null, messages: Message[]}> => {
      let query = connection
        .createQueryBuilder(Message, "message")
        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', {chatId: chat.id})
        .innerJoin('message.holders', 'holders', 'holders.id = :userId', {userId: currentUser.id})
        .orderBy({"message.createdAt": "DESC"})
        .take(amount || 15);

      if (before) {
        query = query.where('message.createdAt < :before', {before: new Date(before)});
      }

      const [messages, count] = await query.getManyAndCount();
      return {
        hasNextPage: messages.length !== count,
        cursor: messages && messages.length && messages[messages.length - 1].createdAt || null,
        messages: messages.reverse(),
      };
    },
    unreadMessages: async (chat: Chat, args: any, {user: currentUser, connection}: {user: User, connection: Connection}): Promise<number> => {
      return await connection
        .createQueryBuilder(Message, "message")
        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', {chatId: chat.id})
        .innerJoin('message.recipients', 'recipients', 'recipients.user.id = :userId AND recipients.readAt IS NULL', {userId: currentUser.id})
        .getCount();
    },
    isGroup: (chat: Chat) => !!chat.name,
  },
  Message: {
    sender: async (message: Message, args: any, {user: currentUser, connection}: {user: User, connection: Connection}): Promise<User | null> => {
      return (await connection
        .createQueryBuilder(User, "user")
        .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {messageId: message.id})
        .getOne()) || null;
    },
    ownership: async (message: Message, args: any, {user: currentUser, connection}: {user: User, connection: Connection}): Promise<boolean> => {
      return !!(await connection
        .createQueryBuilder(User, "user")
        .whereInIds(currentUser.id)
        .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {messageId: message.id})
        .getCount());
    },
    recipients: async (message: Message, args: any, {user: currentUser, connection}: {user: User, connection: Connection}): Promise<Recipient[]> => {
      return await connection
        .createQueryBuilder(Recipient, "recipient")
        .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {messageId: message.id})
        .innerJoinAndSelect('recipient.user', 'user')
        .innerJoinAndSelect('recipient.chat', 'chat')
        .getMany();
    },
    holders: async (message: Message, args: any, {user: currentUser, connection}: {user: User, connection: Connection}): Promise<User[]> => {
      return await connection
        .createQueryBuilder(User, "user")
        .innerJoin('user.holderMessages', 'holderMessages', 'holderMessages.id = :messageId', {messageId: message.id})
        .getMany();
    },
    chat: async (message: Message, args: any, {user: currentUser, connection}: {user: User, connection: Connection}): Promise<Chat | null> => {
      return (await connection
        .createQueryBuilder(Chat, "chat")
        .innerJoin('chat.messages', 'messages', 'messages.id = :messageId', {messageId: message.id})
        .getOne()) || null;
    },
  },
};

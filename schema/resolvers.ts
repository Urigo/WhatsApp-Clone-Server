import { PubSub, withFilter } from 'apollo-server-express';
import { GraphQLDateTime } from 'graphql-iso-date';
import { MessageType } from "../db";
import { IResolvers, MessageAddedSubscriptionArgs } from "../types";
import { User } from "../entity/User";
import { Chat } from "../entity/Chat";
import { Message } from "../entity/Message";
import { Recipient } from "../entity/Recipient";

export const pubsub = new PubSub();

export const resolvers: IResolvers = {
  Date: GraphQLDateTime,
  Query: {
    me: (obj, args, {currentUser}) => currentUser,
    users: async (obj, args, {currentUser, connection}) => {
      return await connection
        .createQueryBuilder(User, "user")
        .where('user.id != :id', {id: currentUser.id})
        .getMany();
    },
    chats: async (obj, args, {currentUser, connection}) => {
      // TODO: make a proper query instead of this mess (see https://github.com/typeorm/typeorm/issues/2132)
      const chats = await connection
        .createQueryBuilder(Chat, "chat")
        .leftJoin('chat.listingMembers', 'listingMembers')
        .where('listingMembers.id = :id', {id: currentUser.id})
        .getMany();

      for (let chat of chats) {
        chat.messages = (await connection
          .createQueryBuilder(Message, "message")
          .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId: chat.id })
          .innerJoin('message.holders', 'holders', 'holders.id = :userId', {
            userId: currentUser.id,
          })
          .orderBy({ 'message.createdAt': { order: 'DESC', nulls: 'NULLS LAST' } })
          .getMany())
          .reverse();
      }

      return chats.sort((chatA, chatB) => {
        const dateA = chatA.messages.length ? chatA.messages[chatA.messages.length - 1].createdAt : chatA.createdAt;
        const dateB = chatB.messages.length ? chatB.messages[chatB.messages.length - 1].createdAt : chatB.createdAt;
        return dateB.valueOf() - dateA.valueOf();
      });
    },
    chat: async (obj, {chatId}, {connection}) => {
      return await connection
        .createQueryBuilder(Chat, "chat")
        .whereInIds(chatId)
        .getOne();
    },
  },
  Mutation: {
    updateUser: async (obj, {name, picture}, {currentUser, connection}) => {
      if (name === currentUser.name && picture === currentUser.picture) {
        return currentUser;
      }

      currentUser.name = name || currentUser.name;
      currentUser.picture = picture || currentUser.picture;

      await connection.getRepository(User).save(currentUser);

      pubsub.publish('userUpdated', {
        userUpdated: currentUser,
      });

      const data = await connection
        .createQueryBuilder(User, 'user')
        .where('user.id = :id', { id: currentUser.id })
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
            currentUserId: currentUser.id,
          })
        .getOne();

      const chatsAffected = data && data.allTimeMemberChats || [];

      chatsAffected.forEach(chat => {
        pubsub.publish('chatUpdated', {
          updaterId: currentUser.id,
          chatUpdated: chat,
        })
      });

      return currentUser;
    },
    addChat: async (obj, {userId}, {currentUser, connection}) => {
      const user = await connection
        .createQueryBuilder(User, "user")
        .whereInIds(userId)
        .getOne();
        
        if (!user) {
        throw new Error(`User ${userId} doesn't exist.`);
      }

      let chat = await connection
        .createQueryBuilder(Chat, "chat")
        .where('chat.name IS NULL')
        .innerJoin('chat.allTimeMembers', 'allTimeMembers1', 'allTimeMembers1.id = :currentUserId', {currentUserId: currentUser.id})
        .innerJoin('chat.allTimeMembers', 'allTimeMembers2', 'allTimeMembers2.id = :userId', {userId})
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
          allTimeMembers: [currentUser, user],
          // Chat will not be listed to the other user until the first message gets written
          listingMembers: [currentUser],
        }));
        return chat || null;
      }
    },
    addGroup: async (obj, {userIds, groupName, groupPicture}, {currentUser, connection}) => {
      let users: User[] = [];
      for (let userId of userIds) {
        const user = await connection
          .createQueryBuilder(User, "user")
          .whereInIds(userId)
          .getOne();

        if (!user) {
          throw new Error(`User ${userId} doesn't exist.`);
        }

        users.push(user);
      }

      const chat = await connection.getRepository(Chat).save(new Chat({
        name: groupName,
        picture: groupPicture || undefined,
        admins: [currentUser],
        owner: currentUser,
        allTimeMembers: [...users, currentUser],
        listingMembers: [...users, currentUser],
        actualGroupMembers: [...users, currentUser],
      }));

      pubsub.publish('chatAdded', {
        creatorId: currentUser.id,
        chatAdded: chat,
      });

      return chat || null;
    },
    updateGroup: async (obj, {chatId, groupName, groupPicture}, {currentUser, connection}) => {
      const chat = await connection
        .createQueryBuilder(Chat, 'chat')
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
      await connection.getRepository(Chat).save(chat);

      pubsub.publish('chatUpdated', {
        updaterId: currentUser.id,
        chatUpdated: chat,
      });

      return chat;
    },
    removeChat: async (obj, {chatId}, {currentUser, connection}) => {
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
    addMessage: async (obj, {chatId, content}, {currentUser, connection}) => {
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

        // Receiver's user
        const receiver = chat.allTimeMembers.find(user => user.id !== currentUser.id);

        if (!receiver) {
          throw new Error(`Cannot find receiver's user.`);
        }

        if (!chat.listingMembers.find(listingMember => listingMember.id === receiver.id)) {
          // Chat is not listed for the receiver user. Add him to the listingIds
          chat.listingMembers.push(receiver);

          await connection.getRepository(Chat).save(chat);

          pubsub.publish('chatAdded', {
            creatorId: currentUser.id,
            chatAdded: chat,
          });
        }

        holders = chat.listingMembers;
      } else {
        // Group
        if (!chat.actualGroupMembers || !chat.actualGroupMembers.find(actualGroupMember => actualGroupMember.id === currentUser.id)) {
          throw new Error(`The user is not a member of the group ${chatId}. Cannot add message.`);
        }

        holders = chat.actualGroupMembers;
      }

      const message = await connection.getRepository(Message).save(new Message({
        chat,
        sender: currentUser,
        content,
        type: MessageType.TEXT,
        holders,
        recipients: holders.reduce<Recipient[]>((filtered, holder) => {
          if (holder.id !== currentUser.id) {
            filtered.push(new Recipient({
              user: holder,
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
    removeMessages: async (obj, {chatId, messageIds, all}, {currentUser, connection}) => {
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

      let deletedIds: string[] = [];
      // Instead of chaining map and filter we can loop once using reduce
      chat.messages = await chat.messages.reduce<Promise<Message[]>>(async (filtered$, message) => {
        const filtered = await filtered$;

        if (all || messageIds!.map(Number).includes(message.id)) {
          deletedIds.push(String(message.id));
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
        ({messageAdded}: {messageAdded: Message}, {chatId}: MessageAddedSubscriptionArgs, {currentUser}: { currentUser: User }) => {
          return (!chatId || messageAdded.chat.id === Number(chatId)) &&
            messageAdded.recipients.some(recipient => recipient.user.id === currentUser.id);
        }),
    },
    chatAdded: {
      subscribe: withFilter(() => pubsub.asyncIterator('chatAdded'),
        ({creatorId, chatAdded}: {creatorId: string, chatAdded: Chat}, variables, {currentUser}: { currentUser: User }) => {
          return Number(creatorId) !== currentUser.id &&
            chatAdded.listingMembers.some(user => user.id === currentUser.id);
        }),
    },
    chatUpdated: {
      subscribe: withFilter(() => pubsub.asyncIterator('chatUpdated'),
        ({updaterId, chatUpdated}: {updaterId: number, chatUpdated: Chat}, variables: any, {currentUser}: { currentUser: User }) => {
          return updaterId !== currentUser.id && chatUpdated.listingMembers.some(user => user.id === currentUser.id);
        }),
    },
    userUpdated: {
      subscribe: withFilter(() => pubsub.asyncIterator('userUpdated'),
        ({userUpdated}: {userUpdated: User}, variables: any, {currentUser}: { currentUser: User }) => {
          return userUpdated.id !== currentUser.id;
        }),
    },
    userAdded: {
      subscribe: withFilter(() => pubsub.asyncIterator('userAdded'),
        ({userAdded}: {userAdded: User}, variables: any, {currentUser}: { currentUser: User }) => {
          return userAdded.id !== currentUser.id;
        }),
    },
  },
  Chat: {
    name: async (chat, args, {currentUser, connection}) => {
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
    picture: async (chat, args, {currentUser, connection}) => {
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
    allTimeMembers: async (chat, args, {currentUser, connection}) => {
      return await connection
        .createQueryBuilder(User, "user")
        .innerJoin('user.allTimeMemberChats', 'allTimeMemberChats', 'allTimeMemberChats.id = :chatId', {chatId: chat.id})
        .getMany();
    },
    listingMembers: async (chat, args, {currentUser, connection}) => {
      return await connection
        .createQueryBuilder(User, "user")
        .innerJoin('user.listingMemberChats', 'listingMemberChats', 'listingMemberChats.id = :chatId', {chatId: chat.id})
        .getMany();
    },
    actualGroupMembers: async (chat, args, {currentUser, connection}) => {
      return await connection
        .createQueryBuilder(User, "user")
        .innerJoin('user.actualGroupMemberChats', 'actualGroupMemberChats', 'actualGroupMemberChats.id = :chatId', {chatId: chat.id})
        .getMany();
    },
    admins: async (chat, args, {currentUser, connection}) => {
      return await connection
        .createQueryBuilder(User, "user")
        .innerJoin('user.adminChats', 'adminChats', 'adminChats.id = :chatId', {chatId: chat.id})
        .getMany();
    },
    owner: async (chat, args, {currentUser, connection}) => {
      return await connection
        .createQueryBuilder(User, "user")
        .innerJoin('user.ownerChats', 'ownerChats', 'ownerChats.id = :chatId', {chatId: chat.id})
        .getOne() || null;
    },
    isGroup: (chat) => !!chat.name,
    messages: async (chat, {amount = 0}, {currentUser, connection}) => {
      if (chat.messages) {
        return amount ? chat.messages.slice(-amount) : chat.messages;
      }

      let query = connection
        .createQueryBuilder(Message, "message")
        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId: chat.id })
        .innerJoin('message.holders', 'holders', 'holders.id = :userId', {
          userId: currentUser.id,
        })
        .orderBy({ 'message.createdAt': { order: 'DESC', nulls: 'NULLS LAST' } });

      if (amount) {
        query = query.take(amount);
      }

      return (await query.getMany()).reverse();
    },
    lastMessage: async (chat, args, {currentUser, connection}) => {
      if (chat.messages) {
        return chat.messages.length ? chat.messages[chat.messages.length - 1] : null;
      }

      return await connection
        .createQueryBuilder(Message, "message")
        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId: chat.id })
        .innerJoin('message.holders', 'holders', 'holders.id = :userId', {
          userId: currentUser.id,
        })
        .orderBy({ 'message.createdAt': { order: 'DESC', nulls: 'NULLS LAST' } })
        .take(1)
        .getOne() || null;
    },
    updatedAt: async (chat, args, {currentUser, connection}) => {
      if (chat.messages) {
        return chat.messages.length ? chat.messages[0].createdAt : null;
      }

      const latestMessage = await connection
        .createQueryBuilder(Message, "message")
        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId: chat.id })
        .innerJoin('message.holders', 'holders', 'holders.id = :userId', {
          userId: currentUser.id,
        })
        .orderBy({ 'message.createdAt': 'DESC' })
        .getOne();

      return latestMessage ? latestMessage.createdAt : null;
    },
    unreadMessages: async (chat, args, {currentUser, connection}) => {
      return await connection
        .createQueryBuilder(Message, "message")
        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', {chatId: chat.id})
        .innerJoin('message.recipients', 'recipients', 'recipients.user.id = :userId AND recipients.readAt IS NULL', {
          userId: currentUser.id
        })
        .getCount();
    },
  },
  Message: {
    sender: async (message: Message, args, {currentUser, connection}) => {
      return (await connection
        .createQueryBuilder(User, "user")
        .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {messageId: message.id})
        .getOne())!;
    },
    ownership: async (message: Message, args, {currentUser, connection}) => {
      return !!(await connection
        .createQueryBuilder(User, "user")
        .whereInIds(currentUser.id)
        .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {messageId: message.id})
        .getCount());
    },
    recipients: async (message: Message, args, {currentUser, connection}) => {
      return await connection
        .createQueryBuilder(Recipient, "recipient")
        .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {messageId: message.id})
        .innerJoinAndSelect('recipient.user', 'user')
        .innerJoinAndSelect('recipient.chat', 'chat')
        .getMany();
    },
    holders: async (message: Message, args, {currentUser, connection}) => {
      return await connection
        .createQueryBuilder(User, "user")
        .innerJoin('user.holderMessages', 'holderMessages', 'holderMessages.id = :messageId', {messageId: message.id})
        .getMany();
    },
    chat: async (message: Message, args, {currentUser, connection})=> {
      return (await connection
        .createQueryBuilder(Chat, "chat")
        .innerJoin('chat.messages', 'messages', 'messages.id = :messageId', {messageId: message.id})
        .getOne())!;
    },
  },
};

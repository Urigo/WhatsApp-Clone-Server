import { InjectFunction } from '@graphql-modules/di'
import { PubSub } from "apollo-server-express";
import { withFilter } from 'apollo-server-express';
import { MessageType } from "../../../db";
import { User } from "../../../entity/User";
import { Chat } from "../../../entity/Chat";
import { Message } from "../../../entity/Message";
import { Recipient } from "../../../entity/Recipient";
import { IResolvers, MessageAddedSubscriptionArgs } from "../../../types/message";

export default InjectFunction(PubSub)((pubsub): IResolvers => ({
  Mutation: {
    addMessage: async (obj, {chatId, content}, {user: currentUser, connection}) => {
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
        chat,
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
    removeMessages: async (obj, {chatId, messageIds, all}, {user: currentUser, connection}) => {
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
        ({messageAdded}: {messageAdded: Message}, {chatId}: MessageAddedSubscriptionArgs, {user: currentUser}: { user: User }) => {
          if (!currentUser) {
            console.log('currentUser is undefined inside messageAdded subscription');
          }
          return (!chatId || messageAdded.chat.id === Number(chatId)) &&
            !!messageAdded.recipients.find((recipient: Recipient) => recipient.user.id === currentUser.id);
        }),
    },
  },
  Chat: {
    messages: async (chat, {amount = 0}: {amount: number}, {user: currentUser, connection}) => {
      const query = connection
        .createQueryBuilder(Message, "message")
        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', {chatId: chat.id})
        .innerJoin('message.holders', 'holders', 'holders.id = :userId', {userId: currentUser.id})
        .orderBy({"message.createdAt": "DESC"});
      return (amount ? await query.take(amount).getMany() : await query.getMany()).reverse();
    },
    unreadMessages: async (chat, args, {user: currentUser, connection}) => {
      return await connection
        .createQueryBuilder(Message, "message")
        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', {chatId: chat.id})
        .innerJoin('message.recipients', 'recipients', 'recipients.user.id = :userId AND recipients.readAt IS NULL', {userId: currentUser.id})
        .getCount();
    },
  },
  Message: {
    sender: async (message: Message, args, {user: currentUser, connection}) => {
      return (await connection
        .createQueryBuilder(User, "user")
        .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {messageId: message.id})
        .getOne())!;
    },
    ownership: async (message: Message, args, {user: currentUser, connection}) => {
      return !!(await connection
        .createQueryBuilder(User, "user")
        .whereInIds(currentUser.id)
        .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {messageId: message.id})
        .getCount());
    },
    holders: async (message: Message, args, {user: currentUser, connection}) => {
      return await connection
        .createQueryBuilder(User, "user")
        .innerJoin('user.holderMessages', 'holderMessages', 'holderMessages.id = :messageId', {messageId: message.id})
        .getMany();
    },
    chat: async (message: Message, args, {user: currentUser, connection})=> {
      return (await connection
        .createQueryBuilder(Chat, "chat")
        .innerJoin('chat.messages', 'messages', 'messages.id = :messageId', {messageId: message.id})
        .getOne())!;
    },
  },
}));

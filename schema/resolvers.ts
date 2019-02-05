import { IResolvers as IApolloResolvers } from 'apollo-server-express'
import { GraphQLDateTime } from 'graphql-iso-date'
import Chat from '../entity/chat'
import Message from '../entity/message'
import User from '../entity/user'
import { IResolvers } from '../types'

export default {
  Date: GraphQLDateTime,
  Query: {
    // Show all users for the moment.
    users: (root, args, { connection, currentUser }) => {
      return connection.createQueryBuilder(User, 'user').where('user.id != :id', {id: currentUser.id}).getMany();
    },

    chats: (root, args, { connection, currentUser }) => {
      return connection
        .createQueryBuilder(Chat, 'chat')
        .leftJoin('chat.listingMembers', 'listingMembers')
        .where('listingMembers.id = :id', { id: currentUser.id })
        .orderBy('chat.createdAt', 'DESC')
        .getMany();
    },

    chat: async (root, { chatId }, { connection }) => {
      const chat = await connection
        .createQueryBuilder(Chat, 'chat')
        .whereInIds(chatId)
        .getOne();

      return chat || null;
    },
  },

  Chat: {
    name: async (chat, args, { connection, currentUser }) => {
      if (chat.name) {
        return chat.name;
      }

      const user = await connection
        .createQueryBuilder(User, 'user')
        .where('user.id != :userId', { userId: currentUser.id })
        .innerJoin(
          'user.allTimeMemberChats',
          'allTimeMemberChats',
          'allTimeMemberChats.id = :chatId',
          { chatId: chat.id },
        )
        .getOne();

      return user ? user.name : null
    },

    picture: async (chat, args, { connection, currentUser }) => {
      if (chat.picture) {
        return chat.picture;
      }

      const user = await connection
        .createQueryBuilder(User, 'user')
        .where('user.id != :userId', { userId: currentUser.id })
        .innerJoin(
          'user.allTimeMemberChats',
          'allTimeMemberChats',
          'allTimeMemberChats.id = :chatId',
          { chatId: chat.id },
        )
        .getOne();

      return user ? user.picture : null
    },

    allTimeMembers: (chat, args, { connection }) => {
      return connection
        .createQueryBuilder(User, 'user')
        .innerJoin(
          'user.listingMemberChats',
          'listingMemberChats',
          'listingMemberChats.id = :chatId',
          { chatId: chat.id },
        )
        .getMany()
    },

    listingMembers: (chat, args, { connection }) => {
      return connection
        .createQueryBuilder(User, 'user')
        .innerJoin(
          'user.listingMemberChats',
          'listingMemberChats',
          'listingMemberChats.id = :chatId',
          { chatId: chat.id },
        )
        .getMany();
    },

    owner: async (chat, args, { connection }) => {
      const owner = await connection
        .createQueryBuilder(User, 'user')
        .innerJoin('user.ownerChats', 'ownerChats', 'ownerChats.id = :chatId', {
          chatId: chat.id,
        })
        .getOne();

      return owner || null;
    },

    messages: async (chat, { amount = 0 }, { connection, currentUser }) => {
      if (chat.messages) {
        return amount ? chat.messages.slice(-amount) : chat.messages;
      }

      let query = connection
        .createQueryBuilder(Message, 'message')
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

    lastMessage: async (chat, args, { connection, currentUser }) => {
      if (chat.messages) {
        return chat.messages.length ? chat.messages[chat.messages.length - 1] : null;
      }

      const messages = await connection
        .createQueryBuilder(Message, 'message')
        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId: chat.id })
        .innerJoin('message.holders', 'holders', 'holders.id = :userId', {
          userId: currentUser.id,
        })
        .orderBy({ 'message.createdAt': { order: 'DESC', nulls: 'NULLS LAST' } })
        .getMany()

      return messages && messages.length ? messages[messages.length - 1] : null;
    },
  },

  Message: {
    chat: async (message, args, { connection }) => {
      const chat = await connection
        .createQueryBuilder(Chat, 'chat')
        .innerJoin('chat.messages', 'messages', 'messages.id = :messageId', {
          messageId: message.id
        })
        .getOne();

      if (!chat) {
        throw new Error(`Message must have a chat.`);
      }

      return chat;
    },

    sender: async (message, args, { connection }) => {
      const sender = await connection
        .createQueryBuilder(User, 'user')
        .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {
          messageId: message.id,
        })
        .getOne();

      if (!sender) {
        throw new Error(`Message must have a sender.`);
      }

      return sender;
    },

    holders: async (message, args, { connection }) => {
      return connection
        .createQueryBuilder(User, 'user')
        .innerJoin('user.holderMessages', 'holderMessages', 'holderMessages.id = :messageId', {
          messageId: message.id,
        })
        .getMany();
    },

    ownership: async (message, args, { connection, currentUser }) => {
      return !!(await connection
        .createQueryBuilder(User, 'user')
        .whereInIds(currentUser.id)
        .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {
          messageId: message.id,
        })
        .getCount())
    }
  },
} as IResolvers as IApolloResolvers

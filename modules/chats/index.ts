import { GraphQLModule } from '@graphql-modules/core';
import { gql, withFilter } from 'apollo-server-express';
import sql from 'sql-template-strings';
import commonModule from '../common';
import usersModule from '../users';
import { Message, Chat, pool } from '../../db';
import { Resolvers } from '../../types/graphql';
import { UnsplashApi } from './unsplash.api';
import { Users } from './../users/users.provider';
import { Chats } from './chats.provider';
import { PubSub } from '../common/pubsub.provider';

const typeDefs = gql`
  type Message {
    id: ID!
    content: String!
    createdAt: DateTime!
    chat: Chat
    sender: User
    recipient: User
    isMine: Boolean!
  }

  type Chat {
    id: ID!
    name: String
    picture: URL
    lastMessage: Message
    messages: [Message!]!
    participants: [User!]!
  }

  extend type Query {
    chats: [Chat!]!
    chat(chatId: ID!): Chat
  }

  extend type Mutation {
    addMessage(chatId: ID!, content: String!): Message
    addChat(recipientId: ID!): Chat
    removeChat(chatId: ID!): ID
  }

  extend type Subscription {
    messageAdded: Message!
    chatAdded: Chat!
    chatRemoved: ID!
  }
`;

const resolvers: Resolvers = {
  Message: {
    createdAt(message) {
      return new Date(message.created_at);
    },

    async chat(message, args, { injector }) {
      return injector.get(Chats).findChatById(message.chat_id);
    },

    async sender(message, args, { injector }) {
      return injector.get(Users).findById(message.sender_user_id);
    },

    async recipient(message, args, { injector }) {
      return injector.get(Chats).firstRecipient({
        chatId: message.chat_id,
        userId: message.sender_user_id,
      });
    },

    isMine(message, args, { currentUser }) {
      return message.sender_user_id === currentUser.id;
    },
  },

  Chat: {
    async name(chat, args, { currentUser, injector }) {
      if (!currentUser) return null;

      const participant = await injector.get(Chats).firstRecipient({
        chatId: chat.id,
        userId: currentUser.id,
      });

      return participant ? participant.name : null;
    },

    async picture(chat, args, { currentUser, db, injector }) {
      if (!currentUser) return null;

      const participant = await injector.get(Chats).firstRecipient({
        chatId: chat.id,
        userId: currentUser.id,
      });

      return participant && participant.picture
        ? participant.picture
        : injector.get(UnsplashApi).getRandomPhoto();
    },

    async messages(chat, args, { injector }) {
      return injector.get(Chats).findMessagesByChat(chat.id);
    },

    async lastMessage(chat, args, { injector }) {
      return injector.get(Chats).lastMessage(chat.id);
    },

    async participants(chat, args, { injector }) {
      return injector.get(Chats).participants(chat.id);
    },
  },

  Query: {
    async chats(root, args, { currentUser, injector }) {
      if (!currentUser) return [];

      return injector.get(Chats).findChatsByUser(currentUser.id);
    },

    async chat(root, { chatId }, { currentUser, injector }) {
      if (!currentUser) return null;

      return injector
        .get(Chats)
        .findChatByUser({ chatId, userId: currentUser.id });
    },
  },

  Mutation: {
    async addMessage(root, { chatId, content }, { currentUser, injector }) {
      if (!currentUser) return null;

      return injector
        .get(Chats)
        .addMessage({ chatId, content, userId: currentUser.id });
    },

    async addChat(root, { recipientId }, { currentUser, injector, db }) {
      if (!currentUser) return null;

      const { rows } = await db.query(sql`
        SELECT chats.* FROM chats, (SELECT * FROM chats_users WHERE user_id = ${
          currentUser.id
        }) AS chats_of_current_user, chats_users
        WHERE chats_users.chat_id = chats_of_current_user.chat_id
        AND chats.id = chats_users.chat_id
        AND chats_users.user_id = ${recipientId}
      `);

      // If there is already a chat between these two users, return it
      if (rows[0]) {
        return rows[0];
      }

      try {
        await db.query('BEGIN');

        const { rows } = await db.query(sql`
          INSERT INTO chats
          DEFAULT VALUES
          RETURNING *
        `);

        const chatAdded = rows[0];

        await db.query(sql`
          INSERT INTO chats_users(chat_id, user_id)
          VALUES(${chatAdded.id}, ${currentUser.id})
        `);

        await db.query(sql`
          INSERT INTO chats_users(chat_id, user_id)
          VALUES(${chatAdded.id}, ${recipientId})
        `);

        await db.query('COMMIT');

        injector.get(PubSub).publish('chatAdded', {
          chatAdded,
        });

        return chatAdded;
      } catch (e) {
        await db.query('ROLLBACK');
        throw e;
      }
    },

    async removeChat(root, { chatId }, { currentUser, injector, db }) {
      if (!currentUser) return null;

      try {
        await db.query('BEGIN');

        const { rows } = await db.query(sql`
          SELECT chats.* FROM chats, chats_users
          WHERE id = ${chatId}
          AND chats.id = chats_users.chat_id
          AND chats_users.user_id = ${currentUser.id}
        `);

        const chat = rows[0];

        if (!chat) {
          await db.query('ROLLBACK');
          return null;
        }

        await db.query(sql`
          DELETE FROM chats WHERE chats.id = ${chatId}
        `);

        injector.get(PubSub).publish('chatRemoved', {
          chatRemoved: chat.id,
          targetChat: chat,
        });

        await db.query('COMMIT');

        return chatId;
      } catch (e) {
        await db.query('ROLLBACK');
        throw e;
      }
    },
  },

  Subscription: {
    messageAdded: {
      subscribe: withFilter(
        (root, args, { injector }) =>
          injector.get(PubSub).asyncIterator('messageAdded'),
        async (
          { messageAdded }: { messageAdded: Message },
          args,
          { currentUser, injector }
        ) => {
          if (!currentUser) return false;

          return injector.get(Chats).isParticipant({
            chatId: messageAdded.chat_id,
            userId: currentUser.id,
          });
        }
      ),
    },

    chatAdded: {
      subscribe: withFilter(
        (root, args, { injector }) =>
          injector.get(PubSub).asyncIterator('chatAdded'),
        async (
          { chatAdded }: { chatAdded: Chat },
          args,
          { currentUser, injector }
        ) => {
          if (!currentUser) return false;

          return injector.get(Chats).isParticipant({
            chatId: chatAdded.id,
            userId: currentUser.id,
          });
        }
      ),
    },

    chatRemoved: {
      subscribe: withFilter(
        (root, args, { injector }) =>
          injector.get(PubSub).asyncIterator('chatRemoved'),
        async (
          { targetChat }: { targetChat: Chat },
          args,
          { currentUser, injector }
        ) => {
          if (!currentUser) return false;

          return injector.get(Chats).isParticipant({
            chatId: targetChat.id,
            userId: currentUser.id,
          });
        }
      ),
    },
  },
};

export default new GraphQLModule({
  name: 'chats',
  typeDefs,
  resolvers,
  imports: () => [commonModule, usersModule],
  providers: () => [UnsplashApi, Chats],
});

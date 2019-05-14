import { GraphQLModule } from '@graphql-modules/core';
import { gql, withFilter } from 'apollo-server-express';
import sql from 'sql-template-strings';
import commonModule from '../common';
import usersModule from '../users';
import { Message, Chat, pool } from '../../db';
import { Resolvers } from '../../types/graphql';
import { UnsplashApi } from './unsplash.api';

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

    async chat(message, args, { db }) {
      const { rows } = await db.query(sql`
        SELECT * FROM chats WHERE id = ${message.chat_id}
      `);
      return rows[0] || null;
    },

    async sender(message, args, { db }) {
      const { rows } = await db.query(sql`
        SELECT * FROM users WHERE id = ${message.sender_user_id}
      `);
      return rows[0] || null;
    },

    async recipient(message, args, { db }) {
      const { rows } = await db.query(sql`
        SELECT users.* FROM users, chats_users
        WHERE chats_users.user_id != ${message.sender_user_id}
        AND chats_users.chat_id = ${message.chat_id}
      `);
      return rows[0] || null;
    },

    isMine(message, args, { currentUser }) {
      return message.sender_user_id === currentUser.id;
    },
  },

  Chat: {
    async name(chat, args, { currentUser, db }) {
      if (!currentUser) return null;

      const { rows } = await db.query(sql`
        SELECT users.* FROM users, chats_users
        WHERE users.id != ${currentUser.id}
        AND users.id = chats_users.user_id
        AND chats_users.chat_id = ${chat.id}`);

      const participant = rows[0];

      return participant ? participant.name : null;
    },

    async picture(chat, args, { currentUser, db, injector }) {
      if (!currentUser) return null;

      const { rows } = await db.query(sql`
        SELECT users.* FROM users, chats_users
        WHERE users.id != ${currentUser.id}
        AND users.id = chats_users.user_id
        AND chats_users.chat_id = ${chat.id}`);

      const participant = rows[0];

      return participant && participant.picture
        ? participant.picture
        : injector.get(UnsplashApi).getRandomPhoto();
    },

    async messages(chat, args, { db }) {
      const { rows } = await db.query(
        sql`SELECT * FROM messages WHERE chat_id = ${chat.id}`
      );

      return rows;
    },

    async lastMessage(chat, args, { db }) {
      const { rows } = await db.query(sql`
        SELECT * FROM messages 
        WHERE chat_id = ${chat.id} 
        ORDER BY created_at DESC 
        LIMIT 1`);

      return rows[0];
    },

    async participants(chat, args, { db }) {
      const { rows } = await db.query(sql`
        SELECT users.* FROM users, chats_users
        WHERE chats_users.chat_id = ${chat.id}
        AND chats_users.user_id = users.id
      `);

      return rows;
    },
  },

  Query: {
    async chats(root, args, { currentUser, db }) {
      if (!currentUser) return [];

      const { rows } = await db.query(sql`
        SELECT chats.* FROM chats, chats_users
        WHERE chats.id = chats_users.chat_id
        AND chats_users.user_id = ${currentUser.id}
      `);

      return rows;
    },

    async chat(root, { chatId }, { currentUser, db }) {
      if (!currentUser) return null;

      const { rows } = await db.query(sql`
        SELECT chats.* FROM chats, chats_users
        WHERE chats_users.chat_id = ${chatId}
        AND chats.id = chats_users.chat_id
        AND chats_users.user_id = ${currentUser.id}
      `);

      return rows[0] ? rows[0] : null;
    },
  },

  Mutation: {
    async addMessage(root, { chatId, content }, { currentUser, pubsub, db }) {
      if (!currentUser) return null;

      const { rows } = await db.query(sql`
        INSERT INTO messages(chat_id, sender_user_id, content)
        VALUES(${chatId}, ${currentUser.id}, ${content})
        RETURNING *
      `);

      const messageAdded = rows[0];

      pubsub.publish('messageAdded', {
        messageAdded,
      });

      return messageAdded;
    },

    async addChat(root, { recipientId }, { currentUser, pubsub, db }) {
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

        pubsub.publish('chatAdded', {
          chatAdded,
        });

        return chatAdded;
      } catch (e) {
        await db.query('ROLLBACK');
        throw e;
      }
    },

    async removeChat(root, { chatId }, { currentUser, pubsub, db }) {
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

        pubsub.publish('chatRemoved', {
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
        (root, args, { pubsub }) => pubsub.asyncIterator('messageAdded'),
        async (
          { messageAdded }: { messageAdded: Message },
          args,
          { currentUser }
        ) => {
          if (!currentUser) return false;

          const { rows } = await pool.query(sql`
            SELECT * FROM chats_users 
            WHERE chat_id = ${messageAdded.chat_id} 
            AND user_id = ${currentUser.id}`);

          return !!rows.length;
        }
      ),
    },

    chatAdded: {
      subscribe: withFilter(
        (root, args, { pubsub }) => pubsub.asyncIterator('chatAdded'),
        async ({ chatAdded }: { chatAdded: Chat }, args, { currentUser }) => {
          if (!currentUser) return false;

          const { rows } = await pool.query(sql`
            SELECT * FROM chats_users 
            WHERE chat_id = ${chatAdded.id} 
            AND user_id = ${currentUser.id}`);

          return !!rows.length;
        }
      ),
    },

    chatRemoved: {
      subscribe: withFilter(
        (root, args, { pubsub }) => pubsub.asyncIterator('chatRemoved'),
        async ({ targetChat }: { targetChat: Chat }, args, { currentUser }) => {
          if (!currentUser) return false;

          const { rows } = await pool.query(sql`
            SELECT * FROM chats_users 
            WHERE chat_id = ${targetChat.id} 
            AND user_id = ${currentUser.id}`);

          return !!rows.length;
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
  providers: () => [UnsplashApi],
});

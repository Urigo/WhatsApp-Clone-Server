import { Injectable, Inject, ProviderScope } from '@graphql-modules/di';
import sql from 'sql-template-strings';
import { Database } from '../common/database.provider';

@Injectable({
  scope: ProviderScope.Session,
})
export class Chats {
  @Inject() private db: Database;

  async findChatsByUser(userId: string) {
    const db = await this.db.getClient();

    const { rows } = await db.query(sql`
      SELECT chats.* FROM chats, chats_users
      WHERE chats.id = chats_users.chat_id
      AND chats_users.user_id = ${userId}
    `);

    return rows;
  }

  async findChatByUser({ chatId, userId }: { chatId: string; userId: string }) {
    const db = await this.db.getClient();
    const { rows } = await db.query(sql`
      SELECT chats.* FROM chats, chats_users
      WHERE chats_users.chat_id = ${chatId}
      AND chats.id = chats_users.chat_id
      AND chats_users.user_id = ${userId}
    `);

    return rows[0] || null;
  }

  async findChatById(chatId: string) {
    const db = await this.db.getClient();
    const { rows } = await db.query(sql`
      SELECT * FROM chats WHERE id = ${chatId}
    `);
    return rows[0] || null;
  }

  async findMessagesByChat(chatId: string) {
    const db = await this.db.getClient();
    const { rows } = await db.query(
      sql`SELECT * FROM messages WHERE chat_id = ${chatId}`
    );

    return rows;
  }

  async lastMessage(chatId: string) {
    const db = await this.db.getClient();
    const { rows } = await db.query(sql`
      SELECT * FROM messages 
      WHERE chat_id = ${chatId} 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    return rows[0];
  }

  async firstRecipient({ chatId, userId }: { chatId: string; userId: string }) {
    const db = await this.db.getClient();
    const { rows } = await db.query(sql`
      SELECT users.* FROM users, chats_users
      WHERE users.id != ${userId}
      AND users.id = chats_users.user_id
      AND chats_users.chat_id = ${chatId}
    `);

    return rows[0] || null;
  }

  async participants(chatId: string) {
    const db = await this.db.getClient();
    const { rows } = await db.query(sql`
      SELECT users.* FROM users, chats_users
      WHERE chats_users.chat_id = ${chatId}
      AND chats_users.user_id = users.id
    `);

    return rows;
  }
}

import { Injectable, Inject, ProviderScope } from '@graphql-modules/di';
import sql from 'sql-template-strings';
import { Database } from '../common/database.provider';

@Injectable({
  scope: ProviderScope.Session,
})
export class Users {
  @Inject() private db: Database;

  async findAllExcept(userId: string) {
    const db = await this.db.getClient();
    const { rows } = await db.query(
      sql`SELECT * FROM users WHERE id != ${userId}`
    );

    return rows;
  }
}

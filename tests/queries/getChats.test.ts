import { createTestClient } from 'apollo-server-testing';
import { ApolloServer, gql } from 'apollo-server-express';
import schema from '../../schema';
import { pool, resetDb } from '../../db';
import sql from 'sql-template-strings';
import { MyContext } from '../../context';

describe('Query.chats', () => {
  beforeEach(resetDb);

  it('should fetch all chats', async () => {
    const { rows } = await pool.query(sql`SELECT * FROM users WHERE id = 1`);
    const currentUser = rows[0];
    const server = new ApolloServer({
      schema,
      context: async () => ({
        currentUser,
        db: await pool.connect(),
      }),
      formatResponse: (res: any, { context }: { context: MyContext }) => {
        context.db.release();
        return res;
      },
    });

    const { query } = createTestClient(server);

    const res = await query({
      query: gql`
        query GetChats {
          chats {
            id
            name
            picture
            lastMessage {
              id
              content
              createdAt
            }
          }
        }
      `,
    });

    expect(res.data).toBeDefined();
    expect(res.errors).toBeUndefined();
    expect(res.data).toMatchSnapshot();
  });
});

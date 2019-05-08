import { createTestClient } from 'apollo-server-testing';
import { ApolloServer, PubSub, gql } from 'apollo-server-express';
import schema from '../../schema';
import { resetDb, pool } from '../../db';
import sql from 'sql-template-strings';
import { MyContext } from '../../context';

describe('Mutation.addChat', () => {
  beforeEach(resetDb);

  it('creates a new chat between current user and specified recipient', async () => {
    const { rows } = await pool.query(sql`SELECT * FROM users WHERE id = 2`);
    const currentUser = rows[0];
    const server = new ApolloServer({
      schema,
      context: async () => ({
        pubsub: new PubSub(),
        currentUser,
        db: await pool.connect(),
      }),
      formatResponse: (res: any, { context }: { context: MyContext }) => {
        context.db.release();
        return res;
      },
    });

    const { query, mutate } = createTestClient(server);

    const addChatRes = await mutate({
      variables: { recipientId: '3' },
      mutation: gql`
        mutation AddChat($recipientId: ID!) {
          addChat(recipientId: $recipientId) {
            id
            name
            participants {
              id
            }
          }
        }
      `,
    });

    expect(addChatRes.data).toBeDefined();
    expect(addChatRes.errors).toBeUndefined();
    expect(addChatRes.data).toMatchSnapshot();

    const getChatRes = await query({
      variables: { chatId: '5' },
      query: gql`
        query GetChat($chatId: ID!) {
          chat(chatId: $chatId) {
            id
            name
            participants {
              id
            }
          }
        }
      `,
    });

    expect(getChatRes.data).toBeDefined();
    expect(getChatRes.errors).toBeUndefined();
    expect(getChatRes.data).toMatchSnapshot();
  });

  it('returns the existing chat if so', async () => {
    const { rows } = await pool.query(sql`SELECT * FROM users WHERE id = 1`);
    const currentUser = rows[0];
    const server = new ApolloServer({
      schema,
      context: async () => ({
        pubsub: new PubSub(),
        currentUser,
        db: await pool.connect(),
      }),
      formatResponse: (res: any, { context }: { context: MyContext }) => {
        context.db.release();
        return res;
      },
    });

    const { query, mutate } = createTestClient(server);

    const addChatRes = await mutate({
      variables: { recipientId: '2' },
      mutation: gql`
        mutation AddChat($recipientId: ID!) {
          addChat(recipientId: $recipientId) {
            id
            name
            participants {
              id
            }
          }
        }
      `,
    });

    expect(addChatRes.data).toBeDefined();
    expect(addChatRes.errors).toBeUndefined();
    expect(addChatRes.data).toMatchSnapshot();
  });
});

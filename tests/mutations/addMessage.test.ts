import { createTestClient } from 'apollo-server-testing';
import { ApolloServer, PubSub, gql } from 'apollo-server-express';
import { rootModule } from '../../index';
import { resetDb, pool } from '../../db';
import sql from 'sql-template-strings';
import { MyContext } from '../../context';

describe('Mutation.addMessage', () => {
  beforeEach(resetDb);

  it('should add message to specified chat', async () => {
    const { rows } = await pool.query(sql`SELECT * FROM users WHERE id = 1`);
    const currentUser = rows[0];
    const server = new ApolloServer({
      schema: rootModule.schema,
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

    const addMessageRes = await mutate({
      variables: { chatId: '1', content: 'Hello World' },
      mutation: gql`
        mutation AddMessage($chatId: ID!, $content: String!) {
          addMessage(chatId: $chatId, content: $content) {
            id
            content
          }
        }
      `,
    });

    expect(addMessageRes.data).toBeDefined();
    expect(addMessageRes.errors).toBeUndefined();
    expect(addMessageRes.data).toMatchSnapshot();

    const getChatRes = await query({
      variables: { chatId: '1' },
      query: gql`
        query GetChat($chatId: ID!) {
          chat(chatId: $chatId) {
            id
            lastMessage {
              id
              content
            }
          }
        }
      `,
    });

    expect(getChatRes.data).toBeDefined();
    expect(getChatRes.errors).toBeUndefined();
    expect(getChatRes.data).toMatchSnapshot();
  });
});

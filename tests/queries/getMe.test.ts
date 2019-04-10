import { createTestClient } from 'apollo-server-testing';
import { ApolloServer, gql } from 'apollo-server-express';
import schema from '../../schema';
import { users } from '../../db';

describe('Query.me', () => {
  it('should fetch current user', async () => {
    const server = new ApolloServer({
      schema,
      context: () => ({
        currentUser: users[0],
      }),
    });

    const { query } = createTestClient(server);

    const res = await query({
      query: gql`
        query GetMe {
          me {
            id
            name
            picture
          }
        }
      `,
    });

    expect(res.data).toBeDefined();
    expect(res.errors).toBeUndefined();
    expect(res.data).toMatchSnapshot();
  });
});

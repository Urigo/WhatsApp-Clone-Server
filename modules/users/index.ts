import { GraphQLModule } from '@graphql-modules/core';
import { gql } from 'apollo-server-express';
import cookie from 'cookie';
import sql from 'sql-template-strings';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import commonModule from '../common';
import { secret, expiration } from '../../env';
import { pool } from '../../db';
import { validateLength, validatePassword } from '../../validators';
import { Resolvers } from '../../types/graphql';
import { Users } from './users.provider';

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    picture: URL
  }

  extend type Query {
    me: User
    users: [User!]!
  }

  extend type Mutation {
    signIn(username: String!, password: String!): User
    signUp(
      name: String!
      username: String!
      password: String!
      passwordConfirm: String!
    ): User
  }
`;

const resolvers: Resolvers = {
  Query: {
    me(root, args, { currentUser }) {
      return currentUser || null;
    },
    async users(root, args, { currentUser, injector }) {
      if (!currentUser) return [];

      return injector.get(Users).findAllExcept(currentUser.id);
    },
  },
  Mutation: {
    async signIn(root, { username, password }, { injector, res }) {
      const user = await injector.get(Users).findByUsername(username);

      if (!user) {
        throw new Error('user not found');
      }

      const passwordsMatch = bcrypt.compareSync(password, user.password);

      if (!passwordsMatch) {
        throw new Error('password is incorrect');
      }

      const authToken = jwt.sign(username, secret);

      res.cookie('authToken', authToken, { maxAge: expiration });

      return user;
    },

    async signUp(
      root,
      { name, username, password, passwordConfirm },
      { injector }
    ) {
      validateLength('req.name', name, 3, 50);
      validateLength('req.username', username, 3, 18);
      validatePassword('req.password', password);

      if (password !== passwordConfirm) {
        throw Error("req.password and req.passwordConfirm don't match");
      }

      const existingUser = await injector.get(Users).findByUsername(username);
      if (existingUser) {
        throw Error('username already exists');
      }

      const createdUser = await injector.get(Users).newUser({
        username,
        password,
        name,
      });

      return createdUser;
    },
  },
};

export default new GraphQLModule({
  name: 'users',
  typeDefs,
  resolvers,
  imports: () => [commonModule],
  providers: () => [Users],
  async context(session) {
    let currentUser;

    // Access the request object
    let req = session.connection
      ? session.connection.context.request
      : session.req;

    // It's subscription
    if (session.connection) {
      req.cookies = cookie.parse(req.headers.cookie || '');
    }

    if (req.cookies.authToken) {
      const username = jwt.verify(req.cookies.authToken, secret) as string;

      if (username) {
        const { rows } = await pool.query(
          sql`SELECT * FROM users WHERE username = ${username}`
        );
        currentUser = rows[0];
      }
    }

    return {
      currentUser,
    };
  },
});

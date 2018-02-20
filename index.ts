import { schema } from "./schema";
import bodyParser from "body-parser";
import cors from 'cors';
import express from 'express';
import { ApolloServer } from "apollo-server-express";
import passport from "passport";
import basicStrategy from 'passport-http';
import bcrypt from 'bcrypt-nodejs';
import { db, UserDb } from "./db";
import { createServer } from "http";

let users = db.users;

function generateHash(password: string) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
}

function validPassword(password: string, localPassword: string) {
  return bcrypt.compareSync(password, localPassword);
}

passport.use('basic-signin', new basicStrategy.BasicStrategy(
  function (username: string, password: string, done: any) {
    const user = users.find(user => user.username == username);
    if (user && validPassword(password, user.password)) {
      return done(null, user);
    }
    return done(null, false);
  }
));

passport.use('basic-signup', new basicStrategy.BasicStrategy({passReqToCallback: true},
  function (req: any, username: any, password: any, done: any) {
    const userExists = !!users.find(user => user.username === username);
    if (!userExists && password && req.body.name) {
      const user: UserDb = {
        id: (users.length && users[users.length - 1].id + 1) || 1,
        username,
        password: generateHash(password),
        name: req.body.name,
      };
      users.push(user);
      return done(null, user);
    }
    return done(null, false);
  }
));

const PORT = 3000;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

app.post('/signup',
  passport.authenticate('basic-signup', {session: false}),
  function (req: any, res) {
    res.json(req.user);
  });

app.use(passport.authenticate('basic-signin', {session: false}));

app.post('/signin', function (req: any, res) {
  res.json(req.user);
});

const apollo = new ApolloServer({
  schema,
  context(received: any) {
    return {
      user: received.connection ? received.connection.context.user : received.req!['user'],
    }
  },
  subscriptions: {
    onConnect: (connectionParams: any, webSocket: any) => {
      if (connectionParams.authToken) {
        // create a buffer and tell it the data coming in is base64
        const buf = new Buffer(connectionParams.authToken.split(' ')[1], 'base64');
        // read it back out as a string
        const [username, password]: string[] = buf.toString().split(':');
        if (username && password) {
          const user = users.find(user => user.username == username);

          if (user && validPassword(password, user.password)) {
            // Set context for the WebSocket
            return {user};
          } else {
            throw new Error('Wrong credentials!');
          }
        }
      }
      throw new Error('Missing auth token!');
    }
  }
});

apollo.applyMiddleware({
  app,
  path: '/graphql'
});

// Wrap the Express server
const ws = createServer(app);

apollo.installSubscriptionHandlers(ws);

ws.listen(PORT, () => {
  console.log(`Apollo Server is now running on http://localhost:${PORT}`);
});

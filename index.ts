import { schema } from "./schema";
import * as bodyParser from "body-parser";
import * as cors from 'cors';
import * as express from 'express';
import { graphiqlExpress, graphqlExpress } from "apollo-server-express";
import * as passport from "passport";
import * as basicStrategy from 'passport-http';
import * as bcrypt from 'bcrypt-nodejs';
import { db, User } from "./db";

let users = db.users;

function generateHash(password: string) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
}

function validPassword(password: string, localPassword: string) {
  return bcrypt.compareSync(password, localPassword);
}

passport.use('basic-signin', new basicStrategy.BasicStrategy(
  function (username, password, done) {
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
      const user: User = {
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
  function (req, res) {
    res.json(req.user);
  });

app.use(passport.authenticate('basic-signin', {session: false}));

app.post('/signin', function (req, res) {
  res.json(req.user);
});

app.use('/graphql', graphqlExpress(req => ({
  schema: schema,
  context: {
    user: req!['user'],
  },
})));

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

app.listen(PORT);

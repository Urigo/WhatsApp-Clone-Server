/// <reference path="./cloudinary.d.ts" />
require('dotenv').config();
import { schema } from "./schema";
import bodyParser from "body-parser";
import cors from 'cors';
import express from 'express';
import { ApolloServer } from "apollo-server-express";
import cloudinary from 'cloudinary';
import multer from 'multer';
import tmp from 'tmp';
import passport from "passport";
import basicStrategy from 'passport-http';
import bcrypt from 'bcrypt-nodejs';
import { db, UserDb } from "./db";

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

const PORT = 4000;
const CLOUDINARY_URL = process.env.CLOUDINARY_URL || '';

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

const match = CLOUDINARY_URL.match(/cloudinary:\/\/(\d+):(\w+)@(\.+)/);

if (match) {
  const [api_key, api_secret, cloud_name] = match.slice(1);
  cloudinary.config({ api_key, api_secret, cloud_name });
}

const upload = multer({
  dest: tmp.dirSync({ unsafeCleanup: true }).name,
});

app.post('/upload-profile-pic', upload.single('file'), async (req: any, res, done) => {
  try {
    res.json(await new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload(req.file.path, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
    }));
  } catch (e) {
    done(e);
  }
});

const apollo = new ApolloServer({
  schema,
  context(received: any) {
    return {
      currentUser: received.req!['user'],
    }
  },
});

apollo.applyMiddleware({
  app,
  path: '/graphql'
});

app.listen(PORT);

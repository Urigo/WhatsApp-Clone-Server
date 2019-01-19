import { Inject, Injectable } from '@graphql-modules/di';
import { Connection } from "typeorm";
import { Express } from "express";
import passport from "passport";
import basicStrategy from "passport-http";
import { User } from "../../../entity/User";
import bcrypt from "bcrypt-nodejs";
import { APP } from "../../app.symbols";

export function generateHash(password: string) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
}

export function validPassword(password: string, localPassword: string) {
  return bcrypt.compareSync(password, localPassword);
}

@Injectable()
export class AuthProvider {
  constructor(
    connection: Connection,
    @Inject(APP) app: Express,
  ) {
    passport.use('basic-signin', new basicStrategy.BasicStrategy(
      async function (username: string, password: string, done: any) {
        const user = await connection.getRepository(User).findOne({where: { username }});
        if (user && validPassword(password, user.password)) {
          return done(null, user);
        }
        return done(null, false);
      }
    ));

    passport.use('basic-signup', new basicStrategy.BasicStrategy({passReqToCallback: true},
      async function (req: any, username: string, password: string, done: any) {
        const userExists = !!(await connection.getRepository(User).findOne({where: { username }}));
        if (!userExists && password && req.body.name) {
          const user = await connection.manager.save(new User({
            username,
            password: generateHash(password),
            name: req.body.name,
          }));
          return done(null, user);
        }
        return done(null, false);
      }
    ));

    app.post('/signup',
      passport.authenticate('basic-signup', {session: false}),
      function (req: any, res) {
        res.json(req.user);
      });

    app.use(passport.authenticate('basic-signin', {session: false}));

    app.post('/signin', function (req, res) {
      res.json(req.user);
    });
  }
}

import { Inject, Injectable } from '@graphql-modules/di';
import { Connection } from 'typeorm';
import { Express } from 'express';
import passport from 'passport';
import basicStrategy from 'passport-http';
import { User } from '../../../entity/User';
import bcrypt from 'bcrypt-nodejs';
import { APP } from '../../app.symbols';
import { PubSub } from 'apollo-server-express'

@Injectable()
export class AuthProvider {
  constructor(
    connection: Connection,
    @Inject(APP) app: Express,
    pubsub: PubSub,
  ) {
    const userRepository = connection.getRepository(User);
    passport.use('basic-signin', new basicStrategy.BasicStrategy(
      async (username, password, done) => {
        const user = await userRepository.findOne({where: { username }});
        if (user && this.validPassword(password, user.password)) {
          return done(null, user);
        }
        return done(null, false);
      }
    ));

    passport.use('basic-signup', new basicStrategy.BasicStrategy({passReqToCallback: true},
      async (req: any, username: string, password: string, done: any) => {
        const userExists = !!(await userRepository.findOne({where: { username }}));
        if (!userExists && password && req.body.name) {
          const user = await connection.manager.save(new User({
            username,
            password: this.generateHash(password),
            name: req.body.name,
          }));

          pubsub.publish('userAdded', {
            userAdded: user,
          });

          return done(null, user);
        }
        return done(null, false);
      }
    ));

    app.post('/signup',
      passport.authenticate('basic-signup', {session: false}), 
        (req, res) => res.json(req.user)
    );

    app.use(passport.authenticate('basic-signin', {session: false}));

    app.post('/signin', (req, res) => res.json(req.user));
  }
  generateHash(password: string) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
  }

  validPassword(password: string, localPassword: string) {
    return bcrypt.compareSync(password, localPassword);
  }
}

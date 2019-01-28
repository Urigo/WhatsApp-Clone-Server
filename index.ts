/// <reference path="./cloudinary.d.ts" />
import 'reflect-metadata';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { createConnection } from 'typeorm';
import { addSampleData } from './db';
import { AppModule } from './modules/app.module';
import passport from 'passport';
import { BasicStrategy } from 'passport-http';
import multer from 'multer';
import cloudinary from 'cloudinary';
import tmp from 'tmp';
import { AuthProvider } from './modules/auth/providers/auth.provider';
import { UserProvider } from './modules/user/providers/user.provider';

(async() => {
  await createConnection();
  //await addSampleData();

  const PORT = 3000;

  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  const { schema, context, subscriptions, injector } = AppModule;
  
  const authProvider = injector.get(AuthProvider);
  const userProvider = injector.get(UserProvider);

  passport.use('basic-signin', new BasicStrategy(
    async (username, password, done) => 
      done(
        null, 
        await authProvider.signIn(username, password)
      )
  ));

  passport.use('basic-signup', new BasicStrategy({passReqToCallback: true},
    async (req: Express.Request & { body: { name: string }}, username: string, password: string, done: any) => 
      done(
        null, 
        ('name' in req.body) && await authProvider.signUp(username, password, req.body.name)
      )
  ));

  app.post('/signup',
    passport.authenticate('basic-signup', {session: false}), 
      (req, res) => res.json(req.user)
  );

  app.use(passport.authenticate('basic-signin', {session: false}));

  app.post('/signin', (req, res) => res.json(req.user));

  const CLOUDINARY_URL = process.env.CLOUDINARY_URL || '';
  
  const match = CLOUDINARY_URL.match(/cloudinary:\/\/(\d+):(\w+)@(\.+)/);

  if (match) {
    const [api_key, api_secret, cloud_name] = match.slice(1);
    cloudinary.config({ api_key, api_secret, cloud_name });
  }

  const upload = multer({
    dest: tmp.dirSync({ unsafeCleanup: true }).name,
  });

  app.post('/upload-profile-pic', upload.single('file'), async (req, res, done) => {
    try {
      res.json(
        await userProvider.uploadProfilePic(req.file.path)
      );
    } catch (e) {
      done(e);
    }
  });

  const apollo = new ApolloServer({ schema, context, subscriptions });

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
})();


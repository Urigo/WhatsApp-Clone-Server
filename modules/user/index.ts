import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { UserProvider } from './providers/user.provider';
import { AuthModule } from '../auth';
import { Express } from 'express';
import multer from 'multer';
import tmp from 'tmp';
import cloudinary from 'cloudinary';
import { APP } from '../app.symbols';
export const CLOUDINARY_URL = process.env.CLOUDINARY_URL || '';

export const UserModule = new GraphQLModule({
  name: 'User',
  imports: [
    AuthModule,
  ],
  providers: [
    UserProvider,
  ],
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
  middleware: ({ injector }) => {
    const app = injector.get<Express>(APP);
    const match = CLOUDINARY_URL.match(/cloudinary:\/\/(\d+):(\w+)@(\.+)/);

    if (match) {
      const [api_key, api_secret, cloud_name] = match.slice(1);
      cloudinary.config({ api_key, api_secret, cloud_name });
    }

    const upload = multer({
      dest: tmp.dirSync({ unsafeCleanup: true }).name,
    });

    app.post('/upload-profile-pic', upload.single('file'), (req: any, res, done) => {
      cloudinary.v2.uploader.upload(req.file.path, (error, result) => {
        if (error) {
          done(error);
        } else {
          res.json(result);
        }
      })
    });
    return {};
  }
});

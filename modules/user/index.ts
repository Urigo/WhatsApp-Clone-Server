/// <reference path="../../cloudinary.d.ts" />
import { GraphQLModule } from '@graphql-modules/core'
import { InjectFunction, ProviderScope } from '@graphql-modules/di'
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar'
import { Express } from 'express'
import multer from 'multer'
import tmp from 'tmp'
import cloudinary from 'cloudinary'
import { APP } from '../app.symbols'
import { AuthModule } from '../auth'
import { UserProvider } from './providers/user.provider'

const CLOUDINARY_URL = process.env.CLOUDINARY_URL || ''

export const UserModule = new GraphQLModule({
  name: 'User',
  imports: [AuthModule],
  providers: [UserProvider],
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
  defaultProviderScope: ProviderScope.Session,
  middleware: InjectFunction(UserProvider, APP)((userProvider, app: Express) => {
    const match = CLOUDINARY_URL.match(/cloudinary:\/\/(\d+):(\w+)@(\.+)/)

    if (match) {
      const [api_key, api_secret, cloud_name] = match.slice(1)
      cloudinary.config({ api_key, api_secret, cloud_name })
    }

    const upload = multer({
      dest: tmp.dirSync({ unsafeCleanup: true }).name,
    })

    app.post('/upload-profile-pic', upload.single('file'), async (req: any, res, done) => {
      try {
        res.json(await userProvider.uploadProfilePic(req.file.path))
      } catch (e) {
        done(e)
      }
    })
    return {}
  }),
})

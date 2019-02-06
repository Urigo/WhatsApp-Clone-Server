import { GraphQLModule } from '@graphql-modules/core'
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar'
import { Express } from 'express'
import { Connection } from 'typeorm'
import { AuthProvider } from './providers/auth.provider'
import { APP } from '../app.symbols'
import { PubSub } from 'apollo-server-express'
import passport from 'passport'
import basicStrategy from 'passport-http'
import { InjectFunction } from '@graphql-modules/di'

export interface IAppModuleConfig {
  connection: Connection
  app: Express
}

export const AuthModule = new GraphQLModule<IAppModuleConfig>({
  name: 'Auth',
  providers: ({ config: { connection, app } }) => [
    { provide: Connection, useValue: connection },
    { provide: APP, useValue: app },
    PubSub,
    AuthProvider,
  ],
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
  configRequired: true,
  middleware: InjectFunction(AuthProvider, APP)((authProvider, app: Express) => {
    passport.use(
      'basic-signin',
      new basicStrategy.BasicStrategy(async (username: string, password: string, done: any) => {
        done(null, await authProvider.signIn(username, password))
      })
    )

    passport.use(
      'basic-signup',
      new basicStrategy.BasicStrategy(
        { passReqToCallback: true },
        async (
          req: Express.Request & { body: { name?: string } },
          username: string,
          password: string,
          done: any
        ) => {
          const name = req.body.name
          return done(null, !!name && (await authProvider.signUp(username, password, name)))
        }
      )
    )

    app.post('/signup', passport.authenticate('basic-signup', { session: false }), (req, res) =>
      res.json(req.user)
    )

    app.use(passport.authenticate('basic-signin', { session: false }))

    app.post('/signin', (req, res) => res.json(req.user))
    return {}
  }),
})

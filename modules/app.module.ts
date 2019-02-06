import { GraphQLModule } from '@graphql-modules/core'
import { Connection } from 'typeorm'
import { Express } from 'express'
import { AuthModule } from './auth'
import { UserModule } from './user'
import { ChatModule } from './chat'
import { MessageModule } from './message'

export interface IAppModuleConfig {
  connection: Connection
  app: Express
}

export const AppModule = new GraphQLModule<IAppModuleConfig>({
  name: 'App',
  imports: ({ config: { app, connection } }) => [
    AuthModule.forRoot({
      app,
      connection,
    }),
    UserModule,
    ChatModule,
    MessageModule,
  ],
  configRequired: true,
})

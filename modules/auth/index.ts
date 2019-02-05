import { GraphQLModule } from '@graphql-modules/core'
import { Connection } from 'typeorm'
import { AuthProvider } from './providers/auth.provider'

export const AuthModule = new GraphQLModule({
  name: 'Auth',
  providers: ({ config: { connection } }) => [
    { provide: Connection, useValue: connection },
    AuthProvider,
  ],
  configRequired: true,
})

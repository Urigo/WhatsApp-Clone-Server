import { GraphQLModule } from '@graphql-modules/core'
import { InjectFunction, ProviderScope } from '@graphql-modules/di'
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar'
import { AuthModule } from '../auth'
import { UserProvider } from './providers/user.provider'

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
  defaultProviderScope: ProviderScope.Session,
})

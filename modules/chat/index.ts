import { GraphQLModule } from '@graphql-modules/core'
import { ProviderScope } from '@graphql-modules/di'
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar'
import { AuthModule } from '../auth'
import { UserModule } from '../user'
import { UtilsModule } from '../utils.module'
import { ChatProvider } from './providers/chat.provider'

export const ChatModule = new GraphQLModule({
  name: 'Chat',
  imports: [AuthModule, UtilsModule, UserModule],
  providers: [ChatProvider],
  defaultProviderScope: ProviderScope.Session,
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
})

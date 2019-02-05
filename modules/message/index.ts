import { GraphQLModule } from '@graphql-modules/core'
import { ProviderScope } from '@graphql-modules/di'
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar'
import { AuthModule } from '../auth'
import { ChatModule } from '../chat'
import { UserModule } from '../user'
import { UtilsModule } from '../utils.module'
import { MessageProvider } from './providers/message.provider'

export const MessageModule = new GraphQLModule({
  name: 'Message',
  imports: [
    AuthModule,
    UtilsModule,
    UserModule,
    ChatModule,
  ],
  providers: [
    MessageProvider,
  ],
  defaultProviderScope: ProviderScope.Session,
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
})

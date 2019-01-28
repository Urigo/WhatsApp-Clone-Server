import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { UserModule } from '../user';
import { ChatModule } from '../chat';
import { MessageProvider } from './providers/message.provider';
import { AuthModule } from '../auth';
import { ProviderScope } from '@graphql-modules/di';

export const MessageModule = new GraphQLModule({
  name: "Message",
  imports: [
    AuthModule,
    UserModule,
    ChatModule,
  ],
  providers: [
    MessageProvider,
  ],
  defaultProviderScope: ProviderScope.Session,
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
});

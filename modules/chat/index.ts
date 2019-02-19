import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { UserModule } from '../user';
import { ChatProvider } from './providers/chat.provider';
import { AuthModule } from '../auth';
import { ProviderScope } from '@graphql-modules/di';

export const ChatModule = new GraphQLModule({
  name: "Chat",
  imports: [
    AuthModule,
    UserModule,
  ],
  providers: [
    ChatProvider,
  ],
  defaultProviderScope: ProviderScope.Session,
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
});

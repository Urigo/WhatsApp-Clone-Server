import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { UserModule } from '../user';
import { MessageModule } from '../message';
import { ChatModule } from '../chat';
import { RecipientProvider } from './providers/recipient.provider';
import { AuthModule } from '../auth';

export const RecipientModule = new GraphQLModule({
  name: "Recipient",
  imports: [
    AuthModule,
    UserModule,
    ChatModule,
    MessageModule,
  ],
  providers: [
    RecipientProvider,
  ],
  typeDefs: loadSchemaFiles(__dirname + '/schema/'),
  resolvers: loadResolversFiles(__dirname + '/resolvers/'),
});

import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from 'graphql-toolkit';
import { UserModule } from '../user';
import { MessageModule } from '../message';
import { ChatModule } from '../chat';
import { RecipientProvider } from './providers/recipient.provider';
import { CommonModule } from '../common';

export const RecipientModule = new GraphQLModule({
  name: "Recipient",
  imports: [
    CommonModule,
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

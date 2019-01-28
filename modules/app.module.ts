import { GraphQLModule } from '@graphql-modules/core';
import { AuthModule } from './auth';
import { UserModule } from './user';
import { ChatModule } from './chat';
import { MessageModule } from './message';
import { RecipientModule } from './recipient';

export const AppModule = new GraphQLModule({
  name: 'App',
  imports: [
    AuthModule,
    UserModule,
    ChatModule,
    MessageModule,
    RecipientModule,
  ],
});

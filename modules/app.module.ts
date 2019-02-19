import { GraphQLModule } from '@graphql-modules/core';
import { Connection } from 'typeorm';
import { Express } from 'express';
import { AuthModule } from './auth';
import { UserModule } from './user';
import { ChatModule } from './chat';

export interface IAppModuleConfig {
  connection: Connection,
  app: Express;
}

export const AppModule = new GraphQLModule<IAppModuleConfig>({
  name: 'App',
  imports: ({config: {connection, app}}) => [
    AuthModule.forRoot({
      connection,
      app,
    }),
    UserModule,
    ChatModule,
  ],
  configRequired: true,
});

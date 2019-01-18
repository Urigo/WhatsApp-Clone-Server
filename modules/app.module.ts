import { GraphQLModule } from "@graphql-modules/core";
import { Connection } from "typeorm";
import { Express } from "express";
import { AuthModule, IAuthModuleContext } from "./auth";
import { CommonModule, ICommonModuleContext } from "./common";
import { IUserModuleContext, UserModule } from "./user";
import { ChatModule, IChatModuleContext } from "./chat";
import { IMessageModuleContext, MessageModule } from "./message";
import { IRecipientModuleContext, RecipientModule } from "./recipient";
import { PubSub } from "apollo-server-express";

export interface IAppModuleConfig {
  connection?: Connection,
  app?: Express;
  pubsub?: PubSub;
}

export interface IAppModuleSession {}

export interface IAppModuleContext extends IAuthModuleContext, ICommonModuleContext, IUserModuleContext, IChatModuleContext, IMessageModuleContext, IRecipientModuleContext {}

export const AppModule = new GraphQLModule<IAppModuleConfig, IAppModuleSession, IAppModuleContext>({
  name: 'App',
  imports: ({ config: { connection, app, pubsub } }) => [
    AuthModule.forRoot({
      connection,
      app,
    }),
    CommonModule.forRoot({
      connection,
      pubsub,
    }),
    UserModule,
    ChatModule,
    MessageModule,
    RecipientModule,
  ],
  configRequired: true,
});

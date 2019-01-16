import { GraphQLModule } from "@graphql-modules/core";
//import { CommonModule } from "./common";
import { AuthModule } from "./auth";
import { ChatsModule } from "./chat";
import { Connection } from "typeorm";
import { Express } from "express";

export interface AppModuleConfig {
  connection: Connection,
  app: Express;
}

export const AppModule = new GraphQLModule<AppModuleConfig>({
  imports: ({ config: { connection, app } }) => [
    AuthModule.forRoot({
      connection,
      app,
    }),
    /*CommonModule.forRoot({
      connection,
    }),*/
    ChatsModule.forRoot({
      connection,
    }),
  ],
  configRequired: true,
});

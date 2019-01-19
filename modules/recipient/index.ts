import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { AuthModule } from "../auth";
import { UserModule } from "../user";
import { MessageModule } from "../message";
import { ChatModule } from "../chat";

export const RecipientModule = new GraphQLModule({
  name: 'Recipient',
  imports: [
    AuthModule,
    UserModule,
    MessageModule,
    ChatModule,
  ],
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
});

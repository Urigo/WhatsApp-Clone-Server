import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { CommonModule, ICommonModuleContext } from "../common";
import { IUserModuleContext, UserModule } from "../user";
import { ChatModule, IChatModuleContext } from "../chat";
import { MutationResolvers } from "../../types/message";
import { Message } from "../../entity/Message";

export interface IMessageModuleConfig {}

export interface IMessageModuleSession {}

export interface IMessageModuleContext extends ICommonModuleContext, IUserModuleContext, IChatModuleContext {}

export const MessageModule = new GraphQLModule<IMessageModuleConfig, IMessageModuleSession, IMessageModuleContext>({
  name: 'Message',
  imports: [
    CommonModule,
    UserModule,
    ChatModule,
  ],
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
  /*resolversComposition: {
    'Mutation.removeChat': (next: MutationResolvers.RemoveChatResolver): MutationResolvers.RemoveChatResolver => async (root, args, context, info) => {
      console.log("MessageModule's removeChat");
      const {user: currentUser, connection} = context;
      const {chatId} = args;

      const messages = await connection
        .createQueryBuilder(Message, "message")
        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', {chatId})
        .leftJoinAndSelect('message.holders', 'holders')
        .getMany();

      for (let message of messages) {
        message.holders = message.holders.filter(user => user.id !== currentUser.id);

        if (message.holders.length !== 0) {
          // Remove the current user from the message holders
          await connection.getRepository(Message).save(message);
        } else {
          // Simply remove the message
          await connection.getRepository(Message).remove(message);
        }
      }

      return await next(root, args, context, info);
    }
  },*/
});

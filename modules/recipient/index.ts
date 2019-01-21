import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { CommonModule, ICommonModuleContext } from "../common";
import { IUserModuleContext, UserModule } from "../user";
import { IMessageModuleContext, MessageModule } from "../message";
import { ChatModule, IChatModuleContext } from "../chat";
import { MutationResolvers } from "../../types/message";
import { Recipient } from "../../entity/Recipient";
import { Message } from "../../entity/Message";

export interface IRecipientModuleConfig {}

export interface IRecipientModuleSession {}

export interface IRecipientModuleContext extends ICommonModuleContext, IUserModuleContext, IMessageModuleContext, IChatModuleContext {}

export const RecipientModule = new GraphQLModule<IRecipientModuleConfig, IRecipientModuleSession, IRecipientModuleContext>({
  name: 'Recipient',
  imports: [
    CommonModule,
    UserModule,
    MessageModule,
    ChatModule,
  ],
  typeDefs: mergeGraphQLSchemas(loadSchemaFiles(__dirname + '/schema/')),
  resolvers: mergeResolvers(loadResolversFiles(__dirname + '/resolvers/')),
  /*resolversComposition: {
    'Mutation.removeChat': (next: MutationResolvers.RemoveChatResolver): MutationResolvers.RemoveChatResolver => async (root, args, context, info) => {
      console.log("RecipientModule's removeChat");
      const {user: currentUser, connection} = context;
      const {chatId} = args;

      const messages = await connection
        .createQueryBuilder(Message, "message")
        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', {chatId})
        .leftJoinAndSelect('message.holders', 'holders')
        .getMany();

      for (let message of messages) {
        message.holders = message.holders.filter(user => user.id !== currentUser.id);

        if (message.holders.filter(user => user.id !== currentUser.id).length === 0) {
          const recipients = await connection
            .createQueryBuilder(Recipient, "recipient")
            .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {messageId: message.id})
            .innerJoinAndSelect('recipient.user', 'user')
            .getMany();

          for (let recipient of recipients) {
            await connection.getRepository(Recipient).remove(recipient);
          }
        }
      }

      return await next(root, args, context, info);
    }
  },*/
});

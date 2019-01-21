import { GraphQLModule } from '@graphql-modules/core';
import { loadResolversFiles, loadSchemaFiles } from '@graphql-modules/sonar';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { CommonModule, ICommonModuleContext } from "../common";
import { IUserModuleContext, UserModule } from "../user";
import { ChatModule, IChatModuleContext } from "../chat";
import { MutationResolvers } from "../../types/message";
import { Message } from "../../entity/Message";
import { Recipient } from "../../entity/Recipient";

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
  resolversComposition: {
    'Mutation.removeChat': async (next: any): Promise<MutationResolvers.RemoveChatResolver> => async (root, args, context, info) => {
      console.log('---------------------------------CALLED---------------------------------');
      const chatId: string = await next(root, args, context, info);
      const {user: currentUser, connection} = context;

      let messages = await connection
        .createQueryBuilder(Message, "message")
        .innerJoin('message.chat', 'chat', 'chat.id = :chatId', {chatId})
        .getMany();

      // Instead of chaining map and filter we can loop once using reduce
      messages = await messages.reduce<Promise<Message[]>>(async (filtered$, message) => {
        const filtered = await filtered$;

        message.holders = message.holders.filter(user => user.id !== currentUser.id);

        if (message.holders.length !== 0) {
          // Remove the current user from the message holders
          await connection.getRepository(Message).save(message);
          filtered.push(message);
        } else {
          // Simply remove the message
          const recipients = await connection
            .createQueryBuilder(Recipient, "recipient")
            .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {messageId: message.id})
            .innerJoinAndSelect('recipient.user', 'user')
            .getMany();
          for (let recipient of recipients) {
            await connection.getRepository(Recipient).remove(recipient);
          }
          await connection.getRepository(Message).remove(message);
        }

        return filtered;
      }, Promise.resolve([]));

      return chatId;
    }
  },
});

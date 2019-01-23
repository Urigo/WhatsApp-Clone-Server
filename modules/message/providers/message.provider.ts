import { Inject, Injectable } from '@graphql-modules/di'
import { PubSub } from 'apollo-server-express'
import { Connection } from 'typeorm'
import { User } from "../../../entity/User";
import { Chat } from "../../../entity/Chat";
import { ChatProvider } from "../../chat/providers/chat.provider";
import { Message } from "../../../entity/Message";
import { MessageType } from "../../../db";

@Injectable()
export class MessageProvider {
  constructor(
    @Inject(PubSub) private pubsub: PubSub,
    @Inject(Connection) private connection: Connection,
    @Inject(ChatProvider) private chatProvider: ChatProvider,
  ) {
  }

  async addMessage(currentUser: User, chatId: string, content: string) {
    if (content === null || content === '') {
      throw new Error(`Cannot add empty or null messages.`);
    }

    let chat = await this.connection
      .createQueryBuilder(Chat, 'chat')
      .whereInIds(chatId)
      .innerJoinAndSelect('chat.allTimeMembers', 'allTimeMembers')
      .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
      .leftJoinAndSelect('chat.actualGroupMembers', 'actualGroupMembers')
      .getOne();

    if (!chat) {
      throw new Error(`Cannot find chat ${chatId}.`);
    }

    let holders: User[];

    if (!chat.name) {
      // Chat
      if (!chat.listingMembers.map(user => user.id).includes(currentUser.id)) {
        throw new Error(`The chat ${chatId} must be listed for the current user in order to add a message.`);
      }

      // Receiver's user
      const user = chat.allTimeMembers.find(user => user.id !== currentUser.id);

      if (!user) {
        throw new Error(`Cannot find receiver's user.`);
      }

      if (!chat.listingMembers.find(user => user.id === user.id)) {
        // Chat is not listed for the receiver user. Add him to the listingIds
        chat.listingMembers.push(user);

        await this.connection.getRepository(Chat).save(chat);

        this.pubsub.publish('chatAdded', {
          creatorId: currentUser.id,
          chatAdded: chat,
        });
      }

      holders = chat.listingMembers;
    } else {
      // Group
      if (!chat.actualGroupMembers || !chat.actualGroupMembers.find(user => user.id === currentUser.id)) {
        throw new Error(`The user is not a member of the group ${chatId}. Cannot add message.`);
      }

      holders = chat.actualGroupMembers;
    }

    const message = await this.connection.getRepository(Message).save(new Message({
      chat,
      sender: currentUser,
      content,
      type: MessageType.TEXT,
      holders,
      /*recipients: holders.reduce<Recipient[]>((filtered, user) => {
        if (user.id !== currentUser.id) {
          filtered.push(new Recipient({user}));
        }
        return filtered;
      }, []),*/
    }));

    this.pubsub.publish('messageAdded', {
      messageAdded: message,
    });

    return message || null;
  }

  async removeMessages(
    currentUser: User,
    chatId: string,
    {
      messageIds,
      all,
    }: {
      messageIds?: string[]
      all?: boolean
    } = {},
  ) {
    const chat = await this.connection
      .createQueryBuilder(Chat, 'chat')
      .whereInIds(chatId)
      .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
      .innerJoinAndSelect('chat.messages', 'messages')
      .innerJoinAndSelect('messages.holders', 'holders')
      .getOne();

    if (!chat) {
      throw new Error(`Cannot find chat ${chatId}.`);
    }

    if (!chat.listingMembers.find(user => user.id === currentUser.id)) {
      throw new Error(`The chat/group ${chatId} is not listed for the current user so there is nothing to delete.`);
    }

    if (all && messageIds) {
      throw new Error(`Cannot specify both 'all' and 'messageIds'.`)
    }

    if (!all && !(messageIds && messageIds.length)) {
      throw new Error(`'all' and 'messageIds' cannot be both null`)
    }

    let deletedIds: string[] = [];
    // Instead of chaining map and filter we can loop once using reduce
    chat.messages = await chat.messages.reduce<Promise<Message[]>>(async (filtered$, message) => {
      const filtered = await filtered$;

      if (all || messageIds!.map(Number).includes(message.id)) {
        deletedIds.push(String(message.id));
        // Remove the current user from the message holders
        message.holders = message.holders.filter(user => user.id !== currentUser.id);

      }

      if (message.holders.length !== 0) {
        // Remove the current user from the message holders
        await this.connection.getRepository(Message).save(message);
        filtered.push(message);
      } else {
        // Simply remove the message
        /*const recipients = await this.connection
          .createQueryBuilder(Recipient, 'recipient')
          .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {messageId: message.id})
          .innerJoinAndSelect('recipient.user', 'user')
          .getMany();

        for (let recipient of recipients) {
          await this.connection.getRepository(Recipient).remove(recipient);
        }*/

        await this.connection.getRepository(Message).remove(message);
      }

      return filtered;
    }, Promise.resolve([]));

    await this.connection.getRepository(Chat).save(chat);

    return deletedIds;
  }

  async removeChat(currentUser: User, chatId: string) {
    console.log("DEBUG: MessageModule's removeChat");

    const messages = await this.connection
      .createQueryBuilder(Message, "message")
      .innerJoin('message.chat', 'chat', 'chat.id = :chatId', {chatId})
      .leftJoinAndSelect('message.holders', 'holders')
      .getMany();

    for (let message of messages) {
      message.holders = message.holders.filter(user => user.id !== currentUser.id);

      if (message.holders.length !== 0) {
        // Remove the current user from the message holders
        await this.connection.getRepository(Message).save(message);
      } else {
        // Simply remove the message
        await this.connection.getRepository(Message).remove(message);
      }
    }

    return await this.chatProvider.removeChat(currentUser, chatId);
  }

  async getMessageSender(currentUser: User, message: Message) {
    const sender = await this.connection
      .createQueryBuilder(User, 'user')
      .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {
        messageId: message.id,
      })
      .getOne();

    if (!sender) {
      throw new Error(`Message must have a sender.`);
    }

    return sender;
  }

  async getMessageOwnership(currentUser: User, message: Message) {
    return !!(await this.connection
      .createQueryBuilder(User, 'user')
      .whereInIds(currentUser.id)
      .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {
        messageId: message.id,
      })
      .getCount());
  }

  async getMessageHolders(currentUser: User, message: Message) {
    return await this.connection
      .createQueryBuilder(User, 'user')
      .innerJoin('user.holderMessages', 'holderMessages', 'holderMessages.id = :messageId', {
        messageId: message.id,
      })
      .getMany();
  }

  async getMessageChat(currentUser: User, message: Message) {
    const chat = await this.connection
      .createQueryBuilder(Chat, "chat")
      .innerJoin('chat.messages', 'messages', 'messages.id = :messageId', {
        messageId: message.id
      })
      .getOne();

    if (!chat) {
      throw new Error(`Message must have a chat.`);
    }

    return chat;
  }

  async getChatMessages(currentUser: User, chat: Chat, amount: number) {
    let query = this.connection
      .createQueryBuilder(Message, 'message')
      .innerJoin('message.chat', 'chat', 'chat.id = :chatId', {chatId: chat.id})
      .innerJoin('message.holders', 'holders', 'holders.id = :userId', {
        userId: currentUser.id,
      })
      .orderBy({'message.createdAt': 'DESC'});

    if (amount) {
      query = query.take(amount);
    }

    return (await query.getMany()).reverse();
  }

  getChatUnreadMessagesCount(currentUser: User, chat: Chat) {
    return this.connection
      .createQueryBuilder(Message, "message")
      .innerJoin('message.chat', 'chat', 'chat.id = :chatId', {chatId: chat.id})
      .innerJoin('message.recipients', 'recipients', 'recipients.user.id = :userId AND recipients.readAt IS NULL', {
        userId: currentUser.id
      })
      .getCount();
  }

  async filterMessageAdded(currentUser: User, messageAdded: Message) {
    let relevantUsers: User[];

    if (!messageAdded.chat.name) {
      // Chat
      relevantUsers = await this.connection
        .createQueryBuilder(User, 'user')
        .innerJoin(
          'user.listingMemberChats',
          'listingMemberChats',
          'listingMemberChats.id = :chatId',
          {chatId: messageAdded.chat.id},
        )
        .getMany();
    } else {
      // Group
      relevantUsers = await this.connection
        .createQueryBuilder(User, 'user')
        .innerJoin(
          'user.actualGroupMemberChats',
          'actualGroupMemberChats',
          'actualGroupMemberChats.id = :chatId',
          {chatId: messageAdded.chat.id},
        )
        .getMany();
    }

    return relevantUsers.some(user => user.id === currentUser.id);
  }
}

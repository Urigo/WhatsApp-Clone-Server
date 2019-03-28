import { DateTimeResolver, URLResolver } from 'graphql-scalars';
import { User, Message, chats, messages, users } from '../db';
import { Resolvers } from '../types/graphql';

const resolvers: Resolvers = {
  Date: DateTimeResolver,
  URL: URLResolver,

  Message: {
    chat(message) {
      return chats.find(c => c.messages.some(m => m === message.id)) || null;
    },

    sender(message) {
      return users.find(u => u.id === message.sender) || null;
    },

    recipient(message) {
      return users.find(u => u.id === message.recipient) || null;
    },
  },

  Chat: {
    name() {
      // TODO: Resolve in relation to current user
      return null;
    },

    picture() {
      // TODO: Resolve in relation to current user
      return null;
    },

    messages(chat) {
      return messages.filter(m => chat.messages.includes(m.id));
    },

    lastMessage(chat) {
      const lastMessage = chat.messages[chat.messages.length - 1];

      return messages.find(m => m.id === lastMessage) || null;
    },

    participants(chat) {
      return chat.participants
        .map(p => users.find(u => u.id === p))
        .filter(Boolean) as User[];
    },
  },

  Query: {
    chats() {
      return chats;
    },

    chat(root, { chatId }) {
      return chats.find(c => c.id === chatId) || null;
    },
  },

  Mutation: {
    addMessage(root, { chatId, content }, { pubsub }) {
      const chatIndex = chats.findIndex(c => c.id === chatId);

      if (chatIndex === -1) return null;

      const chat = chats[chatIndex];

      const messagesIds = messages.map(currentMessage => Number(currentMessage.id));
      const messageId = String(Math.max(...messagesIds) + 1);
      const message: Message = {
        id: messageId,
        createdAt: new Date(),
        sender: '', // TODO: Fill-in
        recipient: '', // TODO: Fill-in
        content,
      };

      messages.push(message);
      chat.messages.push(messageId);
      // The chat will appear at the top of the ChatsList component
      chats.splice(chatIndex, 1);
      chats.unshift(chat);

      pubsub.publish('messageAdded', {
        messageAdded: message,
      });

      return message;
    },
  },

  Subscription: {
    messageAdded: {
      subscribe: (root, args, { pubsub }) =>
        pubsub.asyncIterator('messageAdded'),
    },
  },
};

export default resolvers;

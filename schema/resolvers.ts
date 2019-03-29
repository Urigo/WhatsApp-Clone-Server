import { withFilter } from 'apollo-server-express';
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

    isMine(message, args, { currentUser }) {
      return message.sender === currentUser.id;
    },
  },

  Chat: {
    name(chat, args, { currentUser }) {
      if (!currentUser) return null;

      const participantId = chat.participants.find(p => p !== currentUser.id);

      if (!participantId) return null;

      const participant = users.find(u => u.id === participantId);

      return participant ? participant.name : null;
    },

    picture(chat, args, { currentUser }) {
      if (!currentUser) return null;

      const participantId = chat.participants.find(p => p !== currentUser.id);

      if (!participantId) return null;

      const participant = users.find(u => u.id === participantId);

      return participant ? participant.picture : null;
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
    chats(root, args, { currentUser }) {
      if (!currentUser) return [];

      return chats.filter(c => c.participants.includes(currentUser.id));
    },

    chat(root, { chatId }, { currentUser }) {
      if (!currentUser) return null;

      const chat = chats.find(c => c.id === chatId);

      if (!chat) return null;

      return chat.participants.includes(currentUser.id) ? chat : null;
    },
  },

  Mutation: {
    addMessage(root, { chatId, content }, { currentUser, pubsub }) {
      if (!currentUser) return null;

      const chatIndex = chats.findIndex(c => c.id === chatId);

      if (chatIndex === -1) return null;

      const chat = chats[chatIndex];
      if (!chat.participants.includes(currentUser.id)) return null;

      const messagesIds = messages.map(currentMessage => Number(currentMessage.id));
      const messageId = String(Math.max(...messagesIds) + 1);
      const message: Message = {
        id: messageId,
        createdAt: new Date(),
        sender: currentUser.id,
        recipient: chat.participants.find(p => p !== currentUser.id) as string,
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
      subscribe: withFilter(
        (root, args, { pubsub }) => pubsub.asyncIterator('messageAdded'),
        ({ messageAdded }, args, { currentUser }) => {
          if (!currentUser) return false;

          return [messageAdded.sender, messageAdded.recipient].includes(
            currentUser.id
          );
        }
      ),
    },
  },
};

export default resolvers;

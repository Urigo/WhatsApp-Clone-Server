import { GraphQLDateTime } from 'graphql-iso-date'
import { chats, messages } from '../db'

const resolvers = {
  Date: GraphQLDateTime,

  Chat: {
    messages(chat: any) {
      return messages.filter(m => chat.messages.includes(m.id))
    },

    lastMessage(chat: any) {
      const lastMessage = chat.messages[chat.messages.length - 1]

      return messages.find(m => m.id === lastMessage)
    },
  },

  Query: {
    chats() {
      return chats
    },
  },
}

export default resolvers

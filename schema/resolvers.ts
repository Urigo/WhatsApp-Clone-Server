import { GraphQLDateTime } from 'graphql-iso-date'
import { chats, messages } from '../db'

const resolvers = {
  Date: GraphQLDateTime,

  Chat: {
    messages(chat: any) {
      return messages.filter(m => chat.messages.includes(m.id))
    },

    lastMessage(chat: any) {
      return messages.find(m => m.id === chat.lastMessage)
    },
  },

  Query: {
    chats() {
      return chats
    },
  },
}

export default resolvers

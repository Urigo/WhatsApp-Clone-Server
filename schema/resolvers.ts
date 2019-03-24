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

    chat(root: any, { chatId }: any) {
      return chats.find(c => c.id === chatId)
    },
  },

  Mutation: {
    addMessage(root: any, { chatId, content }: any) {
      const chatIndex = chats.findIndex(c => c.id === chatId)

      if (chatIndex === -1) return null

      const chat = chats[chatIndex]
      const recentMessage = messages[messages.length - 1]
      const messageId = String(Number(recentMessage.id) + 1)
      const message = {
        id: messageId,
        createdAt: new Date(),
        content,
      }

      messages.push(message)
      chat.messages.push(messageId)
      // The chat will appear at the top of the ChatsList component
      chats.splice(chatIndex, 1)
      chats.unshift(chat)

      return message
    }
  }
}

export default resolvers

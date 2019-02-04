import { IResolvers as IApolloResolvers } from 'apollo-server-express'
import { GraphQLDateTime } from 'graphql-iso-date'
import db from '../db'
import Chat from '../entity/chat'
import Message from '../entity/message'
import Recipient from '../entity/recipient'
import User from '../entity/user'
import { IResolvers } from '../types'

let users = db.users
let chats = db.chats
const currentUser: string = '1'

export default {
  Date: GraphQLDateTime,
  Query: {
    // Show all users for the moment.
    users: () => users.filter(user => user.id !== currentUser),
    chats: () => chats.filter(chat => chat.listingMemberIds.includes(currentUser)),
    chat: (obj, { chatId }) => chats.find(chat => chat.id === chatId) || null,
  },
  Chat: {
    name: (chat) =>
      chat.name
        ? chat.name
        : users.find(
            user => user.id === chat.allTimeMemberIds.find((userId: string) => userId !== currentUser)
          )!.name,
    picture: (chat) =>
      chat.name
        ? chat.picture
        : users.find(
            user => user.id === chat.allTimeMemberIds.find((userId: string) => userId !== currentUser)
          )!.picture,
    allTimeMembers: (chat) =>
      users.filter(user => chat.allTimeMemberIds.includes(user.id)),
    listingMembers: (chat) =>
      users.filter(user => chat.listingMemberIds.includes(user.id)),
    actualGroupMembers: (chat) =>
      users.filter(
        user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)
      ),
    admins: (chat) =>
      users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
    owner: (chat) => users.find(user => chat.ownerId === user.id) || null,
    messages: (chat, { amount = 0 }) => {
      const messages =
        chat.messages
          .filter((message: Message) => message.holderIds.includes(currentUser))
          .sort((a: Message, b: Message) => b.createdAt - a.createdAt) || []
      return (amount ? messages.slice(0, amount) : messages).reverse()
    },
    unreadMessages: (chat) =>
      chat.messages.filter(
        (message: Message) =>
          message.holderIds.includes(currentUser) &&
          message.recipients.find(
            (recipient: Recipient) => recipient.userId === currentUser && !recipient.readAt
          )
      ).length,
    lastMessage: (chat) => chat.messages[chat.messages.length - 1],
    isGroup: (chat) => !!chat.name,
  },
  Message: {
    chat: (message) =>
      chats.find(chat => message.chatId === chat.id) || null,
    sender: (message) =>
      users.find(user => user.id === message.senderId) || null,
    holders: (message) =>
      users.filter(user => message.holderIds.includes(user.id)),
    ownership: (message) => message.senderId === currentUser,
  },
  Recipient: {
    user: (recipient) =>
      users.find(user => recipient.userId === user.id) || null,
    message: (recipient) => {
      const chat = chats.find(chat => recipient.chatId === chat.id)
      return chat ? chat.messages.find(message => recipient.messageId === message.id) || null : null
    },
    chat: (recipient) =>
      chats.find(chat => recipient.chatId === chat.id) || null,
  },
} as IResolvers as IApolloResolvers

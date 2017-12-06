import { db } from "../db";
import { GraphQLDateTime } from 'graphql-iso-date';
import { IResolvers } from '../types';

let users = db.users;
let chats = db.chats;
const currentUser = users[0];

export const resolvers: IResolvers = {
  Date: GraphQLDateTime,
  Query: {
    me: () => currentUser,
    users: () => users.filter(user => user.id !== currentUser.id),
    chats: () => chats.filter(chat => chat.listingMemberIds.includes(currentUser.id)),
    chat: (obj, {chatId}) => chats.find(chat => chat.id === Number(chatId)),
  },
  Chat: {
    name: (chat) => chat.name ? chat.name : users
      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser.id))!.name,
    picture: (chat) => chat.name ? chat.picture : users
      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser.id))!.picture,
    allTimeMembers: (chat) => users.filter(user => chat.allTimeMemberIds.includes(user.id)),
    listingMembers: (chat) => users.filter(user => chat.listingMemberIds.includes(user.id)),
    actualGroupMembers: (chat) => users.filter(user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)),
    admins: (chat) => users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
    owner: (chat) => users.find(user => chat.ownerId === user.id) || null,
    isGroup: (chat) => !!chat.name,
    messages: (chat, {amount = 0}) => {
      const messages = chat.messages
      .filter(message => message.holderIds.includes(currentUser.id))
      .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf()) || [];
      return (amount ? messages.slice(0, amount) : messages).reverse();
    },
    lastMessage: (chat) => {
      return chat.messages
        .filter(message => message.holderIds.includes(currentUser.id))
        .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())[0] || null;
    },
    updatedAt: (chat) => {
      const lastMessage = chat.messages
        .filter(message => message.holderIds.includes(currentUser.id))
        .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())[0];

      return lastMessage ? lastMessage.createdAt : chat.createdAt;
    },
    unreadMessages: (chat) => chat.messages
      .filter(message => message.holderIds.includes(currentUser.id) &&
        message.recipients.find(recipient => recipient.userId === currentUser.id && !recipient.readAt))
      .length,
  },
  Message: {
    chat: (message) => chats.find(chat => message.chatId === chat.id)!,
    sender: (message) => users.find(user => user.id === message.senderId)!,
    holders: (message) => users.filter(user => message.holderIds.includes(user.id)),
    ownership: (message) => message.senderId === currentUser.id,
  },
  Recipient: {
    user: (recipient) => users.find(user => recipient.userId === user.id)!,
    message: (recipient) => {
      const chat = chats.find(chat => recipient.chatId === chat.id)!;
      return chat.messages.find(message => recipient.messageId === message.id)!;
    },
    chat: (recipient) => chats.find(chat => recipient.chatId === chat.id)!,
  },
};

import { db } from "../db";
import { IResolvers } from '../types';

let users = db.users;
let chats = db.chats;
const currentUser = 1;

export const resolvers: IResolvers = {
  Query: {
    // Show all users for the moment.
    users: () => users.filter(user => user.id !== currentUser),
    chats: () => chats.filter(chat => chat.listingMemberIds.includes(currentUser)),
    chat: (obj, {chatId}) => chats.find(chat => chat.id === Number(chatId)),
  },
  Chat: {
    name: (chat): string => chat.name ? chat.name : users
      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.name,
    picture: (chat) => chat.name ? chat.picture : users
      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.picture,
    allTimeMembers: (chat) => users.filter(user => chat.allTimeMemberIds.includes(user.id)),
    listingMembers: (chat) => users.filter(user => chat.listingMemberIds.includes(user.id)),
    actualGroupMembers: (chat) => users.filter(user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)),
    admins: (chat) => users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
    owner: (chat) => users.find(user => chat.ownerId === user.id) || null,
    messages: (chat, {amount = 0}) => {
      const messages = chat.messages
      .filter(message => message.holderIds.includes(currentUser))
      .sort((a, b) => b.createdAt - a.createdAt) || [];
      return (amount ? messages.slice(0, amount) : messages).reverse();
    },
    unreadMessages: (chat) => chat.messages
      .filter(message => message.holderIds.includes(currentUser) &&
        message.recipients.find(recipient => recipient.userId === currentUser && !recipient.readAt))
      .length,
    isGroup: (chat) => !!chat.name,
  },
  Message: {
    chat: (message) => chats.find(chat => message.chatId === chat.id)!,
    sender: (message) => users.find(user => user.id === message.senderId)!,
    holders: (message) => users.filter(user => message.holderIds.includes(user.id)),
    ownership: (message) => message.senderId === currentUser,
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

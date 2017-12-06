import { Chat, db, Message } from "../db";
import { IResolvers } from "graphql-tools/dist/Interfaces";
import { ChatQueryArgs } from "../types";

let users = db.users;
let chats = db.chats;
const currentUser = '1';

export const resolvers: IResolvers = {
  Query: {
    // Show all users for the moment.
    users: () => users.filter(user => user.id !== currentUser),
    chats: () => chats.filter(chat => chat.listingIds.includes(currentUser)),
    chat: (obj: any, {chatId}: ChatQueryArgs) => chats.find(chat => chat.id === chatId),
  },
  Chat: {
    name: (chat: Chat) => chat.name ? chat.name : users
      .find(user => user.id === chat.userIds.find(userId => userId !== currentUser))!.name,
    picture: (chat: Chat) => chat.name ? chat.picture : users
      .find(user => user.id === chat.userIds.find(userId => userId !== currentUser))!.picture,
    messages: (chat: Chat) => chat.messages
      .filter(message => message.holderIds.includes(currentUser))
      .sort((a, b) => a.createdAt - b.createdAt) || [],
    lastMessage: (chat: Chat) => chat.messages
      .filter(message => message.holderIds.includes(currentUser))
      .sort((a, b) => b.createdAt - a.createdAt)[0] || null,
    unreadMessages: (chat: Chat) => chat.messages
      .filter(message => message.holderIds.includes(currentUser) &&
        message.recipients.find(recipient => recipient.id === currentUser && !recipient.readAt))
      .length,
    isGroup: (chat: Chat) => !!chat.name,
  },
  Message: {
    sender: (message: Message) => users.find(user => user.id === message.senderId),
    ownership: (message: Message) => message.senderId === currentUser,
  },
};

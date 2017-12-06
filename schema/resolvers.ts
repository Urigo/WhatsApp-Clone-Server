import { Chat, db, Message, Recipient, User } from "../db";
import { IResolvers } from "graphql-tools/dist/Interfaces";

let users = db.users;
let chats = db.chats;
const currentUser = 1;

export const resolvers: IResolvers = {
  Query: {
    // Show all users for the moment.
    users: (): User[] => users.filter(user => user.id !== currentUser),
    chats: (): Chat[] => chats.filter(chat => chat.listingMemberIds.includes(currentUser)),
    chat: (obj: any, {chatId}): Chat | null => chats.find(chat => chat.id === chatId) || null,
  },
  Chat: {
    name: (chat: Chat): string => chat.name ? chat.name : users
      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.name,
    picture: (chat: Chat) => chat.name ? chat.picture : users
      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.picture,
    allTimeMembers: (chat: Chat): User[] => users.filter(user => chat.allTimeMemberIds.includes(user.id)),
    listingMembers: (chat: Chat): User[] => users.filter(user => chat.listingMemberIds.includes(user.id)),
    actualGroupMembers: (chat: Chat): User[] => users.filter(user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)),
    admins: (chat: Chat): User[] => users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
    owner: (chat: Chat): User | null => users.find(user => chat.ownerId === user.id) || null,
    messages: (chat: Chat, {amount = null}: {amount: number}): Message[] => {
      const messages = chat.messages
      .filter(message => message.holderIds.includes(currentUser))
      .sort((a, b) => b.createdAt - a.createdAt) || <Message[]>[];
      return (amount ? messages.slice(0, amount) : messages).reverse();
    },
    unreadMessages: (chat: Chat): number => chat.messages
      .filter(message => message.holderIds.includes(currentUser) &&
        message.recipients.find(recipient => recipient.userId === currentUser && !recipient.readAt))
      .length,
    isGroup: (chat: Chat): boolean => !!chat.name,
  },
  Message: {
    chat: (message: Message): Chat | null => chats.find(chat => message.chatId === chat.id) || null,
    sender: (message: Message): User | null => users.find(user => user.id === message.senderId) || null,
    holders: (message: Message): User[] => users.filter(user => message.holderIds.includes(user.id)),
    ownership: (message: Message): boolean => message.senderId === currentUser,
  },
  Recipient: {
    user: (recipient: Recipient): User | null => users.find(user => recipient.userId === user.id) || null,
    message: (recipient: Recipient): Message | null => {
      const chat = chats.find(chat => recipient.chatId === chat.id);
      return chat ? chat.messages.find(message => recipient.messageId === message.id) || null : null;
    },
    chat: (recipient: Recipient): Chat | null => chats.find(chat => recipient.chatId === chat.id) || null,
  },
};

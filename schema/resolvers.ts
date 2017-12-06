import { IResolvers } from 'apollo-server-express';
import { ChatDb, db, MessageDb, RecipientDb, UserDb } from "../db";

let users = db.users;
let chats = db.chats;
const currentUser = 1;

export const resolvers: IResolvers = {
  Query: {
    // Show all users for the moment.
    users: (): UserDb[] => users.filter(user => user.id !== currentUser),
    chats: (): ChatDb[] => chats.filter(chat => chat.listingMemberIds.includes(currentUser)),
    chat: (obj: any, {chatId}): ChatDb | null => chats.find(chat => chat.id === chatId) || null,
  },
  Chat: {
    name: (chat: ChatDb): string => chat.name ? chat.name : users
      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.name,
    picture: (chat: ChatDb) => chat.name ? chat.picture : users
      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.picture,
    allTimeMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.allTimeMemberIds.includes(user.id)),
    listingMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.listingMemberIds.includes(user.id)),
    actualGroupMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)),
    admins: (chat: ChatDb): UserDb[] => users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
    owner: (chat: ChatDb): UserDb | null => users.find(user => chat.ownerId === user.id) || null,
    messages: (chat: ChatDb, {amount = 0}: {amount: number}): MessageDb[] => {
      const messages = chat.messages
      .filter(message => message.holderIds.includes(currentUser))
      .sort((a, b) => b.createdAt - a.createdAt) || <MessageDb[]>[];
      return (amount ? messages.slice(0, amount) : messages).reverse();
    },
    unreadMessages: (chat: ChatDb): number => chat.messages
      .filter(message => message.holderIds.includes(currentUser) &&
        message.recipients.find(recipient => recipient.userId === currentUser && !recipient.readAt))
      .length,
    isGroup: (chat: ChatDb): boolean => !!chat.name,
  },
  Message: {
    chat: (message: MessageDb): ChatDb | null => chats.find(chat => message.chatId === chat.id) || null,
    sender: (message: MessageDb): UserDb | null => users.find(user => user.id === message.senderId) || null,
    holders: (message: MessageDb): UserDb[] => users.filter(user => message.holderIds.includes(user.id)),
    ownership: (message: MessageDb): boolean => message.senderId === currentUser,
  },
  Recipient: {
    user: (recipient: RecipientDb): UserDb | null => users.find(user => recipient.userId === user.id) || null,
    message: (recipient: RecipientDb): MessageDb | null => {
      const chat = chats.find(chat => recipient.chatId === chat.id);
      return chat ? chat.messages.find(message => recipient.messageId === message.id) || null : null;
    },
    chat: (recipient: RecipientDb): ChatDb | null => chats.find(chat => recipient.chatId === chat.id) || null,
  },
};

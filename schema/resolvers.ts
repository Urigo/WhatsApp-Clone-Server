import { IResolvers } from 'apollo-server-express';
import { GraphQLDateTime } from 'graphql-iso-date';
import { ChatDb, db, MessageDb, RecipientDb, UserDb } from "../db";

let users = db.users;
let chats = db.chats;
const currentUser = users[0];

export const resolvers: IResolvers = {
  Date: GraphQLDateTime,
  Query: {
    me: (): UserDb => currentUser,
    users: (): UserDb[] => users.filter(user => user.id !== currentUser.id),
    chats: (): ChatDb[] => chats.filter(chat => chat.listingMemberIds.includes(currentUser.id)),
    chat: (obj: any, {chatId}): ChatDb | null => chats.find(chat => chat.id === chatId) || null,
  },
  Chat: {
    name: (chat: ChatDb): string => chat.name ? chat.name : users
      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser.id))!.name,
    picture: (chat: ChatDb) => chat.name ? chat.picture : users
      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser.id))!.picture,
    allTimeMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.allTimeMemberIds.includes(user.id)),
    listingMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.listingMemberIds.includes(user.id)),
    actualGroupMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)),
    admins: (chat: ChatDb): UserDb[] => users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
    owner: (chat: ChatDb): UserDb | null => users.find(user => chat.ownerId === user.id) || null,
    isGroup: (chat: ChatDb): boolean => !!chat.name,
    messages: (chat: ChatDb, {amount = 0}: {amount: number}): MessageDb[] => {
      const messages = chat.messages
      .filter(message => message.holderIds.includes(currentUser.id))
      .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf()) || <MessageDb[]>[];
      return (amount ? messages.slice(0, amount) : messages).reverse();
    },
    lastMessage: (chat: ChatDb): MessageDb => {
      return chat.messages
        .filter(message => message.holderIds.includes(currentUser.id))
        .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())[0] || null;
    },
    updatedAt: (chat: ChatDb): Date => {
      const lastMessage = chat.messages
        .filter(message => message.holderIds.includes(currentUser.id))
        .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())[0];

      return lastMessage ? lastMessage.createdAt : chat.createdAt;
    },
    unreadMessages: (chat: ChatDb): number => chat.messages
      .filter(message => message.holderIds.includes(currentUser.id) &&
        message.recipients.find(recipient => recipient.userId === currentUser.id && !recipient.readAt))
      .length,
  },
  Message: {
    chat: (message: MessageDb): ChatDb | null => chats.find(chat => message.chatId === chat.id) || null,
    sender: (message: MessageDb): UserDb | null => users.find(user => user.id === message.senderId) || null,
    holders: (message: MessageDb): UserDb[] => users.filter(user => message.holderIds.includes(user.id)),
    ownership: (message: MessageDb): boolean => message.senderId === currentUser.id,
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

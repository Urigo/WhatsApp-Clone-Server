import { Chat, db, getRandomId, Message, MessageType, random, Recipient } from "../db";
import { IResolvers } from "graphql-tools/dist/Interfaces";
import { ChatQueryArgs } from "../types";
import * as moment from "moment";

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
  Mutation: {
    addChat: (obj: any, {recipientId}: any) => {
      if (!users.find(user => user.id === recipientId)) {
        throw new Error(`Recipient ${recipientId} doesn't exist.`);
      }

      const chat = chats.find(chat => !chat.name && chat.userIds.includes(currentUser) && chat.userIds.includes(recipientId));
      if (chat) {
        // Chat already exists. Both users are already in the userIds array
        const chatId = chat.id;
        if (!chat.listingIds.includes(currentUser)) {
          // The chat isn't listed for the current user. Add him to the memberIds
          chat.listingIds.push(currentUser);
          chats.find(chat => chat.id === chatId)!.listingIds.push(currentUser);
          return chat;
        } else {
          throw new Error(`Chat already exists.`);
        }
      } else {
        // Create the chat
        const id = (chats.length && String(Number(chats[chats.length - 1].id) + 1)) || '1';
        const chat: Chat = {
          id,
          name: null,
          picture: null,
          adminIds: null,
          ownerId: null,
          userIds: [currentUser, recipientId],
          // Chat will not be listed to the other user until the first message gets written
          listingIds: [currentUser],
          memberIds: null,
          messages: [],
        };
        chats.push(chat);
        return chat;
      }
    },
    addGroup: (obj: any, {recipientIds, groupName}: any) => {
      recipientIds.forEach((recipientId: any) => {
        if (!users.find(user => user.id === recipientId)) {
          throw new Error(`Recipient ${recipientId} doesn't exist.`);
        }
      });

      const id = (chats.length && String(Number(chats[chats.length - 1].id) + 1)) || '1';
      const chat: Chat = {
        id,
        name: groupName,
        picture: null,
        adminIds: [currentUser],
        ownerId: currentUser,
        userIds: [currentUser, ...recipientIds],
        listingIds: [currentUser, ...recipientIds],
        memberIds: [currentUser, ...recipientIds],
        messages: [],
      };
      chats.push(chat);
      return chat;
    },
    removeChat: (obj: any, {chatId}: any) => {
      const chat = chats.find(chat => chat.id === chatId);

      if (!chat) {
        throw new Error(`The chat ${chatId} doesn't exist.`);
      }

      if (!chat.name) {
        // Chat
        if (!chat.listingIds.includes(currentUser)) {
          throw new Error(`The user is not a member of the chat ${chatId}.`);
        }

        // Instead of chaining map and filter we can loop once using reduce
        const messages = chat.messages.reduce<Message[]>((filtered, message) => {
          // Remove the current user from the message holders
          message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser);

          if (message.holderIds.length !== 0) {
            filtered.push(message);
          } // else discard the message

          return filtered;
        }, []);

        // Remove the current user from who gets the chat listed. The chat will no longer appear in his list
        const listingIds = chat.listingIds.filter(listingId => listingId !== currentUser);

        // Check how many members are left
        if (listingIds.length === 0) {
          // Delete the chat
          chats = chats.filter(chat => chat.id !== chatId);
        } else {
          // Update the chat
          chats = chats.map(chat => {
            if (chat.id === chatId) {
              chat = {...chat, listingIds, messages};
            }
            return chat;
          });
        }
        return chatId;
      } else {
        // Group
        if (chat.ownerId !== currentUser) {
          throw new Error(`Group ${chatId} is not owned by the user.`);
        }

        // Instead of chaining map and filter we can loop once using reduce
        const messages = chat.messages.reduce<Message[]>((filtered, message) => {
          // Remove the current user from the message holders
          message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser);

          if (message.holderIds.length !== 0) {
            filtered.push(message);
          } // else discard the message

          return filtered;
        }, []);

        // Remove the current user from who gets the group listed. The group will no longer appear in his list
        const listingIds = chat.listingIds.filter(listingId => listingId !== currentUser);

        // Check how many members (including previous ones who can still access old messages) are left
        if (listingIds.length === 0) {
          // Remove the group
          chats = chats.filter(chat => chat.id !== chatId);
        } else {
          // Update the group

          // Remove the current user from the chat members. He is no longer a member of the group
          const memberIds = chat.memberIds!.filter(memberId => memberId !== currentUser);
          // Remove the current user from the chat admins
          const adminIds = chat.adminIds!.filter(memberId => memberId !== currentUser);
          // Set the owner id to be null. A null owner means the group is read-only
          let ownerId: string | null = null;

          // Check if there is any admin left
          if (adminIds!.length) {
            // Pick an admin as the new owner. The group is no longer read-only
            ownerId = chat.adminIds![0];
          }

          chats = chats.map(chat => {
            if (chat.id === chatId) {
              chat = {...chat, messages, listingIds, memberIds, adminIds, ownerId};
            }
            return chat;
          });
        }
        return chatId;
      }
    },
    addMessage: (obj: any, {chatId, content}: any) => {
      if (content === null || content === '') {
        throw new Error(`Cannot add empty or null messages.`);
      }

      let chat = chats.find(chat => chat.id === chatId);

      if (!chat) {
        throw new Error(`Cannot find chat ${chatId}.`);
      }

      let holderIds = chat.listingIds;

      if (!chat.name) {
        // Chat
        if (!chat.listingIds.find(listingId => listingId === currentUser)) {
          throw new Error(`The chat ${chatId} must be listed for the current user before adding a message.`);
        }

        const recipientId = chat.userIds.filter(userId => userId !== currentUser)[0];

        if (!chat.listingIds.find(listingId => listingId === recipientId)) {
          // Chat is not listed for the recipient. Add him to the listingIds
          const listingIds = chat.listingIds.concat(recipientId);

          chats = chats.map(chat => {
            if (chat.id === chatId) {
              chat = {...chat, listingIds};
            }
            return chat;
          });

          holderIds = listingIds;
        }
      } else {
        // Group
        if (!chat.memberIds!.find(memberId => memberId === currentUser)) {
          throw new Error(`The user is not a member of the group ${chatId}. Cannot add message.`);
        }

        holderIds = chat.memberIds!;
      }

      const id = random ? getRandomId() : (chat.messages.length && String(Number(chat.messages[chat.messages.length - 1].id) + 1)) || '1';

      let recipients: Recipient[] = [];

      holderIds.forEach(holderId => {
        if (holderId !== currentUser) {
          recipients.push({
            id: holderId,
            receivedAt: null,
            readAt: null,
          });
        }
      });

      const message: Message = {
        id,
        senderId: currentUser,
        content,
        createdAt: moment().unix(),
        type: MessageType.TEXT,
        recipients,
        holderIds,
      };

      chats = chats.map(chat => {
        if (chat.id === chatId) {
          chat = {...chat, messages: chat.messages.concat(message)}
        }
        return chat;
      });

      return message;
    },
    removeMessages: (obj: any, {chatId, messageIds, all}: any) => {
      const chat = chats.find(chat => chat.id === chatId);

      if (!chat) {
        throw new Error(`Cannot find chat ${chatId}.`);
      }

      if (!chat.listingIds.find(listingId => listingId === currentUser)) {
        throw new Error(`The chat/group ${chatId} is not listed for the current user, so there is nothing to delete.`);
      }

      if (all && messageIds) {
        throw new Error(`Cannot specify both 'all' and 'messageIds'.`);
      }

      let deletedIds: string[] = [];
      chats = chats.map(chat => {
        if (chat.id === chatId) {
          // Instead of chaining map and filter we can loop once using reduce
          const messages = chat.messages.reduce<Message[]>((filtered, message) => {
            if (all || messageIds!.includes(message.id)) {
              deletedIds.push(message.id);
              // Remove the current user from the message holders
              message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser);
            }

            if (message.holderIds.length !== 0) {
              filtered.push(message);
            } // else discard the message

            return filtered;
          }, []);
          chat = {...chat, messages};
        }
        return chat;
      });
      return deletedIds;
    },
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

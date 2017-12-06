import { Chat, db, Message, MessageType, Recipient } from "../db";
import { IResolvers } from "../types";
import * as moment from "moment";

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
  Mutation: {
    addChat: (obj, {recipientId}) => {
      if (!users.find(user => user.id === recipientId)) {
        throw new Error(`Recipient ${recipientId} doesn't exist.`);
      }

      const chat = chats.find(chat => !chat.name && chat.allTimeMemberIds.includes(currentUser) && chat.allTimeMemberIds.includes(recipientId));
      if (chat) {
        // Chat already exists. Both users are already in the allTimeMemberIds array
        const chatId = chat.id;
        if (!chat.listingMemberIds.includes(currentUser)) {
          // The chat isn't listed for the current user. Add him to the memberIds
          chat.listingMemberIds.push(currentUser);
          chats.find(chat => chat.id === chatId)!.listingMemberIds.push(currentUser);
          return chat;
        } else {
          throw new Error(`Chat already exists.`);
        }
      } else {
        // Create the chat
        const id = (chats.length && chats[chats.length - 1].id + 1) || 1;
        const chat: Chat = {
          id,
          name: null,
          picture: null,
          adminIds: null,
          ownerId: null,
          allTimeMemberIds: [currentUser, recipientId],
          // Chat will not be listed to the other user until the first message gets written
          listingMemberIds: [currentUser],
          actualGroupMemberIds: null,
          messages: [],
        };
        chats.push(chat);
        return chat;
      }
    },
    addGroup: (obj, {recipientIds, groupName}) => {
      recipientIds.forEach((recipientId: any) => {
        if (!users.find(user => user.id === recipientId)) {
          throw new Error(`Recipient ${recipientId} doesn't exist.`);
        }
      });

      const id = (chats.length && chats[chats.length - 1].id + 1) || 1;
      const chat: Chat = {
        id,
        name: groupName,
        picture: null,
        adminIds: [currentUser],
        ownerId: currentUser,
        allTimeMemberIds: [currentUser, ...recipientIds],
        listingMemberIds: [currentUser, ...recipientIds],
        actualGroupMemberIds: [currentUser, ...recipientIds],
        messages: [],
      };
      chats.push(chat);
      return chat;
    },
    removeChat: (obj, {chatId}) => {
      const chat = chats.find(chat => chat.id === chatId);

      if (!chat) {
        throw new Error(`The chat ${chatId} doesn't exist.`);
      }

      if (!chat.name) {
        // Chat
        if (!chat.listingMemberIds.includes(currentUser)) {
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
        const listingMemberIds = chat.listingMemberIds.filter(listingId => listingId !== currentUser);

        // Check how many members are left
        if (listingMemberIds.length === 0) {
          // Delete the chat
          chats = chats.filter(chat => chat.id !== chatId);
        } else {
          // Update the chat
          chats = chats.map(chat => {
            if (chat.id === chatId) {
              chat = {...chat, listingMemberIds, messages};
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
        const listingMemberIds = chat.listingMemberIds.filter(listingId => listingId !== currentUser);

        // Check how many members (including previous ones who can still access old messages) are left
        if (listingMemberIds.length === 0) {
          // Remove the group
          chats = chats.filter(chat => chat.id !== chatId);
        } else {
          // Update the group

          // Remove the current user from the chat members. He is no longer a member of the group
          const actualGroupMemberIds = chat.actualGroupMemberIds!.filter(memberId => memberId !== currentUser);
          // Remove the current user from the chat admins
          const adminIds = chat.adminIds!.filter(memberId => memberId !== currentUser);
          // Set the owner id to be null. A null owner means the group is read-only
          let ownerId: number | null = null;

          // Check if there is any admin left
          if (adminIds!.length) {
            // Pick an admin as the new owner. The group is no longer read-only
            ownerId = chat.adminIds![0];
          }

          chats = chats.map(chat => {
            if (chat.id === chatId) {
              chat = {...chat, messages, listingMemberIds, actualGroupMemberIds, adminIds, ownerId};
            }
            return chat;
          });
        }
        return chatId;
      }
    },
    addMessage: (obj, {chatId, content}) => {
      if (content === null || content === '') {
        throw new Error(`Cannot add empty or null messages.`);
      }

      let chat = chats.find(chat => chat.id === chatId);

      if (!chat) {
        throw new Error(`Cannot find chat ${chatId}.`);
      }

      let holderIds = chat.listingMemberIds;

      if (!chat.name) {
        // Chat
        if (!chat.listingMemberIds.find(listingId => listingId === currentUser)) {
          throw new Error(`The chat ${chatId} must be listed for the current user before adding a message.`);
        }

        const recipientId = chat.allTimeMemberIds.filter(userId => userId !== currentUser)[0];

        if (!chat.listingMemberIds.find(listingId => listingId === recipientId)) {
          // Chat is not listed for the recipient. Add him to the listingMemberIds
          const listingMemberIds = chat.listingMemberIds.concat(recipientId);

          chats = chats.map(chat => {
            if (chat.id === chatId) {
              chat = {...chat, listingMemberIds};
            }
            return chat;
          });

          holderIds = listingMemberIds;
        }
      } else {
        // Group
        if (!chat.actualGroupMemberIds!.find(memberId => memberId === currentUser)) {
          throw new Error(`The user is not a member of the group ${chatId}. Cannot add message.`);
        }

        holderIds = chat.actualGroupMemberIds!;
      }

      const id = (chat.messages.length && chat.messages[chat.messages.length - 1].id + 1) || 1;

      let recipients: Recipient[] = [];

      holderIds.forEach(holderId => {
        if (holderId !== currentUser) {
          recipients.push({
            userId: holderId,
            messageId: id,
            chatId: chatId,
            receivedAt: null,
            readAt: null,
          });
        }
      });

      const message: Message = {
        id,
        chatId,
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
    removeMessages: (obj, {chatId, messageIds, all}) => {
      const chat = chats.find(chat => chat.id === chatId);

      if (!chat) {
        throw new Error(`Cannot find chat ${chatId}.`);
      }

      if (!chat.listingMemberIds.find(listingId => listingId === currentUser)) {
        throw new Error(`The chat/group ${chatId} is not listed for the current user, so there is nothing to delete.`);
      }

      if (all && messageIds) {
        throw new Error(`Cannot specify both 'all' and 'messageIds'.`);
      }

      let deletedIds: number[] = [];
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
    name: (chat) => chat.name ? chat.name : users
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
      .sort((a, b) => b.createdAt - a.createdAt) || <Message[]>[];
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

import { IResolvers } from "../types";
import { GraphQLDateTime } from 'graphql-iso-date';
import { ChatDb, db, MessageDb, MessageType, RecipientDb } from "../db";
import moment from "moment";

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
  Mutation: {
    updateUser: (obj, {name, picture}) => {
      currentUser.name = name || currentUser.name;
      currentUser.picture = picture || currentUser.picture;

      return currentUser;
    },
    addChat: (obj, {userId}) => {
      if (!users.find(user => user.id === Number(userId))) {
        throw new Error(`User ${userId} doesn't exist.`);
      }

      const chat = chats.find(chat => !chat.name && chat.allTimeMemberIds.includes(currentUser.id) && chat.allTimeMemberIds.includes(Number(userId)));
      if (chat) {
        // Chat already exists. Both users are already in the allTimeMemberIds array
        const chatId = chat.id;
        if (!chat.listingMemberIds.includes(currentUser.id)) {
          // The chat isn't listed for the current user. Add him to the memberIds
          chat.listingMemberIds.push(currentUser.id);
          chats.find(chat => chat.id === chatId)!.listingMemberIds.push(currentUser.id);
          return chat;
        } else {
          throw new Error(`Chat already exists.`);
        }
      } else {
        // Create the chat
        const id = (chats.length && chats[chats.length - 1].id + 1) || 1;
        const chat: ChatDb = {
          id,
          createdAt: moment().toDate(),
          name: null,
          picture: null,
          adminIds: null,
          ownerId: null,
          allTimeMemberIds: [currentUser.id, Number(userId)],
          // Chat will not be listed to the other user until the first message gets written
          listingMemberIds: [currentUser.id],
          actualGroupMemberIds: null,
          messages: [],
        };
        chats.push(chat);
        return chat;
      }
    },
    addGroup: (obj, {userIds, groupName, groupPicture}) => {
      userIds.forEach(userId => {
        if (!users.find(user => user.id === Number(userId))) {
          throw new Error(`User ${userId} doesn't exist.`);
        }
      });

      const id = (chats.length && chats[chats.length - 1].id + 1) || 1;
      const chat: ChatDb = {
        id,
        createdAt: moment().toDate(),
        name: groupName,
        picture: groupPicture || null,
        adminIds: [currentUser.id],
        ownerId: currentUser.id,
        allTimeMemberIds: [currentUser.id, ...userIds.map(id => Number(id))],
        listingMemberIds: [currentUser.id, ...userIds.map(id => Number(id))],
        actualGroupMemberIds: [currentUser.id, ...userIds.map(id => Number(id))],
        messages: [],
      };
      chats.push(chat);
      return chat;
    },
    updateGroup: (obj, {chatId, groupName, groupPicture}) => {
      const chat = chats.find(chat => chat.id === Number(chatId));

      if (!chat) {
        throw new Error(`The chat ${chatId} doesn't exist.`);
      }

      if (!chat.name) {
        throw new Error(`The chat ${chatId} is not a group.`);
      }

      chat.name = groupName || chat.name;
      chat.picture = groupPicture || chat.picture;

      return chat;
    },
    removeChat: (obj, {chatId}) => {
      const chat = chats.find(chat => chat.id === Number(chatId));

      if (!chat) {
        throw new Error(`The chat ${chatId} doesn't exist.`);
      }

      if (!chat.name) {
        // Chat
        if (!chat.listingMemberIds.includes(currentUser.id)) {
          throw new Error(`The user is not a member of the chat ${chatId}.`);
        }

        // Instead of chaining map and filter we can loop once using reduce
        const messages = chat.messages.reduce<MessageDb[]>((filtered, message) => {
          // Remove the current user from the message holders
          message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser.id);

          if (message.holderIds.length !== 0) {
            filtered.push(message);
          } // else discard the message

          return filtered;
        }, []);

        // Remove the current user from who gets the chat listed. The chat will no longer appear in his list
        const listingMemberIds = chat.listingMemberIds.filter(listingId => listingId !== currentUser.id);

        // Check how many members are left
        if (listingMemberIds.length === 0) {
          // Delete the chat
          chats = chats.filter(chat => chat.id !== Number(chatId));
        } else {
          // Update the chat
          chats = chats.map(chat => {
            if (chat.id === Number(chatId)) {
              chat = {...chat, listingMemberIds, messages};
            }
            return chat;
          });
        }
        return chatId;
      } else {
        // Group
        if (chat.ownerId !== currentUser.id) {
          throw new Error(`Group ${chatId} is not owned by the user.`);
        }

        // Instead of chaining map and filter we can loop once using reduce
        const messages = chat.messages.reduce<MessageDb[]>((filtered, message) => {
          // Remove the current user from the message holders
          message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser.id);

          if (message.holderIds.length !== 0) {
            filtered.push(message);
          } // else discard the message

          return filtered;
        }, []);

        // Remove the current user from who gets the group listed. The group will no longer appear in his list
        const listingMemberIds = chat.listingMemberIds.filter(listingId => listingId !== currentUser.id);

        // Check how many members (including previous ones who can still access old messages) are left
        if (listingMemberIds.length === 0) {
          // Remove the group
          chats = chats.filter(chat => chat.id !== Number(chatId));
        } else {
          // Update the group

          // Remove the current user from the chat members. He is no longer a member of the group
          const actualGroupMemberIds = chat.actualGroupMemberIds!.filter(memberId => memberId !== currentUser.id);
          // Remove the current user from the chat admins
          const adminIds = chat.adminIds!.filter(memberId => memberId !== currentUser.id);
          // Set the owner id to be null. A null owner means the group is read-only
          let ownerId: number | null = null;

          // Check if there is any admin left
          if (adminIds!.length) {
            // Pick an admin as the new owner. The group is no longer read-only
            ownerId = chat.adminIds![0];
          }

          chats = chats.map(chat => {
            if (chat.id === Number(chatId)) {
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

      let chat = chats.find(chat => chat.id === Number(chatId));

      if (!chat) {
        throw new Error(`Cannot find chat ${chatId}.`);
      }

      let holderIds = chat.listingMemberIds;

      if (!chat.name) {
        // Chat
        if (!chat.listingMemberIds.find(listingId => listingId === currentUser.id)) {
          throw new Error(`The chat ${chatId} must be listed for the current user before adding a message.`);
        }

        // Receiver's user
        const receiverId = chat.allTimeMemberIds.find(userId => userId !== currentUser.id);

        if (!receiverId) {
          throw new Error(`Cannot find receiver's user.`);
        }

        if (!chat.listingMemberIds.find(listingId => listingId === receiverId)) {
          // Chat is not listed for the receiver user. Add him to the listingMemberIds
          chat.listingMemberIds = chat.listingMemberIds.concat(receiverId);

          holderIds = chat.listingMemberIds;
        }
      } else {
        // Group
        if (!chat.actualGroupMemberIds!.find(memberId => memberId === currentUser.id)) {
          throw new Error(`The user is not a member of the group ${chatId}. Cannot add message.`);
        }

        holderIds = chat.actualGroupMemberIds!;
      }

      const id = (chat.messages.length && chat.messages[chat.messages.length - 1].id + 1) || 1;

      let recipients: RecipientDb[] = [];

      holderIds.forEach(holderId => {
        if (holderId !== currentUser.id) {
          recipients.push({
            userId: holderId,
            messageId: id,
            chatId: Number(chatId),
            receivedAt: null,
            readAt: null,
          });
        }
      });

      const message: MessageDb = {
        id,
        chatId: Number(chatId),
        senderId: currentUser.id,
        content,
        createdAt: moment().toDate(),
        type: MessageType.TEXT,
        recipients,
        holderIds,
      };

      chats = chats.map(chat => {
        if (chat.id === Number(chatId)) {
          chat = {...chat, messages: chat.messages.concat(message)}
        }
        return chat;
      });

      return message;
    },
    removeMessages: (obj, {chatId, messageIds, all}) => {
      const chat = chats.find(chat => chat.id === Number(chatId));

      if (!chat) {
        throw new Error(`Cannot find chat ${chatId}.`);
      }

      if (!chat.listingMemberIds.find(listingId => listingId === currentUser.id)) {
        throw new Error(`The chat/group ${chatId} is not listed for the current user, so there is nothing to delete.`);
      }

      if (all && messageIds) {
        throw new Error(`Cannot specify both 'all' and 'messageIds'.`);
      }

      let deletedIds: string[] = [];
      chats = chats.map(chat => {
        if (chat.id === Number(chatId)) {
          // Instead of chaining map and filter we can loop once using reduce
          const messages = chat.messages.reduce<MessageDb[]>((filtered, message) => {
            if (all || messageIds!.map(Number).includes(message.id)) {
              deletedIds.push(String(message.id));
              // Remove the current user from the message holders
              message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser.id);
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

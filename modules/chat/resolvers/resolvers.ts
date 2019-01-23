import { InjectFunction } from '@graphql-modules/di'
import { PubSub, withFilter } from 'apollo-server-express';
import { User } from "../../../entity/User";
import { Chat } from "../../../entity/Chat";
import { IResolvers } from "../../../types/chat";
import { ChatProvider } from "../providers/chat.provider";

export default InjectFunction(PubSub, ChatProvider)((pubsub, chatProvider): IResolvers => ({
  Query: {
    chats: (obj, args, {user: currentUser}) => chatProvider.getChats(currentUser),
    chat: (obj, {chatId}) => chatProvider.getChat(chatId),
  },
  Mutation: {
    addChat: (obj, {userId}, {user: currentUser}) => chatProvider.addChat(currentUser, userId),
    addGroup: (obj, {userIds, groupName, groupPicture}, {user: currentUser}) =>
      chatProvider.addGroup(currentUser, userIds, {
        groupName: groupName || '',
        groupPicture: groupPicture || '',
      }),
    updateChat: (obj, {chatId, name, picture}, {user: currentUser}) => chatProvider.updateChat(currentUser, chatId, {
      name: name || '',
      picture: picture || '',
    }),
    removeChat: (obj, {chatId}, {user: currentUser}) => chatProvider.removeChat(currentUser, chatId),
  },
  Subscription: {
    chatAdded: {
      subscribe: withFilter(() => pubsub.asyncIterator('chatAdded'),
        ({chatAdded, creatorId}: { chatAdded: Chat, creatorId: number }, variables, {user: currentUser}: { user: User }) =>
          chatProvider.filterChatAddedOrUpdated(currentUser, chatAdded, creatorId)
      ),
    },
    chatUpdated: {
      subscribe: withFilter(() => pubsub.asyncIterator('chatUpdated'),
        ({chatUpdated, updaterId}: { chatUpdated: Chat, updaterId: number }, variables, {user: currentUser}: { user: User }) =>
          chatProvider.filterChatAddedOrUpdated(currentUser, chatUpdated, updaterId)
      ),
    },
  },
  Chat: {
    name: (chat, args, {user: currentUser}) => chatProvider.getChatName(currentUser, chat),
    picture: (chat, args, {user: currentUser}) => chatProvider.getChatPicture(currentUser, chat),
    allTimeMembers: (chat, args, {user: currentUser}) => chatProvider.getChatAllTimeMembers(currentUser, chat),
    listingMembers: (chat, args, {user: currentUser}) => chatProvider.getChatListingMembers(currentUser, chat),
    actualGroupMembers: (chat, args, {user: currentUser}) => chatProvider.getChatActualGroupMembers(currentUser, chat),
    admins: (chat, args, {user: currentUser}) => chatProvider.getChatAdmins(currentUser, chat),
    owner: (chat, args, {user: currentUser}) => chatProvider.getChatOwner(currentUser, chat),
    isGroup: (chat) => chatProvider.isChatGroup(chat),
  },
}));

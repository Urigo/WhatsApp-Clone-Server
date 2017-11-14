import { ITypeDefinitions } from "graphql-tools/dist/Interfaces";

export const typeDefs: ITypeDefinitions = `
  type Query {
    contacts: [User!]
    chats: [Chat!]
    chat(chatId: Int!): Chat
  }

  enum MessageType {
    TEXT
    LOCATION
    PICTURE
  }
  
  type Chat {
    #May be a chat or a group
    id: Int!
    #Computed for chats
    name: String
    #Computed for chats
    picture: String
    #All members, current and past ones.
    userIds: [Int!]!
    #Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
    listingIds: [Int!]!
    #Actual members of the group (they are not the only ones who get the group listed). Null for chats.
    memberIds: [Int!]!
    #Null for chats
    adminIds: [Int!]
    #If null the group is read-only. Null for chats.
    ownerId: Int!
    messages: [Message]!
    #Computed property
    lastMessage: Message
    #Computed property
    unreadMessages: Int!
    #Computed property
    isGroup: Boolean!
  }

  type Message {
    id: Int!
    senderId: Int!
    sender: User!
    content: String!
    createdAt: Int
    #FIXME: should return MessageType
    type: Int!
    #Whoever received the message
    recipients: [Recipient!]!
    #Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise
    holderIds: [Int!]!
    #Computed property
    ownership: Boolean!
  }
  
  type Recipient {
    #The user id
    id: Int!
    receivedAt: Int
    readAt: Int
  }

  type User {
    id: Int!
    name: String
    picture: String
    phone: String
  }

  type Mutation {
    addChat(recipientIds: [Int!]!, groupName: String): Int
    removeChat(chatId: Int!): Boolean
    addMessage(chatId: Int!, content: String!): Int
    removeMessages(chatId: Int!, messageIds: [Int!], all: Boolean): Boolean
    addMembers(groupId: Int!, userIds: [Int!]!): Boolean
    removeMembers(groupId: Int!, userIds: [Int!]!): Boolean
    addAdmins(groupId: Int!, userIds: [Int!]!): Boolean
    removeAdmins(groupId: Int!, userIds: [Int!]!): Boolean
    setGroupName(groupId: Int!): Boolean
    setGroupPicture(groupId: Int!): String
    markAsReceived(chatId: Int!): Boolean
    markAsRead(chatId: Int!): Boolean
  }
`;

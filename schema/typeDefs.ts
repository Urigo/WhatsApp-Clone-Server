import { ITypeDefinitions } from "graphql-tools/dist/Interfaces";

export const typeDefs: ITypeDefinitions = `
  scalar Date

  type Query {
    users: [User!]
    chats: [Chat!]
    chat(chatId: ID!): Chat
  }

  type Subscription {
    messageAdded(chatId: ID): Message
    chatAdded: Chat
  }

  enum MessageType {
    LOCATION
    TEXT
    PICTURE
  }
  
  type Chat {
    #May be a chat or a group
    id: ID!
    #Computed for chats
    name: String
    #Computed for chats
    picture: String
    #All members, current and past ones.
    allTimeMembers: [User!]!
    #Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
    listingMembers: [User!]!
    #Actual members of the group (they are not the only ones who get the group listed). Null for chats.
    actualGroupMembers: [User!]!
    #Null for chats
    admins: [User!]
    #If null the group is read-only. Null for chats.
    owner: User
    messages(amount: Int, before: String): [Message]!
    #Return messages in a a Feed Wrapper with cursor based pagination
    messageFeed(amount: Int, before: String): MessageFeed
    #Computed property
    unreadMessages: Int!
    #Computed property
    isGroup: Boolean!
  }
  
  type MessageFeed {
    hasNextPage: Boolean!
    cursor: String
    messages: [Message]!
  }

  type Message {
    id: ID!
    sender: User!
    chat: Chat!
    content: String!
    createdAt: Date!
    #FIXME: should return MessageType
    type: Int!
    #Whoever received the message
    recipients: [Recipient!]!
    #Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise
    holders: [User!]!
    #Computed property
    ownership: Boolean!
  }
  
  type Recipient {
    user: User!
    message: Message!
    chat: Chat!
    receivedAt: Date
    readAt: Date
  }

  type User {
    id: ID!
    name: String
    picture: String
    phone: String
  }

  type Mutation {
    addChat(recipientId: ID!): Chat
    addGroup(recipientIds: [ID!]!, groupName: String!): Chat
    removeChat(chatId: ID!): ID
    addMessage(chatId: ID!, content: String!): Message
    removeMessages(chatId: ID!, messageIds: [ID], all: Boolean): [ID]
    addMembers(groupId: ID!, userIds: [ID!]!): [ID]
    removeMembers(groupId: ID!, userIds: [ID!]!): [ID]
    addAdmins(groupId: ID!, userIds: [ID!]!): [ID]
    removeAdmins(groupId: ID!, userIds: [ID!]!): [ID]
    setGroupName(groupId: ID!): String
    setGroupPicture(groupId: ID!): String
    markAsReceived(chatId: ID!): Boolean
    markAsRead(chatId: ID!): Boolean
  }
`;

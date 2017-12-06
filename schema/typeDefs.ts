import { ITypeDefinitions } from "graphql-tools/dist/Interfaces";

export const typeDefs: ITypeDefinitions = `
  type Query {
    users: [User!]
    chats: [Chat!]
    chat(chatId: ID!): Chat
  }

  enum MessageType {
    TEXT
    LOCATION
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
    userIds: [ID!]!
    #Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
    listingIds: [ID!]!
    #Actual members of the group (they are not the only ones who get the group listed). Null for chats.
    memberIds: [ID!]!
    #Null for chats
    adminIds: [ID!]
    #If null the group is read-only. Null for chats.
    ownerId: ID!
    messages: [Message]!
    #Computed property
    lastMessage: Message
    #Computed property
    unreadMessages: Int!
    #Computed property
    isGroup: Boolean!
  }

  type Message {
    id: ID!
    senderId: ID!
    sender: User!
    content: String!
    createdAt: Int
    #FIXME: should return MessageType
    type: Int!
    #Whoever received the message
    recipients: [Recipient!]!
    #Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise
    holderIds: [ID!]!
    #Computed property
    ownership: Boolean!
  }
  
  type Recipient {
    #The user id
    id: ID!
    receivedAt: Int
    readAt: Int
  }

  type User {
    id: ID!
    name: String
    picture: String
    phone: String
  }
`;

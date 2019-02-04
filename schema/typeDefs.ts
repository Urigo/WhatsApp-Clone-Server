export default `
  scalar Date

  type Query {
    users: [User!]
    chats: [Chat!]
    chat(chatId: ID!): Chat
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
    updatedAt: Date
    #Computed for chats
    picture: String
    #All members, current and past ones.
    allTimeMembers: [User!]!
    #Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
    listingMembers: [User!]!
    #If null the group is read-only. Null for chats.
    owner: User
    messages(amount: Int): [Message]!
    lastMessage: Message
  }

  type Message {
    id: ID!
    sender: User!
    chat: Chat!
    content: String!
    createdAt: Date!
    #FIXME: should return MessageType
    type: Int!
    #Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise
    holders: [User!]!
    #Computed property
    ownership: Boolean!
  }

  type User {
    id: ID!
    name: String
    picture: String
    phone: String
  }
`

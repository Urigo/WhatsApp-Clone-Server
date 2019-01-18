export default `
  type Subscription {
    messageAdded(chatId: ID): Message
  }

  enum MessageType {
    LOCATION
    TEXT
    PICTURE
  }
  
  type Chat {
    messages(amount: Int): [Message]!
    #Computed property
    unreadMessages: Int!
  }

  type Message {
    id: ID!
    sender: User!
    chat: Chat!
    content: String!
    createdAt: String!
    #FIXME: should return MessageType
    type: Int!
    #Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise
    holders: [User!]!
    #Computed property
    ownership: Boolean!
  }

  type Mutation {
    addMessage(chatId: ID!, content: String!): Message
    removeMessages(chatId: ID!, messageIds: [ID], all: Boolean): [ID]
  }
`;

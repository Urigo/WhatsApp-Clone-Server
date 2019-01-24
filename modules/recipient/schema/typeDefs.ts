export default `
  type Chat {
    #Computed property
    unreadMessages: Int!
  }
  
  type Message {
    #Whoever received the message
    recipients: [Recipient!]!
  }
  
  type Recipient {
    user: User!
    message: Message!
    chat: Chat!
    receivedAt: String
    readAt: String
  }

  type Mutation {
    markAsReceived(chatId: ID!): Boolean
    markAsRead(chatId: ID!): Boolean
  }
`;

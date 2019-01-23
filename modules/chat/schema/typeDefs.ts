export default `
  type Query {
    chats: [Chat!]!
    chat(chatId: ID!): Chat
  }

  type Subscription {
    chatAdded: Chat
    chatUpdated: Chat
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
    #Computed property
    isGroup: Boolean!
  }

  type Mutation {
    addChat(userId: ID!): Chat
    addGroup(userIds: [ID!]!, groupName: String!, groupPicture: String): Chat
    updateChat(chatId: ID!, name: String, picture: String): Chat
    removeChat(chatId: ID!): ID
    addAdmins(groupId: ID!, userIds: [ID!]!): [ID]!
    removeAdmins(groupId: ID!, userIds: [ID!]!): [ID]!
    addMembers(groupId: ID!, userIds: [ID!]!): [ID]!
    removeMembers(groupId: ID!, userIds: [ID!]!): [ID]!
  }
`;

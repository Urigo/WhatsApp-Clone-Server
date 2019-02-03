export default `
  type Chat {
    id: ID!
  }

  type Query {
    chats: [Chat!]!
  }
`

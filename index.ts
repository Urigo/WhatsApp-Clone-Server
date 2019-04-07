import { ApolloServer, gql, PubSub } from 'apollo-server-express'
import http from 'http'
import { app } from './app'
import { users } from './db'
import { origin, port } from './env'
import schema from './schema'

const pubsub = new PubSub()
const server = new ApolloServer({
  schema,
  context: ({ req }) => ({
    currentUser: users.find(u => u.id === req.cookies.currentUserId),
    pubsub,
  }),
})

server.applyMiddleware({
  app,
  path: '/graphql',
  cors: { credentials: true, origin },
})

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

httpServer.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})

import { ApolloServer, gql, PubSub } from 'apollo-server-express'
import http from 'http'
import jwt from 'jsonwebtoken'
import { app } from './app'
import { users } from './db'
import { origin, port, secret } from './env'
import schema from './schema'

const pubsub = new PubSub()
const server = new ApolloServer({
  schema,
  context: ({ req, res }) => {
    let currentUser;
    if (req.cookies.authToken) {
      const username = jwt.verify(req.cookies.authToken, secret) as string
      currentUser = username && users.find(u => u.username === username)
    }

    return {
      currentUser,
      pubsub,
      res,
    }
  },
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

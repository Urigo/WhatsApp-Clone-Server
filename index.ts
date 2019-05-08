import { ApolloServer } from 'apollo-server-express'
import http from 'http'
import jwt from 'jsonwebtoken'
import { app } from './app'
import { pool } from './db'
import { origin, port, secret } from './env'
import schema from './schema'
import { MyContext } from './context';
import sql from 'sql-template-strings'
const { PostgresPubSub } = require('graphql-postgres-subscriptions')

const pubsub = new PostgresPubSub({
  host: 'localhost',
  port: 5432,
  user: 'testuser',
  password: 'testpassword',
  database: 'whatsapp'
})
const server = new ApolloServer({
  schema,
  context: async ({ req, res, connection }: any) => {
    let db;

    if(!connection) {
      db = await pool.connect();
    }
    
    let currentUser
    if (req.cookies.authToken) {
      const username = jwt.verify(req.cookies.authToken, secret) as string
      if (username) {
        const { rows } =  await pool.query(sql`SELECT * FROM users WHERE username = ${username}`)
        currentUser = rows[0]
      }
    }
    return {
      currentUser,
      pubsub,
      res,
      db,
    }
  },
  formatResponse: (res: any, { context }: { context: MyContext }) => {
    context.db.release()

    return res
  }
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

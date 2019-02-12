import { ApolloServer } from 'apollo-server-express'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import gql from 'graphql-tag'
import { createServer } from 'http'
import { createConnection } from 'typeorm'
import schema from './schema'

const PORT = 4000

createConnection().then((connection) => {
  const app = express()

  app.use(cors())
  app.use(bodyParser.json())

  const apollo = new ApolloServer({
    schema,
    context: () => ({ connection }),
  })

  apollo.applyMiddleware({
    app,
    path: '/graphql',
  })

  // Wrap the Express server
  const ws = createServer(app)

  apollo.installSubscriptionHandlers(ws)

  ws.listen(PORT, () => {
    console.log(`Apollo Server is now running on http://localhost:${PORT}`)
  })
})

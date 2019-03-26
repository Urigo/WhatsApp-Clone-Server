import { ApolloServer, gql, PubSub } from 'apollo-server-express'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import schema from './schema'

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.get('/_ping', (req, res) => {
  res.send('pong')
})

const pubsub = new PubSub()
const server = new ApolloServer({
  schema,
  context: () => ({ pubsub }),
})

server.applyMiddleware({
  app,
  path: '/graphql',
})

const port = process.env.PORT || 4000

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})

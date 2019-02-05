import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import gql from 'graphql-tag'
import { createServer } from 'http'
import { createConnection } from 'typeorm'
import { addSampleData } from './db'
import { AppModule } from './modules/app.module'

const PORT = 4000

createConnection().then((connection) => {
  if (process.argv.includes('--add-sample-data')) {
    addSampleData(connection)
  }

  const app = express()

  app.use(cors())
  app.use(bodyParser.json())

  const { schema, context } = AppModule.forRoot({ connection })

  const apollo = new ApolloServer({
    schema,
    context,
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

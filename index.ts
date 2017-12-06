import { schema } from "./schema";
import * as bodyParser from "body-parser";
import * as cors from 'cors';
import * as express from 'express';
import { ApolloServer } from "apollo-server-express";

const PORT = 3000;

const app = express();

app.use(cors());
app.use(bodyParser.json());

const apollo = new ApolloServer({
  schema
});

apollo.applyMiddleware({
  app,
  path: '/graphql'
});

app.listen(PORT);

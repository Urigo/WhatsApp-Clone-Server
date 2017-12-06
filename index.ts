import { schema } from "./schema";
import bodyParser from "body-parser";
import cors from 'cors';
import express from 'express';
import { ApolloServer } from "apollo-server-express";

const PORT = 4000;

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

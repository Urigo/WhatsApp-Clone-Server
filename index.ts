import { schema } from "./schema";
import * as bodyParser from "body-parser";
import * as cors from 'cors';
import * as express from 'express';
import { graphiqlExpress, graphqlExpress } from "apollo-server-express";

const PORT = 3000;

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/graphql', graphqlExpress(req => ({
  schema: schema,
  context: req,
})));

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

app.listen(PORT);

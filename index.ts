import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as koaBody from 'koa-bodyparser';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { schema } from "./schema";
import * as cors from '@koa/cors';

const app = new Koa();
const router = new KoaRouter();
const PORT = 3000;

app.use(cors({
  origin: '*',
}));
app.use(koaBody());
router.post('/graphql', graphqlKoa({schema}));
router.get('/graphiql', graphiqlKoa({endpointURL: '/graphql'}));
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT);
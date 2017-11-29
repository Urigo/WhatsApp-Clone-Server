import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as koaBody from 'koa-bodyparser';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { schema } from "./schema";
const cors = require('@koa/cors');

const app = new koa();
const router = new koaRouter();
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

/*
query allChats {
  chats {
    id,
    peerChat,
    recipient,
    messages {
      id,
      content,
      chatIds
    }
  }
}

mutation removeMessage3 {
  removeMessage(messageId: 3)
}

mutation removeMessage8 {
  removeMessage(messageId: 8)
}

mutation removeChat4 {
  removeChat(chatId: 4)
}

mutation removeChat10 {
  removeChat(chatId: 10)
}

mutation addMessage11 {
  addMessage(chatId: 11, content: "Hello!")
}

mutation addChat1 {
  addChat(recipientId: 1)
}

mutation addMessage12 {
  addMessage(chatId: 12, content: "Hello!")
}

mutation addChat6 {
  addChat(recipientId: 6)
}

mutation addMessage13 {
  addMessage(chatId: 12, content: "Nice to meet you")
}
*/
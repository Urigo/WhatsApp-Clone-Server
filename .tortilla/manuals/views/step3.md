# Step 3: Mutations

[//]: # (head-end)


# Chapter 5

First, let's start with the server.
We'll need to install a couple of packages:

    $ npm install @koa/cors apollo-server-koa graphql graphql-tools koa koa-bodyparser koa-router
    $ npm install --save-dev @types/graphql @types/koa @types/koa-bodyparser @types/koa-router @types/koa__cors

Now let's create some empty schemas and resolvers:

[{]: <helper> (diffStep "1.1" files="schema/*")

#### Step 1.1: Create empty Apollo server

##### Added schema&#x2F;index.ts
```diff
@@ -0,0 +1,8 @@
+┊ ┊1┊import { makeExecutableSchema } from 'apollo-server-express';
+┊ ┊2┊import typeDefs from './typeDefs';
+┊ ┊3┊import { resolvers } from './resolvers';
+┊ ┊4┊
+┊ ┊5┊export const schema = makeExecutableSchema({
+┊ ┊6┊  typeDefs,
+┊ ┊7┊  resolvers,
+┊ ┊8┊});
```

##### Added schema&#x2F;resolvers.ts
```diff
@@ -0,0 +1,5 @@
+┊ ┊1┊import { IResolvers } from 'apollo-server-express';
+┊ ┊2┊
+┊ ┊3┊export const resolvers: IResolvers = {
+┊ ┊4┊  Query: {},
+┊ ┊5┊};
```

##### Added schema&#x2F;typeDefs.ts
```diff
@@ -0,0 +1,2 @@
+┊ ┊1┊export default `
+┊ ┊2┊`;
```

[}]: #

Time to create our index:

[{]: <helper> (diffStep "1.1" files="^index.ts")

#### Step 1.1: Create empty Apollo server

##### Added index.ts
```diff
@@ -0,0 +1,23 @@
+┊  ┊ 1┊import { schema } from "./schema";
+┊  ┊ 2┊import * as bodyParser from "body-parser";
+┊  ┊ 3┊import * as cors from 'cors';
+┊  ┊ 4┊import * as express from 'express';
+┊  ┊ 5┊import { ApolloServer } from "apollo-server-express";
+┊  ┊ 6┊
+┊  ┊ 7┊const PORT = 3000;
+┊  ┊ 8┊
+┊  ┊ 9┊const app = express();
+┊  ┊10┊
+┊  ┊11┊app.use(cors());
+┊  ┊12┊app.use(bodyParser.json());
+┊  ┊13┊
+┊  ┊14┊const apollo = new ApolloServer({
+┊  ┊15┊  schema
+┊  ┊16┊});
+┊  ┊17┊
+┊  ┊18┊apollo.applyMiddleware({
+┊  ┊19┊  app,
+┊  ┊20┊  path: '/graphql'
+┊  ┊21┊});
+┊  ┊22┊
+┊  ┊23┊app.listen(PORT);
```

[}]: #

Now we want to feed our graphql server with some data, so let's install moment

    $ npm install moment

and create a fake db:

[{]: <helper> (diffStep "1.2" files="db.ts")

#### Step 1.2: Add fake db

##### Added db.ts
```diff
@@ -0,0 +1,438 @@
+┊   ┊  1┊import * as moment from 'moment';
+┊   ┊  2┊
+┊   ┊  3┊export enum MessageType {
+┊   ┊  4┊  PICTURE,
+┊   ┊  5┊  TEXT,
+┊   ┊  6┊  LOCATION,
+┊   ┊  7┊}
+┊   ┊  8┊
+┊   ┊  9┊export interface User {
+┊   ┊ 10┊  id: number,
+┊   ┊ 11┊  username: string,
+┊   ┊ 12┊  password: string,
+┊   ┊ 13┊  name: string,
+┊   ┊ 14┊  picture?: string | null,
+┊   ┊ 15┊  phone?: string | null,
+┊   ┊ 16┊}
+┊   ┊ 17┊
+┊   ┊ 18┊export interface Chat {
+┊   ┊ 19┊  id: number,
+┊   ┊ 20┊  name?: string | null,
+┊   ┊ 21┊  picture?: string | null,
+┊   ┊ 22┊  // All members, current and past ones.
+┊   ┊ 23┊  allTimeMemberIds: number[],
+┊   ┊ 24┊  // Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
+┊   ┊ 25┊  listingMemberIds: number[],
+┊   ┊ 26┊  // Actual members of the group (they are not the only ones who get the group listed). Null for chats.
+┊   ┊ 27┊  actualGroupMemberIds?: number[] | null,
+┊   ┊ 28┊  adminIds?: number[] | null,
+┊   ┊ 29┊  ownerId?: number | null,
+┊   ┊ 30┊  messages: Message[],
+┊   ┊ 31┊}
+┊   ┊ 32┊
+┊   ┊ 33┊export interface Message {
+┊   ┊ 34┊  id: number,
+┊   ┊ 35┊  chatId: number,
+┊   ┊ 36┊  senderId: number,
+┊   ┊ 37┊  content: string,
+┊   ┊ 38┊  createdAt: number,
+┊   ┊ 39┊  type: MessageType,
+┊   ┊ 40┊  recipients: Recipient[],
+┊   ┊ 41┊  holderIds: number[],
+┊   ┊ 42┊}
+┊   ┊ 43┊
+┊   ┊ 44┊export interface Recipient {
+┊   ┊ 45┊  userId: number,
+┊   ┊ 46┊  messageId: number,
+┊   ┊ 47┊  chatId: number,
+┊   ┊ 48┊  receivedAt: number | null,
+┊   ┊ 49┊  readAt: number | null,
+┊   ┊ 50┊}
+┊   ┊ 51┊
+┊   ┊ 52┊const users: User[] = [
+┊   ┊ 53┊  {
+┊   ┊ 54┊    id: 1,
+┊   ┊ 55┊    username: 'ethan',
+┊   ┊ 56┊    password: '$2a$08$NO9tkFLCoSqX1c5wk3s7z.JfxaVMKA.m7zUDdDwEquo4rvzimQeJm', // 111
+┊   ┊ 57┊    name: 'Ethan Gonzalez',
+┊   ┊ 58┊    picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
+┊   ┊ 59┊    phone: '+391234567890',
+┊   ┊ 60┊  },
+┊   ┊ 61┊  {
+┊   ┊ 62┊    id: 2,
+┊   ┊ 63┊    username: 'bryan',
+┊   ┊ 64┊    password: '$2a$08$xE4FuCi/ifxjL2S8CzKAmuKLwv18ktksSN.F3XYEnpmcKtpbpeZgO', // 222
+┊   ┊ 65┊    name: 'Bryan Wallace',
+┊   ┊ 66┊    picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
+┊   ┊ 67┊    phone: '+391234567891',
+┊   ┊ 68┊  },
+┊   ┊ 69┊  {
+┊   ┊ 70┊    id: 3,
+┊   ┊ 71┊    username: 'avery',
+┊   ┊ 72┊    password: '$2a$08$UHgH7J8G6z1mGQn2qx2kdeWv0jvgHItyAsL9hpEUI3KJmhVW5Q1d.', // 333
+┊   ┊ 73┊    name: 'Avery Stewart',
+┊   ┊ 74┊    picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
+┊   ┊ 75┊    phone: '+391234567892',
+┊   ┊ 76┊  },
+┊   ┊ 77┊  {
+┊   ┊ 78┊    id: 4,
+┊   ┊ 79┊    username: 'katie',
+┊   ┊ 80┊    password: '$2a$08$wR1k5Q3T9FC7fUgB7Gdb9Os/GV7dGBBf4PLlWT7HERMFhmFDt47xi', // 444
+┊   ┊ 81┊    name: 'Katie Peterson',
+┊   ┊ 82┊    picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
+┊   ┊ 83┊    phone: '+391234567893',
+┊   ┊ 84┊  },
+┊   ┊ 85┊  {
+┊   ┊ 86┊    id: 5,
+┊   ┊ 87┊    username: 'ray',
+┊   ┊ 88┊    password: '$2a$08$6.mbXqsDX82ZZ7q5d8Osb..JrGSsNp4R3IKj7mxgF6YGT0OmMw242', // 555
+┊   ┊ 89┊    name: 'Ray Edwards',
+┊   ┊ 90┊    picture: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
+┊   ┊ 91┊    phone: '+391234567894',
+┊   ┊ 92┊  },
+┊   ┊ 93┊  {
+┊   ┊ 94┊    id: 6,
+┊   ┊ 95┊    username: 'niko',
+┊   ┊ 96┊    password: '$2a$08$fL5lZR.Rwf9FWWe8XwwlceiPBBim8n9aFtaem.INQhiKT4.Ux3Uq.', // 666
+┊   ┊ 97┊    name: 'Niccolò Belli',
+┊   ┊ 98┊    picture: 'https://randomuser.me/api/portraits/thumb/men/4.jpg',
+┊   ┊ 99┊    phone: '+391234567895',
+┊   ┊100┊  },
+┊   ┊101┊  {
+┊   ┊102┊    id: 7,
+┊   ┊103┊    username: 'mario',
+┊   ┊104┊    password: '$2a$08$nDHDmWcVxDnH5DDT3HMMC.psqcnu6wBiOgkmJUy9IH..qxa3R6YrO', // 777
+┊   ┊105┊    name: 'Mario Rossi',
+┊   ┊106┊    picture: 'https://randomuser.me/api/portraits/thumb/men/5.jpg',
+┊   ┊107┊    phone: '+391234567896',
+┊   ┊108┊  },
+┊   ┊109┊];
+┊   ┊110┊
+┊   ┊111┊const chats: Chat[] = [
+┊   ┊112┊  {
+┊   ┊113┊    id: 1,
+┊   ┊114┊    name: null,
+┊   ┊115┊    picture: null,
+┊   ┊116┊    allTimeMemberIds: [1, 3],
+┊   ┊117┊    listingMemberIds: [1, 3],
+┊   ┊118┊    adminIds: null,
+┊   ┊119┊    ownerId: null,
+┊   ┊120┊    messages: [
+┊   ┊121┊      {
+┊   ┊122┊        id: 1,
+┊   ┊123┊        chatId: 1,
+┊   ┊124┊        senderId: 1,
+┊   ┊125┊        content: 'You on your way?',
+┊   ┊126┊        createdAt: moment().subtract(1, 'hours').unix(),
+┊   ┊127┊        type: MessageType.TEXT,
+┊   ┊128┊        recipients: [
+┊   ┊129┊          {
+┊   ┊130┊            userId: 3,
+┊   ┊131┊            messageId: 1,
+┊   ┊132┊            chatId: 1,
+┊   ┊133┊            receivedAt: null,
+┊   ┊134┊            readAt: null,
+┊   ┊135┊          },
+┊   ┊136┊        ],
+┊   ┊137┊        holderIds: [1, 3],
+┊   ┊138┊      },
+┊   ┊139┊      {
+┊   ┊140┊        id: 2,
+┊   ┊141┊        chatId: 1,
+┊   ┊142┊        senderId: 3,
+┊   ┊143┊        content: 'Yep!',
+┊   ┊144┊        createdAt: moment().subtract(1, 'hours').add(5, 'minutes').unix(),
+┊   ┊145┊        type: MessageType.TEXT,
+┊   ┊146┊        recipients: [
+┊   ┊147┊          {
+┊   ┊148┊            userId: 1,
+┊   ┊149┊            messageId: 2,
+┊   ┊150┊            chatId: 1,
+┊   ┊151┊            receivedAt: null,
+┊   ┊152┊            readAt: null,
+┊   ┊153┊          },
+┊   ┊154┊        ],
+┊   ┊155┊        holderIds: [3, 1],
+┊   ┊156┊      },
+┊   ┊157┊    ],
+┊   ┊158┊  },
+┊   ┊159┊  {
+┊   ┊160┊    id: 2,
+┊   ┊161┊    name: null,
+┊   ┊162┊    picture: null,
+┊   ┊163┊    allTimeMemberIds: [1, 4],
+┊   ┊164┊    listingMemberIds: [1, 4],
+┊   ┊165┊    adminIds: null,
+┊   ┊166┊    ownerId: null,
+┊   ┊167┊    messages: [
+┊   ┊168┊      {
+┊   ┊169┊        id: 1,
+┊   ┊170┊        chatId: 2,
+┊   ┊171┊        senderId: 1,
+┊   ┊172┊        content: 'Hey, it\'s me',
+┊   ┊173┊        createdAt: moment().subtract(2, 'hours').unix(),
+┊   ┊174┊        type: MessageType.TEXT,
+┊   ┊175┊        recipients: [
+┊   ┊176┊          {
+┊   ┊177┊            userId: 4,
+┊   ┊178┊            messageId: 1,
+┊   ┊179┊            chatId: 2,
+┊   ┊180┊            receivedAt: null,
+┊   ┊181┊            readAt: null,
+┊   ┊182┊          },
+┊   ┊183┊        ],
+┊   ┊184┊        holderIds: [1, 4],
+┊   ┊185┊      },
+┊   ┊186┊    ],
+┊   ┊187┊  },
+┊   ┊188┊  {
+┊   ┊189┊    id: 3,
+┊   ┊190┊    name: null,
+┊   ┊191┊    picture: null,
+┊   ┊192┊    allTimeMemberIds: [1, 5],
+┊   ┊193┊    listingMemberIds: [1, 5],
+┊   ┊194┊    adminIds: null,
+┊   ┊195┊    ownerId: null,
+┊   ┊196┊    messages: [
+┊   ┊197┊      {
+┊   ┊198┊        id: 1,
+┊   ┊199┊        chatId: 3,
+┊   ┊200┊        senderId: 1,
+┊   ┊201┊        content: 'I should buy a boat',
+┊   ┊202┊        createdAt: moment().subtract(1, 'days').unix(),
+┊   ┊203┊        type: MessageType.TEXT,
+┊   ┊204┊        recipients: [
+┊   ┊205┊          {
+┊   ┊206┊            userId: 5,
+┊   ┊207┊            messageId: 1,
+┊   ┊208┊            chatId: 3,
+┊   ┊209┊            receivedAt: null,
+┊   ┊210┊            readAt: null,
+┊   ┊211┊          },
+┊   ┊212┊        ],
+┊   ┊213┊        holderIds: [1, 5],
+┊   ┊214┊      },
+┊   ┊215┊      {
+┊   ┊216┊        id: 2,
+┊   ┊217┊        chatId: 3,
+┊   ┊218┊        senderId: 1,
+┊   ┊219┊        content: 'You still there?',
+┊   ┊220┊        createdAt: moment().subtract(1, 'days').add(16, 'hours').unix(),
+┊   ┊221┊        type: MessageType.TEXT,
+┊   ┊222┊        recipients: [
+┊   ┊223┊          {
+┊   ┊224┊            userId: 5,
+┊   ┊225┊            messageId: 2,
+┊   ┊226┊            chatId: 3,
+┊   ┊227┊            receivedAt: null,
+┊   ┊228┊            readAt: null,
+┊   ┊229┊          },
+┊   ┊230┊        ],
+┊   ┊231┊        holderIds: [1, 5],
+┊   ┊232┊      },
+┊   ┊233┊    ],
+┊   ┊234┊  },
+┊   ┊235┊  {
+┊   ┊236┊    id: 4,
+┊   ┊237┊    name: null,
+┊   ┊238┊    picture: null,
+┊   ┊239┊    allTimeMemberIds: [3, 4],
+┊   ┊240┊    listingMemberIds: [3, 4],
+┊   ┊241┊    adminIds: null,
+┊   ┊242┊    ownerId: null,
+┊   ┊243┊    messages: [
+┊   ┊244┊      {
+┊   ┊245┊        id: 1,
+┊   ┊246┊        chatId: 4,
+┊   ┊247┊        senderId: 3,
+┊   ┊248┊        content: 'Look at my mukluks!',
+┊   ┊249┊        createdAt: moment().subtract(4, 'days').unix(),
+┊   ┊250┊        type: MessageType.TEXT,
+┊   ┊251┊        recipients: [
+┊   ┊252┊          {
+┊   ┊253┊            userId: 4,
+┊   ┊254┊            messageId: 1,
+┊   ┊255┊            chatId: 4,
+┊   ┊256┊            receivedAt: null,
+┊   ┊257┊            readAt: null,
+┊   ┊258┊          },
+┊   ┊259┊        ],
+┊   ┊260┊        holderIds: [3, 4],
+┊   ┊261┊      },
+┊   ┊262┊    ],
+┊   ┊263┊  },
+┊   ┊264┊  {
+┊   ┊265┊    id: 5,
+┊   ┊266┊    name: null,
+┊   ┊267┊    picture: null,
+┊   ┊268┊    allTimeMemberIds: [2, 5],
+┊   ┊269┊    listingMemberIds: [2, 5],
+┊   ┊270┊    adminIds: null,
+┊   ┊271┊    ownerId: null,
+┊   ┊272┊    messages: [
+┊   ┊273┊      {
+┊   ┊274┊        id: 1,
+┊   ┊275┊        chatId: 5,
+┊   ┊276┊        senderId: 2,
+┊   ┊277┊        content: 'This is wicked good ice cream.',
+┊   ┊278┊        createdAt: moment().subtract(2, 'weeks').unix(),
+┊   ┊279┊        type: MessageType.TEXT,
+┊   ┊280┊        recipients: [
+┊   ┊281┊          {
+┊   ┊282┊            userId: 5,
+┊   ┊283┊            messageId: 1,
+┊   ┊284┊            chatId: 5,
+┊   ┊285┊            receivedAt: null,
+┊   ┊286┊            readAt: null,
+┊   ┊287┊          },
+┊   ┊288┊        ],
+┊   ┊289┊        holderIds: [2, 5],
+┊   ┊290┊      },
+┊   ┊291┊      {
+┊   ┊292┊        id: 2,
+┊   ┊293┊        chatId: 6,
+┊   ┊294┊        senderId: 5,
+┊   ┊295┊        content: 'Love it!',
+┊   ┊296┊        createdAt: moment().subtract(2, 'weeks').add(10, 'minutes').unix(),
+┊   ┊297┊        type: MessageType.TEXT,
+┊   ┊298┊        recipients: [
+┊   ┊299┊          {
+┊   ┊300┊            userId: 2,
+┊   ┊301┊            messageId: 2,
+┊   ┊302┊            chatId: 5,
+┊   ┊303┊            receivedAt: null,
+┊   ┊304┊            readAt: null,
+┊   ┊305┊          },
+┊   ┊306┊        ],
+┊   ┊307┊        holderIds: [5, 2],
+┊   ┊308┊      },
+┊   ┊309┊    ],
+┊   ┊310┊  },
+┊   ┊311┊  {
+┊   ┊312┊    id: 6,
+┊   ┊313┊    name: null,
+┊   ┊314┊    picture: null,
+┊   ┊315┊    allTimeMemberIds: [1, 6],
+┊   ┊316┊    listingMemberIds: [1],
+┊   ┊317┊    adminIds: null,
+┊   ┊318┊    ownerId: null,
+┊   ┊319┊    messages: [],
+┊   ┊320┊  },
+┊   ┊321┊  {
+┊   ┊322┊    id: 7,
+┊   ┊323┊    name: null,
+┊   ┊324┊    picture: null,
+┊   ┊325┊    allTimeMemberIds: [2, 1],
+┊   ┊326┊    listingMemberIds: [2],
+┊   ┊327┊    adminIds: null,
+┊   ┊328┊    ownerId: null,
+┊   ┊329┊    messages: [],
+┊   ┊330┊  },
+┊   ┊331┊  {
+┊   ┊332┊    id: 8,
+┊   ┊333┊    name: 'A user 0 group',
+┊   ┊334┊    picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
+┊   ┊335┊    allTimeMemberIds: [1, 3, 4, 6],
+┊   ┊336┊    listingMemberIds: [1, 3, 4, 6],
+┊   ┊337┊    actualGroupMemberIds: [1, 4, 6],
+┊   ┊338┊    adminIds: [1, 6],
+┊   ┊339┊    ownerId: 1,
+┊   ┊340┊    messages: [
+┊   ┊341┊      {
+┊   ┊342┊        id: 1,
+┊   ┊343┊        chatId: 8,
+┊   ┊344┊        senderId: 1,
+┊   ┊345┊        content: 'I made a group',
+┊   ┊346┊        createdAt: moment().subtract(2, 'weeks').unix(),
+┊   ┊347┊        type: MessageType.TEXT,
+┊   ┊348┊        recipients: [
+┊   ┊349┊          {
+┊   ┊350┊            userId: 3,
+┊   ┊351┊            messageId: 1,
+┊   ┊352┊            chatId: 8,
+┊   ┊353┊            receivedAt: null,
+┊   ┊354┊            readAt: null,
+┊   ┊355┊          },
+┊   ┊356┊          {
+┊   ┊357┊            userId: 4,
+┊   ┊358┊            messageId: 1,
+┊   ┊359┊            chatId: 8,
+┊   ┊360┊            receivedAt: moment().subtract(2, 'weeks').add(1, 'minutes').unix(),
+┊   ┊361┊            readAt: moment().subtract(2, 'weeks').add(5, 'minutes').unix(),
+┊   ┊362┊          },
+┊   ┊363┊          {
+┊   ┊364┊            userId: 6,
+┊   ┊365┊            messageId: 1,
+┊   ┊366┊            chatId: 8,
+┊   ┊367┊            receivedAt: null,
+┊   ┊368┊            readAt: null,
+┊   ┊369┊          },
+┊   ┊370┊        ],
+┊   ┊371┊        holderIds: [1, 3, 4, 6],
+┊   ┊372┊      },
+┊   ┊373┊      {
+┊   ┊374┊        id: 2,
+┊   ┊375┊        chatId: 8,
+┊   ┊376┊        senderId: 1,
+┊   ┊377┊        content: 'Ops, user 3 was not supposed to be here',
+┊   ┊378┊        createdAt: moment().subtract(2, 'weeks').add(2, 'minutes').unix(),
+┊   ┊379┊        type: MessageType.TEXT,
+┊   ┊380┊        recipients: [
+┊   ┊381┊          {
+┊   ┊382┊            userId: 4,
+┊   ┊383┊            messageId: 2,
+┊   ┊384┊            chatId: 8,
+┊   ┊385┊            receivedAt: moment().subtract(2, 'weeks').add(3, 'minutes').unix(),
+┊   ┊386┊            readAt: moment().subtract(2, 'weeks').add(5, 'minutes').unix(),
+┊   ┊387┊          },
+┊   ┊388┊          {
+┊   ┊389┊            userId: 6,
+┊   ┊390┊            messageId: 2,
+┊   ┊391┊            chatId: 8,
+┊   ┊392┊            receivedAt: null,
+┊   ┊393┊            readAt: null,
+┊   ┊394┊          },
+┊   ┊395┊        ],
+┊   ┊396┊        holderIds: [1, 4, 6],
+┊   ┊397┊      },
+┊   ┊398┊      {
+┊   ┊399┊        id: 3,
+┊   ┊400┊        chatId: 8,
+┊   ┊401┊        senderId: 4,
+┊   ┊402┊        content: 'Awesome!',
+┊   ┊403┊        createdAt: moment().subtract(2, 'weeks').add(10, 'minutes').unix(),
+┊   ┊404┊        type: MessageType.TEXT,
+┊   ┊405┊        recipients: [
+┊   ┊406┊          {
+┊   ┊407┊            userId: 1,
+┊   ┊408┊            messageId: 3,
+┊   ┊409┊            chatId: 8,
+┊   ┊410┊            receivedAt: null,
+┊   ┊411┊            readAt: null,
+┊   ┊412┊          },
+┊   ┊413┊          {
+┊   ┊414┊            userId: 6,
+┊   ┊415┊            messageId: 3,
+┊   ┊416┊            chatId: 8,
+┊   ┊417┊            receivedAt: null,
+┊   ┊418┊            readAt: null,
+┊   ┊419┊          },
+┊   ┊420┊        ],
+┊   ┊421┊        holderIds: [1, 4, 6],
+┊   ┊422┊      },
+┊   ┊423┊    ],
+┊   ┊424┊  },
+┊   ┊425┊  {
+┊   ┊426┊    id: 9,
+┊   ┊427┊    name: 'A user 5 group',
+┊   ┊428┊    picture: null,
+┊   ┊429┊    allTimeMemberIds: [6, 3],
+┊   ┊430┊    listingMemberIds: [6, 3],
+┊   ┊431┊    actualGroupMemberIds: [6, 3],
+┊   ┊432┊    adminIds: [6],
+┊   ┊433┊    ownerId: 6,
+┊   ┊434┊    messages: [],
+┊   ┊435┊  },
+┊   ┊436┊];
+┊   ┊437┊
+┊   ┊438┊export const db = {users, chats};
```

[}]: #

Its' time to create our schema and our resolvers:

[{]: <helper> (diffStep "1.3")

#### Step 1.3: Add resolvers and schema

##### Changed schema&#x2F;resolvers.ts
```diff
@@ -1,5 +1,51 @@
 ┊ 1┊ 1┊import { IResolvers } from 'apollo-server-express';
+┊  ┊ 2┊import { Chat, db, Message, Recipient, User } from "../db";
+┊  ┊ 3┊
+┊  ┊ 4┊let users = db.users;
+┊  ┊ 5┊let chats = db.chats;
+┊  ┊ 6┊const currentUser = 1;
 ┊ 2┊ 7┊
 ┊ 3┊ 8┊export const resolvers: IResolvers = {
-┊ 4┊  ┊  Query: {},
+┊  ┊ 9┊  Query: {
+┊  ┊10┊    // Show all users for the moment.
+┊  ┊11┊    users: (): User[] => users.filter(user => user.id !== currentUser),
+┊  ┊12┊    chats: (): Chat[] => chats.filter(chat => chat.listingMemberIds.includes(currentUser)),
+┊  ┊13┊    chat: (obj: any, {chatId}): Chat | null => chats.find(chat => chat.id === chatId) || null,
+┊  ┊14┊  },
+┊  ┊15┊  Chat: {
+┊  ┊16┊    name: (chat: Chat): string => chat.name ? chat.name : users
+┊  ┊17┊      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.name,
+┊  ┊18┊    picture: (chat: Chat) => chat.name ? chat.picture : users
+┊  ┊19┊      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.picture,
+┊  ┊20┊    allTimeMembers: (chat: Chat): User[] => users.filter(user => chat.allTimeMemberIds.includes(user.id)),
+┊  ┊21┊    listingMembers: (chat: Chat): User[] => users.filter(user => chat.listingMemberIds.includes(user.id)),
+┊  ┊22┊    actualGroupMembers: (chat: Chat): User[] => users.filter(user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)),
+┊  ┊23┊    admins: (chat: Chat): User[] => users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
+┊  ┊24┊    owner: (chat: Chat): User | null => users.find(user => chat.ownerId === user.id) || null,
+┊  ┊25┊    messages: (chat: Chat, {amount = 0}: {amount: number}): Message[] => {
+┊  ┊26┊      const messages = chat.messages
+┊  ┊27┊      .filter(message => message.holderIds.includes(currentUser))
+┊  ┊28┊      .sort((a, b) => b.createdAt - a.createdAt) || <Message[]>[];
+┊  ┊29┊      return (amount ? messages.slice(0, amount) : messages).reverse();
+┊  ┊30┊    },
+┊  ┊31┊    unreadMessages: (chat: Chat): number => chat.messages
+┊  ┊32┊      .filter(message => message.holderIds.includes(currentUser) &&
+┊  ┊33┊        message.recipients.find(recipient => recipient.userId === currentUser && !recipient.readAt))
+┊  ┊34┊      .length,
+┊  ┊35┊    isGroup: (chat: Chat): boolean => !!chat.name,
+┊  ┊36┊  },
+┊  ┊37┊  Message: {
+┊  ┊38┊    chat: (message: Message): Chat | null => chats.find(chat => message.chatId === chat.id) || null,
+┊  ┊39┊    sender: (message: Message): User | null => users.find(user => user.id === message.senderId) || null,
+┊  ┊40┊    holders: (message: Message): User[] => users.filter(user => message.holderIds.includes(user.id)),
+┊  ┊41┊    ownership: (message: Message): boolean => message.senderId === currentUser,
+┊  ┊42┊  },
+┊  ┊43┊  Recipient: {
+┊  ┊44┊    user: (recipient: Recipient): User | null => users.find(user => recipient.userId === user.id) || null,
+┊  ┊45┊    message: (recipient: Recipient): Message | null => {
+┊  ┊46┊      const chat = chats.find(chat => recipient.chatId === chat.id);
+┊  ┊47┊      return chat ? chat.messages.find(message => recipient.messageId === message.id) || null : null;
+┊  ┊48┊    },
+┊  ┊49┊    chat: (recipient: Recipient): Chat | null => chats.find(chat => recipient.chatId === chat.id) || null,
+┊  ┊50┊  },
 ┊ 5┊51┊};
```

##### Changed schema&#x2F;typeDefs.ts
```diff
@@ -1,2 +1,68 @@
 ┊ 1┊ 1┊export default `
+┊  ┊ 2┊  type Query {
+┊  ┊ 3┊    users: [User!]
+┊  ┊ 4┊    chats: [Chat!]
+┊  ┊ 5┊    chat(chatId: ID!): Chat
+┊  ┊ 6┊  }
+┊  ┊ 7┊
+┊  ┊ 8┊  enum MessageType {
+┊  ┊ 9┊    LOCATION
+┊  ┊10┊    TEXT
+┊  ┊11┊    PICTURE
+┊  ┊12┊  }
+┊  ┊13┊
+┊  ┊14┊  type Chat {
+┊  ┊15┊    #May be a chat or a group
+┊  ┊16┊    id: ID!
+┊  ┊17┊    #Computed for chats
+┊  ┊18┊    name: String
+┊  ┊19┊    #Computed for chats
+┊  ┊20┊    picture: String
+┊  ┊21┊    #All members, current and past ones.
+┊  ┊22┊    allTimeMembers: [User!]!
+┊  ┊23┊    #Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
+┊  ┊24┊    listingMembers: [User!]!
+┊  ┊25┊    #Actual members of the group (they are not the only ones who get the group listed). Null for chats.
+┊  ┊26┊    actualGroupMembers: [User!]!
+┊  ┊27┊    #Null for chats
+┊  ┊28┊    admins: [User!]
+┊  ┊29┊    #If null the group is read-only. Null for chats.
+┊  ┊30┊    owner: User
+┊  ┊31┊    messages(amount: Int): [Message]!
+┊  ┊32┊    #Computed property
+┊  ┊33┊    unreadMessages: Int!
+┊  ┊34┊    #Computed property
+┊  ┊35┊    isGroup: Boolean!
+┊  ┊36┊  }
+┊  ┊37┊
+┊  ┊38┊  type Message {
+┊  ┊39┊    id: ID!
+┊  ┊40┊    sender: User!
+┊  ┊41┊    chat: Chat!
+┊  ┊42┊    content: String!
+┊  ┊43┊    createdAt: String!
+┊  ┊44┊    #FIXME: should return MessageType
+┊  ┊45┊    type: Int!
+┊  ┊46┊    #Whoever received the message
+┊  ┊47┊    recipients: [Recipient!]!
+┊  ┊48┊    #Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise
+┊  ┊49┊    holders: [User!]!
+┊  ┊50┊    #Computed property
+┊  ┊51┊    ownership: Boolean!
+┊  ┊52┊  }
+┊  ┊53┊
+┊  ┊54┊  type Recipient {
+┊  ┊55┊    user: User!
+┊  ┊56┊    message: Message!
+┊  ┊57┊    chat: Chat!
+┊  ┊58┊    receivedAt: String
+┊  ┊59┊    readAt: String
+┊  ┊60┊  }
+┊  ┊61┊
+┊  ┊62┊  type User {
+┊  ┊63┊    id: ID!
+┊  ┊64┊    name: String
+┊  ┊65┊    picture: String
+┊  ┊66┊    phone: String
+┊  ┊67┊  }
 ┊ 2┊68┊`;
```

[}]: #

# Chapter 6

First, let's install `graphql-code-generator`  in our server and add it to the run scripts:

    $ npm install graphql-code-generator

[{]: <helper> (diffStep "2.1")

#### Step 2.1: Install graphql-code-generator

##### Added codegen.yml
```diff
@@ -0,0 +1,11 @@
+┊  ┊ 1┊overwrite: true
+┊  ┊ 2┊schema: './schema/typeDefs.ts'
+┊  ┊ 3┊documents: null
+┊  ┊ 4┊require:
+┊  ┊ 5┊  - ts-node/register
+┊  ┊ 6┊generates:
+┊  ┊ 7┊  ./types.d.ts:
+┊  ┊ 8┊    plugins:
+┊  ┊ 9┊      - 'typescript-common'
+┊  ┊10┊      - 'typescript-server'
+┊  ┊11┊      - 'typescript-resolvers'
```

##### Changed package.json
```diff
@@ -4,7 +4,8 @@
 ┊ 4┊ 4┊  "private": true,
 ┊ 5┊ 5┊  "scripts": {
 ┊ 6┊ 6┊    "start": "npm run build:live",
-┊ 7┊  ┊    "build:live": "nodemon --exec ./node_modules/.bin/ts-node -- ./index.ts"
+┊  ┊ 7┊    "build:live": "nodemon --exec ./node_modules/.bin/ts-node -- ./index.ts",
+┊  ┊ 8┊    "generator": "gql-gen --config codegen.yml"
 ┊ 8┊ 9┊  },
 ┊ 9┊10┊  "devDependencies": {
 ┊10┊11┊    "@types/body-parser": "1.17.0",
```
```diff
@@ -14,7 +15,10 @@
 ┊14┊15┊    "@types/node": "10.11.3",
 ┊15┊16┊    "nodemon": "1.18.4",
 ┊16┊17┊    "ts-node": "7.0.1",
-┊17┊  ┊    "typescript": "3.1.1"
+┊  ┊18┊    "typescript": "3.1.1",
+┊  ┊19┊    "graphql-codegen-typescript-common": "0.16.0-alpha.207cae5d",
+┊  ┊20┊    "graphql-codegen-typescript-server": "0.16.0-alpha.207cae5d",
+┊  ┊21┊    "graphql-codegen-typescript-resolvers": "0.16.0-alpha.207cae5d"
 ┊18┊22┊  },
 ┊19┊23┊  "dependencies": {
 ┊20┊24┊    "apollo-server-express": "2.1.0",
```
```diff
@@ -22,6 +26,7 @@
 ┊22┊26┊    "cors": "2.8.4",
 ┊23┊27┊    "express": "4.16.3",
 ┊24┊28┊    "graphql": "14.0.2",
+┊  ┊29┊    "graphql-code-generator": "0.16.0-alpha.207cae5d",
 ┊25┊30┊    "moment": "2.22.1"
 ┊26┊31┊  }
-┊27┊  ┊}
+┊  ┊32┊}🚫↵
```

[}]: #

Now let's run the generator (the server must be running in the background):

    $ npm run generator

Those are the types created with `npm run generator`:

[{]: <helper> (diffStep "2.2")

#### Step 2.2: Create types with generator

##### Added types.d.ts
```diff
@@ -0,0 +1,454 @@
+┊   ┊  1┊export type Maybe<T> = T | null;
+┊   ┊  2┊
+┊   ┊  3┊export enum MessageType {
+┊   ┊  4┊  Location = "LOCATION",
+┊   ┊  5┊  Text = "TEXT",
+┊   ┊  6┊  Picture = "PICTURE"
+┊   ┊  7┊}
+┊   ┊  8┊
+┊   ┊  9┊// ====================================================
+┊   ┊ 10┊// Types
+┊   ┊ 11┊// ====================================================
+┊   ┊ 12┊
+┊   ┊ 13┊export interface Query {
+┊   ┊ 14┊  users?: Maybe<User[]>;
+┊   ┊ 15┊
+┊   ┊ 16┊  chats?: Maybe<Chat[]>;
+┊   ┊ 17┊
+┊   ┊ 18┊  chat?: Maybe<Chat>;
+┊   ┊ 19┊}
+┊   ┊ 20┊
+┊   ┊ 21┊export interface User {
+┊   ┊ 22┊  id: string;
+┊   ┊ 23┊
+┊   ┊ 24┊  name?: Maybe<string>;
+┊   ┊ 25┊
+┊   ┊ 26┊  picture?: Maybe<string>;
+┊   ┊ 27┊
+┊   ┊ 28┊  phone?: Maybe<string>;
+┊   ┊ 29┊}
+┊   ┊ 30┊
+┊   ┊ 31┊export interface Chat {
+┊   ┊ 32┊  id: string;
+┊   ┊ 33┊
+┊   ┊ 34┊  name?: Maybe<string>;
+┊   ┊ 35┊
+┊   ┊ 36┊  picture?: Maybe<string>;
+┊   ┊ 37┊
+┊   ┊ 38┊  allTimeMembers: User[];
+┊   ┊ 39┊
+┊   ┊ 40┊  listingMembers: User[];
+┊   ┊ 41┊
+┊   ┊ 42┊  actualGroupMembers: User[];
+┊   ┊ 43┊
+┊   ┊ 44┊  admins?: Maybe<User[]>;
+┊   ┊ 45┊
+┊   ┊ 46┊  owner?: Maybe<User>;
+┊   ┊ 47┊
+┊   ┊ 48┊  messages: (Maybe<Message>)[];
+┊   ┊ 49┊
+┊   ┊ 50┊  unreadMessages: number;
+┊   ┊ 51┊
+┊   ┊ 52┊  isGroup: boolean;
+┊   ┊ 53┊}
+┊   ┊ 54┊
+┊   ┊ 55┊export interface Message {
+┊   ┊ 56┊  id: string;
+┊   ┊ 57┊
+┊   ┊ 58┊  sender: User;
+┊   ┊ 59┊
+┊   ┊ 60┊  chat: Chat;
+┊   ┊ 61┊
+┊   ┊ 62┊  content: string;
+┊   ┊ 63┊
+┊   ┊ 64┊  createdAt: string;
+┊   ┊ 65┊
+┊   ┊ 66┊  type: number;
+┊   ┊ 67┊
+┊   ┊ 68┊  recipients: Recipient[];
+┊   ┊ 69┊
+┊   ┊ 70┊  holders: User[];
+┊   ┊ 71┊
+┊   ┊ 72┊  ownership: boolean;
+┊   ┊ 73┊}
+┊   ┊ 74┊
+┊   ┊ 75┊export interface Recipient {
+┊   ┊ 76┊  user: User;
+┊   ┊ 77┊
+┊   ┊ 78┊  message: Message;
+┊   ┊ 79┊
+┊   ┊ 80┊  chat: Chat;
+┊   ┊ 81┊
+┊   ┊ 82┊  receivedAt?: Maybe<string>;
+┊   ┊ 83┊
+┊   ┊ 84┊  readAt?: Maybe<string>;
+┊   ┊ 85┊}
+┊   ┊ 86┊
+┊   ┊ 87┊// ====================================================
+┊   ┊ 88┊// Arguments
+┊   ┊ 89┊// ====================================================
+┊   ┊ 90┊
+┊   ┊ 91┊export interface ChatQueryArgs {
+┊   ┊ 92┊  chatId: string;
+┊   ┊ 93┊}
+┊   ┊ 94┊export interface MessagesChatArgs {
+┊   ┊ 95┊  amount?: Maybe<number>;
+┊   ┊ 96┊}
+┊   ┊ 97┊
+┊   ┊ 98┊import { GraphQLResolveInfo } from "graphql";
+┊   ┊ 99┊
+┊   ┊100┊export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
+┊   ┊101┊  parent: Parent,
+┊   ┊102┊  args: Args,
+┊   ┊103┊  context: Context,
+┊   ┊104┊  info: GraphQLResolveInfo
+┊   ┊105┊) => Promise<Result> | Result;
+┊   ┊106┊
+┊   ┊107┊export interface ISubscriptionResolverObject<Result, Parent, Context, Args> {
+┊   ┊108┊  subscribe<R = Result, P = Parent>(
+┊   ┊109┊    parent: P,
+┊   ┊110┊    args: Args,
+┊   ┊111┊    context: Context,
+┊   ┊112┊    info: GraphQLResolveInfo
+┊   ┊113┊  ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>;
+┊   ┊114┊  resolve?<R = Result, P = Parent>(
+┊   ┊115┊    parent: P,
+┊   ┊116┊    args: Args,
+┊   ┊117┊    context: Context,
+┊   ┊118┊    info: GraphQLResolveInfo
+┊   ┊119┊  ): R | Result | Promise<R | Result>;
+┊   ┊120┊}
+┊   ┊121┊
+┊   ┊122┊export type SubscriptionResolver<
+┊   ┊123┊  Result,
+┊   ┊124┊  Parent = {},
+┊   ┊125┊  Context = {},
+┊   ┊126┊  Args = {}
+┊   ┊127┊> =
+┊   ┊128┊  | ((
+┊   ┊129┊      ...args: any[]
+┊   ┊130┊    ) => ISubscriptionResolverObject<Result, Parent, Context, Args>)
+┊   ┊131┊  | ISubscriptionResolverObject<Result, Parent, Context, Args>;
+┊   ┊132┊
+┊   ┊133┊export type TypeResolveFn<Types, Parent = {}, Context = {}> = (
+┊   ┊134┊  parent: Parent,
+┊   ┊135┊  context: Context,
+┊   ┊136┊  info: GraphQLResolveInfo
+┊   ┊137┊) => Maybe<Types>;
+┊   ┊138┊
+┊   ┊139┊export type NextResolverFn<T> = () => Promise<T>;
+┊   ┊140┊
+┊   ┊141┊export type DirectiveResolverFn<TResult, TArgs = {}, TContext = {}> = (
+┊   ┊142┊  next: NextResolverFn<TResult>,
+┊   ┊143┊  source: any,
+┊   ┊144┊  args: TArgs,
+┊   ┊145┊  context: TContext,
+┊   ┊146┊  info: GraphQLResolveInfo
+┊   ┊147┊) => TResult | Promise<TResult>;
+┊   ┊148┊
+┊   ┊149┊export namespace QueryResolvers {
+┊   ┊150┊  export interface Resolvers<Context = {}, TypeParent = {}> {
+┊   ┊151┊    users?: UsersResolver<Maybe<User[]>, TypeParent, Context>;
+┊   ┊152┊
+┊   ┊153┊    chats?: ChatsResolver<Maybe<Chat[]>, TypeParent, Context>;
+┊   ┊154┊
+┊   ┊155┊    chat?: ChatResolver<Maybe<Chat>, TypeParent, Context>;
+┊   ┊156┊  }
+┊   ┊157┊
+┊   ┊158┊  export type UsersResolver<
+┊   ┊159┊    R = Maybe<User[]>,
+┊   ┊160┊    Parent = {},
+┊   ┊161┊    Context = {}
+┊   ┊162┊  > = Resolver<R, Parent, Context>;
+┊   ┊163┊  export type ChatsResolver<
+┊   ┊164┊    R = Maybe<Chat[]>,
+┊   ┊165┊    Parent = {},
+┊   ┊166┊    Context = {}
+┊   ┊167┊  > = Resolver<R, Parent, Context>;
+┊   ┊168┊  export type ChatResolver<
+┊   ┊169┊    R = Maybe<Chat>,
+┊   ┊170┊    Parent = {},
+┊   ┊171┊    Context = {}
+┊   ┊172┊  > = Resolver<R, Parent, Context, ChatArgs>;
+┊   ┊173┊  export interface ChatArgs {
+┊   ┊174┊    chatId: string;
+┊   ┊175┊  }
+┊   ┊176┊}
+┊   ┊177┊
+┊   ┊178┊export namespace UserResolvers {
+┊   ┊179┊  export interface Resolvers<Context = {}, TypeParent = User> {
+┊   ┊180┊    id?: IdResolver<string, TypeParent, Context>;
+┊   ┊181┊
+┊   ┊182┊    name?: NameResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊183┊
+┊   ┊184┊    picture?: PictureResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊185┊
+┊   ┊186┊    phone?: PhoneResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊187┊  }
+┊   ┊188┊
+┊   ┊189┊  export type IdResolver<R = string, Parent = User, Context = {}> = Resolver<
+┊   ┊190┊    R,
+┊   ┊191┊    Parent,
+┊   ┊192┊    Context
+┊   ┊193┊  >;
+┊   ┊194┊  export type NameResolver<
+┊   ┊195┊    R = Maybe<string>,
+┊   ┊196┊    Parent = User,
+┊   ┊197┊    Context = {}
+┊   ┊198┊  > = Resolver<R, Parent, Context>;
+┊   ┊199┊  export type PictureResolver<
+┊   ┊200┊    R = Maybe<string>,
+┊   ┊201┊    Parent = User,
+┊   ┊202┊    Context = {}
+┊   ┊203┊  > = Resolver<R, Parent, Context>;
+┊   ┊204┊  export type PhoneResolver<
+┊   ┊205┊    R = Maybe<string>,
+┊   ┊206┊    Parent = User,
+┊   ┊207┊    Context = {}
+┊   ┊208┊  > = Resolver<R, Parent, Context>;
+┊   ┊209┊}
+┊   ┊210┊
+┊   ┊211┊export namespace ChatResolvers {
+┊   ┊212┊  export interface Resolvers<Context = {}, TypeParent = Chat> {
+┊   ┊213┊    id?: IdResolver<string, TypeParent, Context>;
+┊   ┊214┊
+┊   ┊215┊    name?: NameResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊216┊
+┊   ┊217┊    picture?: PictureResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊218┊
+┊   ┊219┊    allTimeMembers?: AllTimeMembersResolver<User[], TypeParent, Context>;
+┊   ┊220┊
+┊   ┊221┊    listingMembers?: ListingMembersResolver<User[], TypeParent, Context>;
+┊   ┊222┊
+┊   ┊223┊    actualGroupMembers?: ActualGroupMembersResolver<
+┊   ┊224┊      User[],
+┊   ┊225┊      TypeParent,
+┊   ┊226┊      Context
+┊   ┊227┊    >;
+┊   ┊228┊
+┊   ┊229┊    admins?: AdminsResolver<Maybe<User[]>, TypeParent, Context>;
+┊   ┊230┊
+┊   ┊231┊    owner?: OwnerResolver<Maybe<User>, TypeParent, Context>;
+┊   ┊232┊
+┊   ┊233┊    messages?: MessagesResolver<(Maybe<Message>)[], TypeParent, Context>;
+┊   ┊234┊
+┊   ┊235┊    unreadMessages?: UnreadMessagesResolver<number, TypeParent, Context>;
+┊   ┊236┊
+┊   ┊237┊    isGroup?: IsGroupResolver<boolean, TypeParent, Context>;
+┊   ┊238┊  }
+┊   ┊239┊
+┊   ┊240┊  export type IdResolver<R = string, Parent = Chat, Context = {}> = Resolver<
+┊   ┊241┊    R,
+┊   ┊242┊    Parent,
+┊   ┊243┊    Context
+┊   ┊244┊  >;
+┊   ┊245┊  export type NameResolver<
+┊   ┊246┊    R = Maybe<string>,
+┊   ┊247┊    Parent = Chat,
+┊   ┊248┊    Context = {}
+┊   ┊249┊  > = Resolver<R, Parent, Context>;
+┊   ┊250┊  export type PictureResolver<
+┊   ┊251┊    R = Maybe<string>,
+┊   ┊252┊    Parent = Chat,
+┊   ┊253┊    Context = {}
+┊   ┊254┊  > = Resolver<R, Parent, Context>;
+┊   ┊255┊  export type AllTimeMembersResolver<
+┊   ┊256┊    R = User[],
+┊   ┊257┊    Parent = Chat,
+┊   ┊258┊    Context = {}
+┊   ┊259┊  > = Resolver<R, Parent, Context>;
+┊   ┊260┊  export type ListingMembersResolver<
+┊   ┊261┊    R = User[],
+┊   ┊262┊    Parent = Chat,
+┊   ┊263┊    Context = {}
+┊   ┊264┊  > = Resolver<R, Parent, Context>;
+┊   ┊265┊  export type ActualGroupMembersResolver<
+┊   ┊266┊    R = User[],
+┊   ┊267┊    Parent = Chat,
+┊   ┊268┊    Context = {}
+┊   ┊269┊  > = Resolver<R, Parent, Context>;
+┊   ┊270┊  export type AdminsResolver<
+┊   ┊271┊    R = Maybe<User[]>,
+┊   ┊272┊    Parent = Chat,
+┊   ┊273┊    Context = {}
+┊   ┊274┊  > = Resolver<R, Parent, Context>;
+┊   ┊275┊  export type OwnerResolver<
+┊   ┊276┊    R = Maybe<User>,
+┊   ┊277┊    Parent = Chat,
+┊   ┊278┊    Context = {}
+┊   ┊279┊  > = Resolver<R, Parent, Context>;
+┊   ┊280┊  export type MessagesResolver<
+┊   ┊281┊    R = (Maybe<Message>)[],
+┊   ┊282┊    Parent = Chat,
+┊   ┊283┊    Context = {}
+┊   ┊284┊  > = Resolver<R, Parent, Context, MessagesArgs>;
+┊   ┊285┊  export interface MessagesArgs {
+┊   ┊286┊    amount?: Maybe<number>;
+┊   ┊287┊  }
+┊   ┊288┊
+┊   ┊289┊  export type UnreadMessagesResolver<
+┊   ┊290┊    R = number,
+┊   ┊291┊    Parent = Chat,
+┊   ┊292┊    Context = {}
+┊   ┊293┊  > = Resolver<R, Parent, Context>;
+┊   ┊294┊  export type IsGroupResolver<
+┊   ┊295┊    R = boolean,
+┊   ┊296┊    Parent = Chat,
+┊   ┊297┊    Context = {}
+┊   ┊298┊  > = Resolver<R, Parent, Context>;
+┊   ┊299┊}
+┊   ┊300┊
+┊   ┊301┊export namespace MessageResolvers {
+┊   ┊302┊  export interface Resolvers<Context = {}, TypeParent = Message> {
+┊   ┊303┊    id?: IdResolver<string, TypeParent, Context>;
+┊   ┊304┊
+┊   ┊305┊    sender?: SenderResolver<User, TypeParent, Context>;
+┊   ┊306┊
+┊   ┊307┊    chat?: ChatResolver<Chat, TypeParent, Context>;
+┊   ┊308┊
+┊   ┊309┊    content?: ContentResolver<string, TypeParent, Context>;
+┊   ┊310┊
+┊   ┊311┊    createdAt?: CreatedAtResolver<string, TypeParent, Context>;
+┊   ┊312┊
+┊   ┊313┊    type?: TypeResolver<number, TypeParent, Context>;
+┊   ┊314┊
+┊   ┊315┊    recipients?: RecipientsResolver<Recipient[], TypeParent, Context>;
+┊   ┊316┊
+┊   ┊317┊    holders?: HoldersResolver<User[], TypeParent, Context>;
+┊   ┊318┊
+┊   ┊319┊    ownership?: OwnershipResolver<boolean, TypeParent, Context>;
+┊   ┊320┊  }
+┊   ┊321┊
+┊   ┊322┊  export type IdResolver<R = string, Parent = Message, Context = {}> = Resolver<
+┊   ┊323┊    R,
+┊   ┊324┊    Parent,
+┊   ┊325┊    Context
+┊   ┊326┊  >;
+┊   ┊327┊  export type SenderResolver<
+┊   ┊328┊    R = User,
+┊   ┊329┊    Parent = Message,
+┊   ┊330┊    Context = {}
+┊   ┊331┊  > = Resolver<R, Parent, Context>;
+┊   ┊332┊  export type ChatResolver<R = Chat, Parent = Message, Context = {}> = Resolver<
+┊   ┊333┊    R,
+┊   ┊334┊    Parent,
+┊   ┊335┊    Context
+┊   ┊336┊  >;
+┊   ┊337┊  export type ContentResolver<
+┊   ┊338┊    R = string,
+┊   ┊339┊    Parent = Message,
+┊   ┊340┊    Context = {}
+┊   ┊341┊  > = Resolver<R, Parent, Context>;
+┊   ┊342┊  export type CreatedAtResolver<
+┊   ┊343┊    R = string,
+┊   ┊344┊    Parent = Message,
+┊   ┊345┊    Context = {}
+┊   ┊346┊  > = Resolver<R, Parent, Context>;
+┊   ┊347┊  export type TypeResolver<
+┊   ┊348┊    R = number,
+┊   ┊349┊    Parent = Message,
+┊   ┊350┊    Context = {}
+┊   ┊351┊  > = Resolver<R, Parent, Context>;
+┊   ┊352┊  export type RecipientsResolver<
+┊   ┊353┊    R = Recipient[],
+┊   ┊354┊    Parent = Message,
+┊   ┊355┊    Context = {}
+┊   ┊356┊  > = Resolver<R, Parent, Context>;
+┊   ┊357┊  export type HoldersResolver<
+┊   ┊358┊    R = User[],
+┊   ┊359┊    Parent = Message,
+┊   ┊360┊    Context = {}
+┊   ┊361┊  > = Resolver<R, Parent, Context>;
+┊   ┊362┊  export type OwnershipResolver<
+┊   ┊363┊    R = boolean,
+┊   ┊364┊    Parent = Message,
+┊   ┊365┊    Context = {}
+┊   ┊366┊  > = Resolver<R, Parent, Context>;
+┊   ┊367┊}
+┊   ┊368┊
+┊   ┊369┊export namespace RecipientResolvers {
+┊   ┊370┊  export interface Resolvers<Context = {}, TypeParent = Recipient> {
+┊   ┊371┊    user?: UserResolver<User, TypeParent, Context>;
+┊   ┊372┊
+┊   ┊373┊    message?: MessageResolver<Message, TypeParent, Context>;
+┊   ┊374┊
+┊   ┊375┊    chat?: ChatResolver<Chat, TypeParent, Context>;
+┊   ┊376┊
+┊   ┊377┊    receivedAt?: ReceivedAtResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊378┊
+┊   ┊379┊    readAt?: ReadAtResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊380┊  }
+┊   ┊381┊
+┊   ┊382┊  export type UserResolver<
+┊   ┊383┊    R = User,
+┊   ┊384┊    Parent = Recipient,
+┊   ┊385┊    Context = {}
+┊   ┊386┊  > = Resolver<R, Parent, Context>;
+┊   ┊387┊  export type MessageResolver<
+┊   ┊388┊    R = Message,
+┊   ┊389┊    Parent = Recipient,
+┊   ┊390┊    Context = {}
+┊   ┊391┊  > = Resolver<R, Parent, Context>;
+┊   ┊392┊  export type ChatResolver<
+┊   ┊393┊    R = Chat,
+┊   ┊394┊    Parent = Recipient,
+┊   ┊395┊    Context = {}
+┊   ┊396┊  > = Resolver<R, Parent, Context>;
+┊   ┊397┊  export type ReceivedAtResolver<
+┊   ┊398┊    R = Maybe<string>,
+┊   ┊399┊    Parent = Recipient,
+┊   ┊400┊    Context = {}
+┊   ┊401┊  > = Resolver<R, Parent, Context>;
+┊   ┊402┊  export type ReadAtResolver<
+┊   ┊403┊    R = Maybe<string>,
+┊   ┊404┊    Parent = Recipient,
+┊   ┊405┊    Context = {}
+┊   ┊406┊  > = Resolver<R, Parent, Context>;
+┊   ┊407┊}
+┊   ┊408┊
+┊   ┊409┊/** Directs the executor to skip this field or fragment when the `if` argument is true. */
+┊   ┊410┊export type SkipDirectiveResolver<Result> = DirectiveResolverFn<
+┊   ┊411┊  Result,
+┊   ┊412┊  SkipDirectiveArgs,
+┊   ┊413┊  {}
+┊   ┊414┊>;
+┊   ┊415┊export interface SkipDirectiveArgs {
+┊   ┊416┊  /** Skipped when true. */
+┊   ┊417┊  if: boolean;
+┊   ┊418┊}
+┊   ┊419┊
+┊   ┊420┊/** Directs the executor to include this field or fragment only when the `if` argument is true. */
+┊   ┊421┊export type IncludeDirectiveResolver<Result> = DirectiveResolverFn<
+┊   ┊422┊  Result,
+┊   ┊423┊  IncludeDirectiveArgs,
+┊   ┊424┊  {}
+┊   ┊425┊>;
+┊   ┊426┊export interface IncludeDirectiveArgs {
+┊   ┊427┊  /** Included when true. */
+┊   ┊428┊  if: boolean;
+┊   ┊429┊}
+┊   ┊430┊
+┊   ┊431┊/** Marks an element of a GraphQL schema as no longer supported. */
+┊   ┊432┊export type DeprecatedDirectiveResolver<Result> = DirectiveResolverFn<
+┊   ┊433┊  Result,
+┊   ┊434┊  DeprecatedDirectiveArgs,
+┊   ┊435┊  {}
+┊   ┊436┊>;
+┊   ┊437┊export interface DeprecatedDirectiveArgs {
+┊   ┊438┊  /** Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax (as specified by [CommonMark](https://commonmark.org/). */
+┊   ┊439┊  reason?: string;
+┊   ┊440┊}
+┊   ┊441┊
+┊   ┊442┊export interface IResolvers {
+┊   ┊443┊  Query?: QueryResolvers.Resolvers;
+┊   ┊444┊  User?: UserResolvers.Resolvers;
+┊   ┊445┊  Chat?: ChatResolvers.Resolvers;
+┊   ┊446┊  Message?: MessageResolvers.Resolvers;
+┊   ┊447┊  Recipient?: RecipientResolvers.Resolvers;
+┊   ┊448┊}
+┊   ┊449┊
+┊   ┊450┊export interface IDirectiveResolvers<Result> {
+┊   ┊451┊  skip?: SkipDirectiveResolver<Result>;
+┊   ┊452┊  include?: IncludeDirectiveResolver<Result>;
+┊   ┊453┊  deprecated?: DeprecatedDirectiveResolver<Result>;
+┊   ┊454┊}
```

[}]: #

Now let's use them:

[{]: <helper> (diffStep "2.3")

#### Step 2.3: Use our types

##### Changed codegen.yml
```diff
@@ -5,6 +5,14 @@
 ┊ 5┊ 5┊  - ts-node/register
 ┊ 6┊ 6┊generates:
 ┊ 7┊ 7┊  ./types.d.ts:
+┊  ┊ 8┊    config:
+┊  ┊ 9┊      optionalType: undefined | null
+┊  ┊10┊      scalars:
+┊  ┊11┊        ID: number
+┊  ┊12┊      mappers:
+┊  ┊13┊        Chat: ./db#Chat
+┊  ┊14┊        Message: ./db#Message
+┊  ┊15┊        Recipient: ./db#Recipient
 ┊ 8┊16┊    plugins:
 ┊ 9┊17┊      - 'typescript-common'
 ┊10┊18┊      - 'typescript-server'
```

##### Changed schema&#x2F;index.ts
```diff
@@ -4,5 +4,5 @@
 ┊4┊4┊
 ┊5┊5┊export const schema = makeExecutableSchema({
 ┊6┊6┊  typeDefs,
-┊7┊ ┊  resolvers,
+┊ ┊7┊  resolvers: resolvers as any,
 ┊8┊8┊});
```

##### Changed schema&#x2F;resolvers.ts
```diff
@@ -1,5 +1,5 @@
-┊1┊ ┊import { IResolvers } from 'apollo-server-express';
-┊2┊ ┊import { Chat, db, Message, Recipient, User } from "../db";
+┊ ┊1┊import { db, Message } from "../db";
+┊ ┊2┊import { IResolvers } from '../types';
 ┊3┊3┊
 ┊4┊4┊let users = db.users;
 ┊5┊5┊let chats = db.chats;
```
```diff
@@ -8,44 +8,44 @@
 ┊ 8┊ 8┊export const resolvers: IResolvers = {
 ┊ 9┊ 9┊  Query: {
 ┊10┊10┊    // Show all users for the moment.
-┊11┊  ┊    users: (): User[] => users.filter(user => user.id !== currentUser),
-┊12┊  ┊    chats: (): Chat[] => chats.filter(chat => chat.listingMemberIds.includes(currentUser)),
-┊13┊  ┊    chat: (obj: any, {chatId}): Chat | null => chats.find(chat => chat.id === chatId) || null,
+┊  ┊11┊    users: () => users.filter(user => user.id !== currentUser),
+┊  ┊12┊    chats: () => chats.filter(chat => chat.listingMemberIds.includes(currentUser)),
+┊  ┊13┊    chat: (obj, {chatId}) => chats.find(chat => chat.id === Number(chatId)),
 ┊14┊14┊  },
 ┊15┊15┊  Chat: {
-┊16┊  ┊    name: (chat: Chat): string => chat.name ? chat.name : users
+┊  ┊16┊    name: (chat): string => chat.name ? chat.name : users
 ┊17┊17┊      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.name,
-┊18┊  ┊    picture: (chat: Chat) => chat.name ? chat.picture : users
+┊  ┊18┊    picture: (chat) => chat.name ? chat.picture : users
 ┊19┊19┊      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.picture,
-┊20┊  ┊    allTimeMembers: (chat: Chat): User[] => users.filter(user => chat.allTimeMemberIds.includes(user.id)),
-┊21┊  ┊    listingMembers: (chat: Chat): User[] => users.filter(user => chat.listingMemberIds.includes(user.id)),
-┊22┊  ┊    actualGroupMembers: (chat: Chat): User[] => users.filter(user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)),
-┊23┊  ┊    admins: (chat: Chat): User[] => users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
-┊24┊  ┊    owner: (chat: Chat): User | null => users.find(user => chat.ownerId === user.id) || null,
-┊25┊  ┊    messages: (chat: Chat, {amount = 0}: {amount: number}): Message[] => {
+┊  ┊20┊    allTimeMembers: (chat) => users.filter(user => chat.allTimeMemberIds.includes(user.id)),
+┊  ┊21┊    listingMembers: (chat) => users.filter(user => chat.listingMemberIds.includes(user.id)),
+┊  ┊22┊    actualGroupMembers: (chat) => users.filter(user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)),
+┊  ┊23┊    admins: (chat) => users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
+┊  ┊24┊    owner: (chat) => users.find(user => chat.ownerId === user.id) || null,
+┊  ┊25┊    messages: (chat, {amount = 0}) => {
 ┊26┊26┊      const messages = chat.messages
 ┊27┊27┊      .filter(message => message.holderIds.includes(currentUser))
 ┊28┊28┊      .sort((a, b) => b.createdAt - a.createdAt) || <Message[]>[];
 ┊29┊29┊      return (amount ? messages.slice(0, amount) : messages).reverse();
 ┊30┊30┊    },
-┊31┊  ┊    unreadMessages: (chat: Chat): number => chat.messages
+┊  ┊31┊    unreadMessages: (chat) => chat.messages
 ┊32┊32┊      .filter(message => message.holderIds.includes(currentUser) &&
 ┊33┊33┊        message.recipients.find(recipient => recipient.userId === currentUser && !recipient.readAt))
 ┊34┊34┊      .length,
-┊35┊  ┊    isGroup: (chat: Chat): boolean => !!chat.name,
+┊  ┊35┊    isGroup: (chat) => !!chat.name,
 ┊36┊36┊  },
 ┊37┊37┊  Message: {
-┊38┊  ┊    chat: (message: Message): Chat | null => chats.find(chat => message.chatId === chat.id) || null,
-┊39┊  ┊    sender: (message: Message): User | null => users.find(user => user.id === message.senderId) || null,
-┊40┊  ┊    holders: (message: Message): User[] => users.filter(user => message.holderIds.includes(user.id)),
-┊41┊  ┊    ownership: (message: Message): boolean => message.senderId === currentUser,
+┊  ┊38┊    chat: (message) => chats.find(chat => message.chatId === chat.id)!,
+┊  ┊39┊    sender: (message) => users.find(user => user.id === message.senderId)!,
+┊  ┊40┊    holders: (message) => users.filter(user => message.holderIds.includes(user.id)),
+┊  ┊41┊    ownership: (message) => message.senderId === currentUser,
 ┊42┊42┊  },
 ┊43┊43┊  Recipient: {
-┊44┊  ┊    user: (recipient: Recipient): User | null => users.find(user => recipient.userId === user.id) || null,
-┊45┊  ┊    message: (recipient: Recipient): Message | null => {
-┊46┊  ┊      const chat = chats.find(chat => recipient.chatId === chat.id);
-┊47┊  ┊      return chat ? chat.messages.find(message => recipient.messageId === message.id) || null : null;
+┊  ┊44┊    user: (recipient) => users.find(user => recipient.userId === user.id)!,
+┊  ┊45┊    message: (recipient) => {
+┊  ┊46┊      const chat = chats.find(chat => recipient.chatId === chat.id)!;
+┊  ┊47┊      return chat.messages.find(message => recipient.messageId === message.id)!;
 ┊48┊48┊    },
-┊49┊  ┊    chat: (recipient: Recipient): Chat | null => chats.find(chat => recipient.chatId === chat.id) || null,
+┊  ┊49┊    chat: (recipient) => chats.find(chat => recipient.chatId === chat.id)!,
 ┊50┊50┊  },
 ┊51┊51┊};
```

##### Changed types.d.ts
```diff
@@ -1,4 +1,4 @@
-┊1┊ ┊export type Maybe<T> = T | null;
+┊ ┊1┊export type Maybe<T> = T | undefined | null;
 ┊2┊2┊
 ┊3┊3┊export enum MessageType {
 ┊4┊4┊  Location = "LOCATION",
```
```diff
@@ -19,7 +19,7 @@
 ┊19┊19┊}
 ┊20┊20┊
 ┊21┊21┊export interface User {
-┊22┊  ┊  id: string;
+┊  ┊22┊  id: number;
 ┊23┊23┊
 ┊24┊24┊  name?: Maybe<string>;
 ┊25┊25┊
```
```diff
@@ -29,7 +29,7 @@
 ┊29┊29┊}
 ┊30┊30┊
 ┊31┊31┊export interface Chat {
-┊32┊  ┊  id: string;
+┊  ┊32┊  id: number;
 ┊33┊33┊
 ┊34┊34┊  name?: Maybe<string>;
 ┊35┊35┊
```
```diff
@@ -53,7 +53,7 @@
 ┊53┊53┊}
 ┊54┊54┊
 ┊55┊55┊export interface Message {
-┊56┊  ┊  id: string;
+┊  ┊56┊  id: number;
 ┊57┊57┊
 ┊58┊58┊  sender: User;
 ┊59┊59┊
```
```diff
@@ -89,7 +89,7 @@
 ┊89┊89┊// ====================================================
 ┊90┊90┊
 ┊91┊91┊export interface ChatQueryArgs {
-┊92┊  ┊  chatId: string;
+┊  ┊92┊  chatId: number;
 ┊93┊93┊}
 ┊94┊94┊export interface MessagesChatArgs {
 ┊95┊95┊  amount?: Maybe<number>;
```
```diff
@@ -97,6 +97,8 @@
 ┊ 97┊ 97┊
 ┊ 98┊ 98┊import { GraphQLResolveInfo } from "graphql";
 ┊ 99┊ 99┊
+┊   ┊100┊import { Chat, Message, Recipient } from "./db";
+┊   ┊101┊
 ┊100┊102┊export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
 ┊101┊103┊  parent: Parent,
 ┊102┊104┊  args: Args,
```
```diff
@@ -171,13 +173,13 @@
 ┊171┊173┊    Context = {}
 ┊172┊174┊  > = Resolver<R, Parent, Context, ChatArgs>;
 ┊173┊175┊  export interface ChatArgs {
-┊174┊   ┊    chatId: string;
+┊   ┊176┊    chatId: number;
 ┊175┊177┊  }
 ┊176┊178┊}
 ┊177┊179┊
 ┊178┊180┊export namespace UserResolvers {
 ┊179┊181┊  export interface Resolvers<Context = {}, TypeParent = User> {
-┊180┊   ┊    id?: IdResolver<string, TypeParent, Context>;
+┊   ┊182┊    id?: IdResolver<number, TypeParent, Context>;
 ┊181┊183┊
 ┊182┊184┊    name?: NameResolver<Maybe<string>, TypeParent, Context>;
 ┊183┊185┊
```
```diff
@@ -186,7 +188,7 @@
 ┊186┊188┊    phone?: PhoneResolver<Maybe<string>, TypeParent, Context>;
 ┊187┊189┊  }
 ┊188┊190┊
-┊189┊   ┊  export type IdResolver<R = string, Parent = User, Context = {}> = Resolver<
+┊   ┊191┊  export type IdResolver<R = number, Parent = User, Context = {}> = Resolver<
 ┊190┊192┊    R,
 ┊191┊193┊    Parent,
 ┊192┊194┊    Context
```
```diff
@@ -210,7 +212,7 @@
 ┊210┊212┊
 ┊211┊213┊export namespace ChatResolvers {
 ┊212┊214┊  export interface Resolvers<Context = {}, TypeParent = Chat> {
-┊213┊   ┊    id?: IdResolver<string, TypeParent, Context>;
+┊   ┊215┊    id?: IdResolver<number, TypeParent, Context>;
 ┊214┊216┊
 ┊215┊217┊    name?: NameResolver<Maybe<string>, TypeParent, Context>;
 ┊216┊218┊
```
```diff
@@ -237,7 +239,7 @@
 ┊237┊239┊    isGroup?: IsGroupResolver<boolean, TypeParent, Context>;
 ┊238┊240┊  }
 ┊239┊241┊
-┊240┊   ┊  export type IdResolver<R = string, Parent = Chat, Context = {}> = Resolver<
+┊   ┊242┊  export type IdResolver<R = number, Parent = Chat, Context = {}> = Resolver<
 ┊241┊243┊    R,
 ┊242┊244┊    Parent,
 ┊243┊245┊    Context
```
```diff
@@ -300,7 +302,7 @@
 ┊300┊302┊
 ┊301┊303┊export namespace MessageResolvers {
 ┊302┊304┊  export interface Resolvers<Context = {}, TypeParent = Message> {
-┊303┊   ┊    id?: IdResolver<string, TypeParent, Context>;
+┊   ┊305┊    id?: IdResolver<number, TypeParent, Context>;
 ┊304┊306┊
 ┊305┊307┊    sender?: SenderResolver<User, TypeParent, Context>;
 ┊306┊308┊
```
```diff
@@ -319,7 +321,7 @@
 ┊319┊321┊    ownership?: OwnershipResolver<boolean, TypeParent, Context>;
 ┊320┊322┊  }
 ┊321┊323┊
-┊322┊   ┊  export type IdResolver<R = string, Parent = Message, Context = {}> = Resolver<
+┊   ┊324┊  export type IdResolver<R = number, Parent = Message, Context = {}> = Resolver<
 ┊323┊325┊    R,
 ┊324┊326┊    Parent,
 ┊325┊327┊    Context
```

[}]: #

Don't worry, they will be much more useful when we will write our first mutation.

# Chapter 9

Finally we're going to create our mutations in the server:

[{]: <helper> (diffStep "3.1")

#### Step 3.1: Add mutations

##### Changed schema&#x2F;resolvers.ts
```diff
@@ -1,5 +1,6 @@
-┊1┊ ┊import { db, Message } from "../db";
-┊2┊ ┊import { IResolvers } from '../types';
+┊ ┊1┊import { Chat, db, Message, MessageType, Recipient } from "../db";
+┊ ┊2┊import { IResolvers } from "../types";
+┊ ┊3┊import * as moment from "moment";
 ┊3┊4┊
 ┊4┊5┊let users = db.users;
 ┊5┊6┊let chats = db.chats;
```
```diff
@@ -12,8 +13,278 @@
 ┊ 12┊ 13┊    chats: () => chats.filter(chat => chat.listingMemberIds.includes(currentUser)),
 ┊ 13┊ 14┊    chat: (obj, {chatId}) => chats.find(chat => chat.id === Number(chatId)),
 ┊ 14┊ 15┊  },
+┊   ┊ 16┊  Mutation: {
+┊   ┊ 17┊    addChat: (obj, {recipientId}) => {
+┊   ┊ 18┊      if (!users.find(user => user.id === recipientId)) {
+┊   ┊ 19┊        throw new Error(`Recipient ${recipientId} doesn't exist.`);
+┊   ┊ 20┊      }
+┊   ┊ 21┊
+┊   ┊ 22┊      const chat = chats.find(chat => !chat.name && chat.allTimeMemberIds.includes(currentUser) && chat.allTimeMemberIds.includes(recipientId));
+┊   ┊ 23┊      if (chat) {
+┊   ┊ 24┊        // Chat already exists. Both users are already in the allTimeMemberIds array
+┊   ┊ 25┊        const chatId = chat.id;
+┊   ┊ 26┊        if (!chat.listingMemberIds.includes(currentUser)) {
+┊   ┊ 27┊          // The chat isn't listed for the current user. Add him to the memberIds
+┊   ┊ 28┊          chat.listingMemberIds.push(currentUser);
+┊   ┊ 29┊          chats.find(chat => chat.id === chatId)!.listingMemberIds.push(currentUser);
+┊   ┊ 30┊          return chat;
+┊   ┊ 31┊        } else {
+┊   ┊ 32┊          throw new Error(`Chat already exists.`);
+┊   ┊ 33┊        }
+┊   ┊ 34┊      } else {
+┊   ┊ 35┊        // Create the chat
+┊   ┊ 36┊        const id = (chats.length && chats[chats.length - 1].id + 1) || 1;
+┊   ┊ 37┊        const chat: Chat = {
+┊   ┊ 38┊          id,
+┊   ┊ 39┊          name: null,
+┊   ┊ 40┊          picture: null,
+┊   ┊ 41┊          adminIds: null,
+┊   ┊ 42┊          ownerId: null,
+┊   ┊ 43┊          allTimeMemberIds: [currentUser, recipientId],
+┊   ┊ 44┊          // Chat will not be listed to the other user until the first message gets written
+┊   ┊ 45┊          listingMemberIds: [currentUser],
+┊   ┊ 46┊          actualGroupMemberIds: null,
+┊   ┊ 47┊          messages: [],
+┊   ┊ 48┊        };
+┊   ┊ 49┊        chats.push(chat);
+┊   ┊ 50┊        return chat;
+┊   ┊ 51┊      }
+┊   ┊ 52┊    },
+┊   ┊ 53┊    addGroup: (obj, {recipientIds, groupName}) => {
+┊   ┊ 54┊      recipientIds.forEach((recipientId: any) => {
+┊   ┊ 55┊        if (!users.find(user => user.id === recipientId)) {
+┊   ┊ 56┊          throw new Error(`Recipient ${recipientId} doesn't exist.`);
+┊   ┊ 57┊        }
+┊   ┊ 58┊      });
+┊   ┊ 59┊
+┊   ┊ 60┊      const id = (chats.length && chats[chats.length - 1].id + 1) || 1;
+┊   ┊ 61┊      const chat: Chat = {
+┊   ┊ 62┊        id,
+┊   ┊ 63┊        name: groupName,
+┊   ┊ 64┊        picture: null,
+┊   ┊ 65┊        adminIds: [currentUser],
+┊   ┊ 66┊        ownerId: currentUser,
+┊   ┊ 67┊        allTimeMemberIds: [currentUser, ...recipientIds],
+┊   ┊ 68┊        listingMemberIds: [currentUser, ...recipientIds],
+┊   ┊ 69┊        actualGroupMemberIds: [currentUser, ...recipientIds],
+┊   ┊ 70┊        messages: [],
+┊   ┊ 71┊      };
+┊   ┊ 72┊      chats.push(chat);
+┊   ┊ 73┊      return chat;
+┊   ┊ 74┊    },
+┊   ┊ 75┊    removeChat: (obj, {chatId}) => {
+┊   ┊ 76┊      const chat = chats.find(chat => chat.id === chatId);
+┊   ┊ 77┊
+┊   ┊ 78┊      if (!chat) {
+┊   ┊ 79┊        throw new Error(`The chat ${chatId} doesn't exist.`);
+┊   ┊ 80┊      }
+┊   ┊ 81┊
+┊   ┊ 82┊      if (!chat.name) {
+┊   ┊ 83┊        // Chat
+┊   ┊ 84┊        if (!chat.listingMemberIds.includes(currentUser)) {
+┊   ┊ 85┊          throw new Error(`The user is not a member of the chat ${chatId}.`);
+┊   ┊ 86┊        }
+┊   ┊ 87┊
+┊   ┊ 88┊        // Instead of chaining map and filter we can loop once using reduce
+┊   ┊ 89┊        const messages = chat.messages.reduce<Message[]>((filtered, message) => {
+┊   ┊ 90┊          // Remove the current user from the message holders
+┊   ┊ 91┊          message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser);
+┊   ┊ 92┊
+┊   ┊ 93┊          if (message.holderIds.length !== 0) {
+┊   ┊ 94┊            filtered.push(message);
+┊   ┊ 95┊          } // else discard the message
+┊   ┊ 96┊
+┊   ┊ 97┊          return filtered;
+┊   ┊ 98┊        }, []);
+┊   ┊ 99┊
+┊   ┊100┊        // Remove the current user from who gets the chat listed. The chat will no longer appear in his list
+┊   ┊101┊        const listingMemberIds = chat.listingMemberIds.filter(listingId => listingId !== currentUser);
+┊   ┊102┊
+┊   ┊103┊        // Check how many members are left
+┊   ┊104┊        if (listingMemberIds.length === 0) {
+┊   ┊105┊          // Delete the chat
+┊   ┊106┊          chats = chats.filter(chat => chat.id !== chatId);
+┊   ┊107┊        } else {
+┊   ┊108┊          // Update the chat
+┊   ┊109┊          chats = chats.map(chat => {
+┊   ┊110┊            if (chat.id === chatId) {
+┊   ┊111┊              chat = {...chat, listingMemberIds, messages};
+┊   ┊112┊            }
+┊   ┊113┊            return chat;
+┊   ┊114┊          });
+┊   ┊115┊        }
+┊   ┊116┊        return chatId;
+┊   ┊117┊      } else {
+┊   ┊118┊        // Group
+┊   ┊119┊        if (chat.ownerId !== currentUser) {
+┊   ┊120┊          throw new Error(`Group ${chatId} is not owned by the user.`);
+┊   ┊121┊        }
+┊   ┊122┊
+┊   ┊123┊        // Instead of chaining map and filter we can loop once using reduce
+┊   ┊124┊        const messages = chat.messages.reduce<Message[]>((filtered, message) => {
+┊   ┊125┊          // Remove the current user from the message holders
+┊   ┊126┊          message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser);
+┊   ┊127┊
+┊   ┊128┊          if (message.holderIds.length !== 0) {
+┊   ┊129┊            filtered.push(message);
+┊   ┊130┊          } // else discard the message
+┊   ┊131┊
+┊   ┊132┊          return filtered;
+┊   ┊133┊        }, []);
+┊   ┊134┊
+┊   ┊135┊        // Remove the current user from who gets the group listed. The group will no longer appear in his list
+┊   ┊136┊        const listingMemberIds = chat.listingMemberIds.filter(listingId => listingId !== currentUser);
+┊   ┊137┊
+┊   ┊138┊        // Check how many members (including previous ones who can still access old messages) are left
+┊   ┊139┊        if (listingMemberIds.length === 0) {
+┊   ┊140┊          // Remove the group
+┊   ┊141┊          chats = chats.filter(chat => chat.id !== chatId);
+┊   ┊142┊        } else {
+┊   ┊143┊          // Update the group
+┊   ┊144┊
+┊   ┊145┊          // Remove the current user from the chat members. He is no longer a member of the group
+┊   ┊146┊          const actualGroupMemberIds = chat.actualGroupMemberIds!.filter(memberId => memberId !== currentUser);
+┊   ┊147┊          // Remove the current user from the chat admins
+┊   ┊148┊          const adminIds = chat.adminIds!.filter(memberId => memberId !== currentUser);
+┊   ┊149┊          // Set the owner id to be null. A null owner means the group is read-only
+┊   ┊150┊          let ownerId: number | null = null;
+┊   ┊151┊
+┊   ┊152┊          // Check if there is any admin left
+┊   ┊153┊          if (adminIds!.length) {
+┊   ┊154┊            // Pick an admin as the new owner. The group is no longer read-only
+┊   ┊155┊            ownerId = chat.adminIds![0];
+┊   ┊156┊          }
+┊   ┊157┊
+┊   ┊158┊          chats = chats.map(chat => {
+┊   ┊159┊            if (chat.id === chatId) {
+┊   ┊160┊              chat = {...chat, messages, listingMemberIds, actualGroupMemberIds, adminIds, ownerId};
+┊   ┊161┊            }
+┊   ┊162┊            return chat;
+┊   ┊163┊          });
+┊   ┊164┊        }
+┊   ┊165┊        return chatId;
+┊   ┊166┊      }
+┊   ┊167┊    },
+┊   ┊168┊    addMessage: (obj, {chatId, content}) => {
+┊   ┊169┊      if (content === null || content === '') {
+┊   ┊170┊        throw new Error(`Cannot add empty or null messages.`);
+┊   ┊171┊      }
+┊   ┊172┊
+┊   ┊173┊      let chat = chats.find(chat => chat.id === chatId);
+┊   ┊174┊
+┊   ┊175┊      if (!chat) {
+┊   ┊176┊        throw new Error(`Cannot find chat ${chatId}.`);
+┊   ┊177┊      }
+┊   ┊178┊
+┊   ┊179┊      let holderIds = chat.listingMemberIds;
+┊   ┊180┊
+┊   ┊181┊      if (!chat.name) {
+┊   ┊182┊        // Chat
+┊   ┊183┊        if (!chat.listingMemberIds.find(listingId => listingId === currentUser)) {
+┊   ┊184┊          throw new Error(`The chat ${chatId} must be listed for the current user before adding a message.`);
+┊   ┊185┊        }
+┊   ┊186┊
+┊   ┊187┊        const recipientId = chat.allTimeMemberIds.filter(userId => userId !== currentUser)[0];
+┊   ┊188┊
+┊   ┊189┊        if (!chat.listingMemberIds.find(listingId => listingId === recipientId)) {
+┊   ┊190┊          // Chat is not listed for the recipient. Add him to the listingMemberIds
+┊   ┊191┊          const listingMemberIds = chat.listingMemberIds.concat(recipientId);
+┊   ┊192┊
+┊   ┊193┊          chats = chats.map(chat => {
+┊   ┊194┊            if (chat.id === chatId) {
+┊   ┊195┊              chat = {...chat, listingMemberIds};
+┊   ┊196┊            }
+┊   ┊197┊            return chat;
+┊   ┊198┊          });
+┊   ┊199┊
+┊   ┊200┊          holderIds = listingMemberIds;
+┊   ┊201┊        }
+┊   ┊202┊      } else {
+┊   ┊203┊        // Group
+┊   ┊204┊        if (!chat.actualGroupMemberIds!.find(memberId => memberId === currentUser)) {
+┊   ┊205┊          throw new Error(`The user is not a member of the group ${chatId}. Cannot add message.`);
+┊   ┊206┊        }
+┊   ┊207┊
+┊   ┊208┊        holderIds = chat.actualGroupMemberIds!;
+┊   ┊209┊      }
+┊   ┊210┊
+┊   ┊211┊      const id = (chat.messages.length && chat.messages[chat.messages.length - 1].id + 1) || 1;
+┊   ┊212┊
+┊   ┊213┊      let recipients: Recipient[] = [];
+┊   ┊214┊
+┊   ┊215┊      holderIds.forEach(holderId => {
+┊   ┊216┊        if (holderId !== currentUser) {
+┊   ┊217┊          recipients.push({
+┊   ┊218┊            userId: holderId,
+┊   ┊219┊            messageId: id,
+┊   ┊220┊            chatId: chatId,
+┊   ┊221┊            receivedAt: null,
+┊   ┊222┊            readAt: null,
+┊   ┊223┊          });
+┊   ┊224┊        }
+┊   ┊225┊      });
+┊   ┊226┊
+┊   ┊227┊      const message: Message = {
+┊   ┊228┊        id,
+┊   ┊229┊        chatId,
+┊   ┊230┊        senderId: currentUser,
+┊   ┊231┊        content,
+┊   ┊232┊        createdAt: moment().unix(),
+┊   ┊233┊        type: MessageType.TEXT,
+┊   ┊234┊        recipients,
+┊   ┊235┊        holderIds,
+┊   ┊236┊      };
+┊   ┊237┊
+┊   ┊238┊      chats = chats.map(chat => {
+┊   ┊239┊        if (chat.id === chatId) {
+┊   ┊240┊          chat = {...chat, messages: chat.messages.concat(message)}
+┊   ┊241┊        }
+┊   ┊242┊        return chat;
+┊   ┊243┊      });
+┊   ┊244┊
+┊   ┊245┊      return message;
+┊   ┊246┊    },
+┊   ┊247┊    removeMessages: (obj, {chatId, messageIds, all}) => {
+┊   ┊248┊      const chat = chats.find(chat => chat.id === chatId);
+┊   ┊249┊
+┊   ┊250┊      if (!chat) {
+┊   ┊251┊        throw new Error(`Cannot find chat ${chatId}.`);
+┊   ┊252┊      }
+┊   ┊253┊
+┊   ┊254┊      if (!chat.listingMemberIds.find(listingId => listingId === currentUser)) {
+┊   ┊255┊        throw new Error(`The chat/group ${chatId} is not listed for the current user, so there is nothing to delete.`);
+┊   ┊256┊      }
+┊   ┊257┊
+┊   ┊258┊      if (all && messageIds) {
+┊   ┊259┊        throw new Error(`Cannot specify both 'all' and 'messageIds'.`);
+┊   ┊260┊      }
+┊   ┊261┊
+┊   ┊262┊      let deletedIds: number[] = [];
+┊   ┊263┊      chats = chats.map(chat => {
+┊   ┊264┊        if (chat.id === chatId) {
+┊   ┊265┊          // Instead of chaining map and filter we can loop once using reduce
+┊   ┊266┊          const messages = chat.messages.reduce<Message[]>((filtered, message) => {
+┊   ┊267┊            if (all || messageIds!.includes(message.id)) {
+┊   ┊268┊              deletedIds.push(message.id);
+┊   ┊269┊              // Remove the current user from the message holders
+┊   ┊270┊              message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser);
+┊   ┊271┊            }
+┊   ┊272┊
+┊   ┊273┊            if (message.holderIds.length !== 0) {
+┊   ┊274┊              filtered.push(message);
+┊   ┊275┊            } // else discard the message
+┊   ┊276┊
+┊   ┊277┊            return filtered;
+┊   ┊278┊          }, []);
+┊   ┊279┊          chat = {...chat, messages};
+┊   ┊280┊        }
+┊   ┊281┊        return chat;
+┊   ┊282┊      });
+┊   ┊283┊      return deletedIds;
+┊   ┊284┊    },
+┊   ┊285┊  },
 ┊ 15┊286┊  Chat: {
-┊ 16┊   ┊    name: (chat): string => chat.name ? chat.name : users
+┊   ┊287┊    name: (chat) => chat.name ? chat.name : users
 ┊ 17┊288┊      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.name,
 ┊ 18┊289┊    picture: (chat) => chat.name ? chat.picture : users
 ┊ 19┊290┊      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.picture,
```

##### Changed schema&#x2F;typeDefs.ts
```diff
@@ -65,4 +65,20 @@
 ┊65┊65┊    picture: String
 ┊66┊66┊    phone: String
 ┊67┊67┊  }
+┊  ┊68┊
+┊  ┊69┊  type Mutation {
+┊  ┊70┊    addChat(recipientId: ID!): Chat
+┊  ┊71┊    addGroup(recipientIds: [ID!]!, groupName: String!): Chat
+┊  ┊72┊    removeChat(chatId: ID!): ID
+┊  ┊73┊    addMessage(chatId: ID!, content: String!): Message
+┊  ┊74┊    removeMessages(chatId: ID!, messageIds: [ID], all: Boolean): [ID]
+┊  ┊75┊    addMembers(groupId: ID!, userIds: [ID!]!): [ID]
+┊  ┊76┊    removeMembers(groupId: ID!, userIds: [ID!]!): [ID]
+┊  ┊77┊    addAdmins(groupId: ID!, userIds: [ID!]!): [ID]
+┊  ┊78┊    removeAdmins(groupId: ID!, userIds: [ID!]!): [ID]
+┊  ┊79┊    setGroupName(groupId: ID!): String
+┊  ┊80┊    setGroupPicture(groupId: ID!): String
+┊  ┊81┊    markAsReceived(chatId: ID!): Boolean
+┊  ┊82┊    markAsRead(chatId: ID!): Boolean
+┊  ┊83┊  }
 ┊68┊84┊`;
```

##### Changed types.d.ts
```diff
@@ -84,6 +84,34 @@
 ┊ 84┊ 84┊  readAt?: Maybe<string>;
 ┊ 85┊ 85┊}
 ┊ 86┊ 86┊
+┊   ┊ 87┊export interface Mutation {
+┊   ┊ 88┊  addChat?: Maybe<Chat>;
+┊   ┊ 89┊
+┊   ┊ 90┊  addGroup?: Maybe<Chat>;
+┊   ┊ 91┊
+┊   ┊ 92┊  removeChat?: Maybe<number>;
+┊   ┊ 93┊
+┊   ┊ 94┊  addMessage?: Maybe<Message>;
+┊   ┊ 95┊
+┊   ┊ 96┊  removeMessages?: Maybe<(Maybe<number>)[]>;
+┊   ┊ 97┊
+┊   ┊ 98┊  addMembers?: Maybe<(Maybe<number>)[]>;
+┊   ┊ 99┊
+┊   ┊100┊  removeMembers?: Maybe<(Maybe<number>)[]>;
+┊   ┊101┊
+┊   ┊102┊  addAdmins?: Maybe<(Maybe<number>)[]>;
+┊   ┊103┊
+┊   ┊104┊  removeAdmins?: Maybe<(Maybe<number>)[]>;
+┊   ┊105┊
+┊   ┊106┊  setGroupName?: Maybe<string>;
+┊   ┊107┊
+┊   ┊108┊  setGroupPicture?: Maybe<string>;
+┊   ┊109┊
+┊   ┊110┊  markAsReceived?: Maybe<boolean>;
+┊   ┊111┊
+┊   ┊112┊  markAsRead?: Maybe<boolean>;
+┊   ┊113┊}
+┊   ┊114┊
 ┊ 87┊115┊// ====================================================
 ┊ 88┊116┊// Arguments
 ┊ 89┊117┊// ====================================================
```
```diff
@@ -94,6 +122,61 @@
 ┊ 94┊122┊export interface MessagesChatArgs {
 ┊ 95┊123┊  amount?: Maybe<number>;
 ┊ 96┊124┊}
+┊   ┊125┊export interface AddChatMutationArgs {
+┊   ┊126┊  recipientId: number;
+┊   ┊127┊}
+┊   ┊128┊export interface AddGroupMutationArgs {
+┊   ┊129┊  recipientIds: number[];
+┊   ┊130┊
+┊   ┊131┊  groupName: string;
+┊   ┊132┊}
+┊   ┊133┊export interface RemoveChatMutationArgs {
+┊   ┊134┊  chatId: number;
+┊   ┊135┊}
+┊   ┊136┊export interface AddMessageMutationArgs {
+┊   ┊137┊  chatId: number;
+┊   ┊138┊
+┊   ┊139┊  content: string;
+┊   ┊140┊}
+┊   ┊141┊export interface RemoveMessagesMutationArgs {
+┊   ┊142┊  chatId: number;
+┊   ┊143┊
+┊   ┊144┊  messageIds?: Maybe<(Maybe<number>)[]>;
+┊   ┊145┊
+┊   ┊146┊  all?: Maybe<boolean>;
+┊   ┊147┊}
+┊   ┊148┊export interface AddMembersMutationArgs {
+┊   ┊149┊  groupId: number;
+┊   ┊150┊
+┊   ┊151┊  userIds: number[];
+┊   ┊152┊}
+┊   ┊153┊export interface RemoveMembersMutationArgs {
+┊   ┊154┊  groupId: number;
+┊   ┊155┊
+┊   ┊156┊  userIds: number[];
+┊   ┊157┊}
+┊   ┊158┊export interface AddAdminsMutationArgs {
+┊   ┊159┊  groupId: number;
+┊   ┊160┊
+┊   ┊161┊  userIds: number[];
+┊   ┊162┊}
+┊   ┊163┊export interface RemoveAdminsMutationArgs {
+┊   ┊164┊  groupId: number;
+┊   ┊165┊
+┊   ┊166┊  userIds: number[];
+┊   ┊167┊}
+┊   ┊168┊export interface SetGroupNameMutationArgs {
+┊   ┊169┊  groupId: number;
+┊   ┊170┊}
+┊   ┊171┊export interface SetGroupPictureMutationArgs {
+┊   ┊172┊  groupId: number;
+┊   ┊173┊}
+┊   ┊174┊export interface MarkAsReceivedMutationArgs {
+┊   ┊175┊  chatId: number;
+┊   ┊176┊}
+┊   ┊177┊export interface MarkAsReadMutationArgs {
+┊   ┊178┊  chatId: number;
+┊   ┊179┊}
 ┊ 97┊180┊
 ┊ 98┊181┊import { GraphQLResolveInfo } from "graphql";
 ┊ 99┊182┊
```
```diff
@@ -408,6 +491,197 @@
 ┊408┊491┊  > = Resolver<R, Parent, Context>;
 ┊409┊492┊}
 ┊410┊493┊
+┊   ┊494┊export namespace MutationResolvers {
+┊   ┊495┊  export interface Resolvers<Context = {}, TypeParent = {}> {
+┊   ┊496┊    addChat?: AddChatResolver<Maybe<Chat>, TypeParent, Context>;
+┊   ┊497┊
+┊   ┊498┊    addGroup?: AddGroupResolver<Maybe<Chat>, TypeParent, Context>;
+┊   ┊499┊
+┊   ┊500┊    removeChat?: RemoveChatResolver<Maybe<number>, TypeParent, Context>;
+┊   ┊501┊
+┊   ┊502┊    addMessage?: AddMessageResolver<Maybe<Message>, TypeParent, Context>;
+┊   ┊503┊
+┊   ┊504┊    removeMessages?: RemoveMessagesResolver<
+┊   ┊505┊      Maybe<(Maybe<number>)[]>,
+┊   ┊506┊      TypeParent,
+┊   ┊507┊      Context
+┊   ┊508┊    >;
+┊   ┊509┊
+┊   ┊510┊    addMembers?: AddMembersResolver<
+┊   ┊511┊      Maybe<(Maybe<number>)[]>,
+┊   ┊512┊      TypeParent,
+┊   ┊513┊      Context
+┊   ┊514┊    >;
+┊   ┊515┊
+┊   ┊516┊    removeMembers?: RemoveMembersResolver<
+┊   ┊517┊      Maybe<(Maybe<number>)[]>,
+┊   ┊518┊      TypeParent,
+┊   ┊519┊      Context
+┊   ┊520┊    >;
+┊   ┊521┊
+┊   ┊522┊    addAdmins?: AddAdminsResolver<
+┊   ┊523┊      Maybe<(Maybe<number>)[]>,
+┊   ┊524┊      TypeParent,
+┊   ┊525┊      Context
+┊   ┊526┊    >;
+┊   ┊527┊
+┊   ┊528┊    removeAdmins?: RemoveAdminsResolver<
+┊   ┊529┊      Maybe<(Maybe<number>)[]>,
+┊   ┊530┊      TypeParent,
+┊   ┊531┊      Context
+┊   ┊532┊    >;
+┊   ┊533┊
+┊   ┊534┊    setGroupName?: SetGroupNameResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊535┊
+┊   ┊536┊    setGroupPicture?: SetGroupPictureResolver<
+┊   ┊537┊      Maybe<string>,
+┊   ┊538┊      TypeParent,
+┊   ┊539┊      Context
+┊   ┊540┊    >;
+┊   ┊541┊
+┊   ┊542┊    markAsReceived?: MarkAsReceivedResolver<
+┊   ┊543┊      Maybe<boolean>,
+┊   ┊544┊      TypeParent,
+┊   ┊545┊      Context
+┊   ┊546┊    >;
+┊   ┊547┊
+┊   ┊548┊    markAsRead?: MarkAsReadResolver<Maybe<boolean>, TypeParent, Context>;
+┊   ┊549┊  }
+┊   ┊550┊
+┊   ┊551┊  export type AddChatResolver<
+┊   ┊552┊    R = Maybe<Chat>,
+┊   ┊553┊    Parent = {},
+┊   ┊554┊    Context = {}
+┊   ┊555┊  > = Resolver<R, Parent, Context, AddChatArgs>;
+┊   ┊556┊  export interface AddChatArgs {
+┊   ┊557┊    recipientId: number;
+┊   ┊558┊  }
+┊   ┊559┊
+┊   ┊560┊  export type AddGroupResolver<
+┊   ┊561┊    R = Maybe<Chat>,
+┊   ┊562┊    Parent = {},
+┊   ┊563┊    Context = {}
+┊   ┊564┊  > = Resolver<R, Parent, Context, AddGroupArgs>;
+┊   ┊565┊  export interface AddGroupArgs {
+┊   ┊566┊    recipientIds: number[];
+┊   ┊567┊
+┊   ┊568┊    groupName: string;
+┊   ┊569┊  }
+┊   ┊570┊
+┊   ┊571┊  export type RemoveChatResolver<
+┊   ┊572┊    R = Maybe<number>,
+┊   ┊573┊    Parent = {},
+┊   ┊574┊    Context = {}
+┊   ┊575┊  > = Resolver<R, Parent, Context, RemoveChatArgs>;
+┊   ┊576┊  export interface RemoveChatArgs {
+┊   ┊577┊    chatId: number;
+┊   ┊578┊  }
+┊   ┊579┊
+┊   ┊580┊  export type AddMessageResolver<
+┊   ┊581┊    R = Maybe<Message>,
+┊   ┊582┊    Parent = {},
+┊   ┊583┊    Context = {}
+┊   ┊584┊  > = Resolver<R, Parent, Context, AddMessageArgs>;
+┊   ┊585┊  export interface AddMessageArgs {
+┊   ┊586┊    chatId: number;
+┊   ┊587┊
+┊   ┊588┊    content: string;
+┊   ┊589┊  }
+┊   ┊590┊
+┊   ┊591┊  export type RemoveMessagesResolver<
+┊   ┊592┊    R = Maybe<(Maybe<number>)[]>,
+┊   ┊593┊    Parent = {},
+┊   ┊594┊    Context = {}
+┊   ┊595┊  > = Resolver<R, Parent, Context, RemoveMessagesArgs>;
+┊   ┊596┊  export interface RemoveMessagesArgs {
+┊   ┊597┊    chatId: number;
+┊   ┊598┊
+┊   ┊599┊    messageIds?: Maybe<(Maybe<number>)[]>;
+┊   ┊600┊
+┊   ┊601┊    all?: Maybe<boolean>;
+┊   ┊602┊  }
+┊   ┊603┊
+┊   ┊604┊  export type AddMembersResolver<
+┊   ┊605┊    R = Maybe<(Maybe<number>)[]>,
+┊   ┊606┊    Parent = {},
+┊   ┊607┊    Context = {}
+┊   ┊608┊  > = Resolver<R, Parent, Context, AddMembersArgs>;
+┊   ┊609┊  export interface AddMembersArgs {
+┊   ┊610┊    groupId: number;
+┊   ┊611┊
+┊   ┊612┊    userIds: number[];
+┊   ┊613┊  }
+┊   ┊614┊
+┊   ┊615┊  export type RemoveMembersResolver<
+┊   ┊616┊    R = Maybe<(Maybe<number>)[]>,
+┊   ┊617┊    Parent = {},
+┊   ┊618┊    Context = {}
+┊   ┊619┊  > = Resolver<R, Parent, Context, RemoveMembersArgs>;
+┊   ┊620┊  export interface RemoveMembersArgs {
+┊   ┊621┊    groupId: number;
+┊   ┊622┊
+┊   ┊623┊    userIds: number[];
+┊   ┊624┊  }
+┊   ┊625┊
+┊   ┊626┊  export type AddAdminsResolver<
+┊   ┊627┊    R = Maybe<(Maybe<number>)[]>,
+┊   ┊628┊    Parent = {},
+┊   ┊629┊    Context = {}
+┊   ┊630┊  > = Resolver<R, Parent, Context, AddAdminsArgs>;
+┊   ┊631┊  export interface AddAdminsArgs {
+┊   ┊632┊    groupId: number;
+┊   ┊633┊
+┊   ┊634┊    userIds: number[];
+┊   ┊635┊  }
+┊   ┊636┊
+┊   ┊637┊  export type RemoveAdminsResolver<
+┊   ┊638┊    R = Maybe<(Maybe<number>)[]>,
+┊   ┊639┊    Parent = {},
+┊   ┊640┊    Context = {}
+┊   ┊641┊  > = Resolver<R, Parent, Context, RemoveAdminsArgs>;
+┊   ┊642┊  export interface RemoveAdminsArgs {
+┊   ┊643┊    groupId: number;
+┊   ┊644┊
+┊   ┊645┊    userIds: number[];
+┊   ┊646┊  }
+┊   ┊647┊
+┊   ┊648┊  export type SetGroupNameResolver<
+┊   ┊649┊    R = Maybe<string>,
+┊   ┊650┊    Parent = {},
+┊   ┊651┊    Context = {}
+┊   ┊652┊  > = Resolver<R, Parent, Context, SetGroupNameArgs>;
+┊   ┊653┊  export interface SetGroupNameArgs {
+┊   ┊654┊    groupId: number;
+┊   ┊655┊  }
+┊   ┊656┊
+┊   ┊657┊  export type SetGroupPictureResolver<
+┊   ┊658┊    R = Maybe<string>,
+┊   ┊659┊    Parent = {},
+┊   ┊660┊    Context = {}
+┊   ┊661┊  > = Resolver<R, Parent, Context, SetGroupPictureArgs>;
+┊   ┊662┊  export interface SetGroupPictureArgs {
+┊   ┊663┊    groupId: number;
+┊   ┊664┊  }
+┊   ┊665┊
+┊   ┊666┊  export type MarkAsReceivedResolver<
+┊   ┊667┊    R = Maybe<boolean>,
+┊   ┊668┊    Parent = {},
+┊   ┊669┊    Context = {}
+┊   ┊670┊  > = Resolver<R, Parent, Context, MarkAsReceivedArgs>;
+┊   ┊671┊  export interface MarkAsReceivedArgs {
+┊   ┊672┊    chatId: number;
+┊   ┊673┊  }
+┊   ┊674┊
+┊   ┊675┊  export type MarkAsReadResolver<
+┊   ┊676┊    R = Maybe<boolean>,
+┊   ┊677┊    Parent = {},
+┊   ┊678┊    Context = {}
+┊   ┊679┊  > = Resolver<R, Parent, Context, MarkAsReadArgs>;
+┊   ┊680┊  export interface MarkAsReadArgs {
+┊   ┊681┊    chatId: number;
+┊   ┊682┊  }
+┊   ┊683┊}
+┊   ┊684┊
 ┊411┊685┊/** Directs the executor to skip this field or fragment when the `if` argument is true. */
 ┊412┊686┊export type SkipDirectiveResolver<Result> = DirectiveResolverFn<
 ┊413┊687┊  Result,
```
```diff
@@ -447,6 +721,7 @@
 ┊447┊721┊  Chat?: ChatResolvers.Resolvers;
 ┊448┊722┊  Message?: MessageResolvers.Resolvers;
 ┊449┊723┊  Recipient?: RecipientResolvers.Resolvers;
+┊   ┊724┊  Mutation?: MutationResolvers.Resolvers;
 ┊450┊725┊}
 ┊451┊726┊
 ┊452┊727┊export interface IDirectiveResolvers<Result> {
```

[}]: #

    $ npm run generator

[{]: <helper> (diffStep "3.3")

#### Step 3.3: Use generated types

##### Changed schema&#x2F;resolvers.ts
```diff
@@ -1,5 +1,5 @@
-┊1┊ ┊import { Chat, db, Message, MessageType, Recipient } from "../db";
 ┊2┊1┊import { IResolvers } from "../types";
+┊ ┊2┊import { Chat, db, Message, MessageType, Recipient } from "../db";
 ┊3┊3┊import * as moment from "moment";
 ┊4┊4┊
 ┊5┊5┊let users = db.users;
```
```diff
@@ -15,11 +15,11 @@
 ┊15┊15┊  },
 ┊16┊16┊  Mutation: {
 ┊17┊17┊    addChat: (obj, {recipientId}) => {
-┊18┊  ┊      if (!users.find(user => user.id === recipientId)) {
+┊  ┊18┊      if (!users.find(user => user.id === Number(recipientId))) {
 ┊19┊19┊        throw new Error(`Recipient ${recipientId} doesn't exist.`);
 ┊20┊20┊      }
 ┊21┊21┊
-┊22┊  ┊      const chat = chats.find(chat => !chat.name && chat.allTimeMemberIds.includes(currentUser) && chat.allTimeMemberIds.includes(recipientId));
+┊  ┊22┊      const chat = chats.find(chat => !chat.name && chat.allTimeMemberIds.includes(currentUser) && chat.allTimeMemberIds.includes(Number(recipientId)));
 ┊23┊23┊      if (chat) {
 ┊24┊24┊        // Chat already exists. Both users are already in the allTimeMemberIds array
 ┊25┊25┊        const chatId = chat.id;
```
```diff
@@ -40,7 +40,7 @@
 ┊40┊40┊          picture: null,
 ┊41┊41┊          adminIds: null,
 ┊42┊42┊          ownerId: null,
-┊43┊  ┊          allTimeMemberIds: [currentUser, recipientId],
+┊  ┊43┊          allTimeMemberIds: [currentUser, Number(recipientId)],
 ┊44┊44┊          // Chat will not be listed to the other user until the first message gets written
 ┊45┊45┊          listingMemberIds: [currentUser],
 ┊46┊46┊          actualGroupMemberIds: null,
```
```diff
@@ -51,8 +51,8 @@
 ┊51┊51┊      }
 ┊52┊52┊    },
 ┊53┊53┊    addGroup: (obj, {recipientIds, groupName}) => {
-┊54┊  ┊      recipientIds.forEach((recipientId: any) => {
-┊55┊  ┊        if (!users.find(user => user.id === recipientId)) {
+┊  ┊54┊      recipientIds.forEach(recipientId => {
+┊  ┊55┊        if (!users.find(user => user.id === Number(recipientId))) {
 ┊56┊56┊          throw new Error(`Recipient ${recipientId} doesn't exist.`);
 ┊57┊57┊        }
 ┊58┊58┊      });
```
```diff
@@ -64,16 +64,16 @@
 ┊64┊64┊        picture: null,
 ┊65┊65┊        adminIds: [currentUser],
 ┊66┊66┊        ownerId: currentUser,
-┊67┊  ┊        allTimeMemberIds: [currentUser, ...recipientIds],
-┊68┊  ┊        listingMemberIds: [currentUser, ...recipientIds],
-┊69┊  ┊        actualGroupMemberIds: [currentUser, ...recipientIds],
+┊  ┊67┊        allTimeMemberIds: [currentUser, ...recipientIds.map(id => Number(id))],
+┊  ┊68┊        listingMemberIds: [currentUser, ...recipientIds.map(id => Number(id))],
+┊  ┊69┊        actualGroupMemberIds: [currentUser, ...recipientIds.map(id => Number(id))],
 ┊70┊70┊        messages: [],
 ┊71┊71┊      };
 ┊72┊72┊      chats.push(chat);
 ┊73┊73┊      return chat;
 ┊74┊74┊    },
 ┊75┊75┊    removeChat: (obj, {chatId}) => {
-┊76┊  ┊      const chat = chats.find(chat => chat.id === chatId);
+┊  ┊76┊      const chat = chats.find(chat => chat.id === Number(chatId));
 ┊77┊77┊
 ┊78┊78┊      if (!chat) {
 ┊79┊79┊        throw new Error(`The chat ${chatId} doesn't exist.`);
```
```diff
@@ -103,17 +103,17 @@
 ┊103┊103┊        // Check how many members are left
 ┊104┊104┊        if (listingMemberIds.length === 0) {
 ┊105┊105┊          // Delete the chat
-┊106┊   ┊          chats = chats.filter(chat => chat.id !== chatId);
+┊   ┊106┊          chats = chats.filter(chat => chat.id !== Number(chatId));
 ┊107┊107┊        } else {
 ┊108┊108┊          // Update the chat
 ┊109┊109┊          chats = chats.map(chat => {
-┊110┊   ┊            if (chat.id === chatId) {
+┊   ┊110┊            if (chat.id === Number(chatId)) {
 ┊111┊111┊              chat = {...chat, listingMemberIds, messages};
 ┊112┊112┊            }
 ┊113┊113┊            return chat;
 ┊114┊114┊          });
 ┊115┊115┊        }
-┊116┊   ┊        return chatId;
+┊   ┊116┊        return Number(chatId);
 ┊117┊117┊      } else {
 ┊118┊118┊        // Group
 ┊119┊119┊        if (chat.ownerId !== currentUser) {
```
```diff
@@ -138,7 +138,7 @@
 ┊138┊138┊        // Check how many members (including previous ones who can still access old messages) are left
 ┊139┊139┊        if (listingMemberIds.length === 0) {
 ┊140┊140┊          // Remove the group
-┊141┊   ┊          chats = chats.filter(chat => chat.id !== chatId);
+┊   ┊141┊          chats = chats.filter(chat => chat.id !== Number(chatId));
 ┊142┊142┊        } else {
 ┊143┊143┊          // Update the group
 ┊144┊144┊
```
```diff
@@ -156,13 +156,13 @@
 ┊156┊156┊          }
 ┊157┊157┊
 ┊158┊158┊          chats = chats.map(chat => {
-┊159┊   ┊            if (chat.id === chatId) {
+┊   ┊159┊            if (chat.id === Number(chatId)) {
 ┊160┊160┊              chat = {...chat, messages, listingMemberIds, actualGroupMemberIds, adminIds, ownerId};
 ┊161┊161┊            }
 ┊162┊162┊            return chat;
 ┊163┊163┊          });
 ┊164┊164┊        }
-┊165┊   ┊        return chatId;
+┊   ┊165┊        return Number(chatId);
 ┊166┊166┊      }
 ┊167┊167┊    },
 ┊168┊168┊    addMessage: (obj, {chatId, content}) => {
```
```diff
@@ -170,7 +170,7 @@
 ┊170┊170┊        throw new Error(`Cannot add empty or null messages.`);
 ┊171┊171┊      }
 ┊172┊172┊
-┊173┊   ┊      let chat = chats.find(chat => chat.id === chatId);
+┊   ┊173┊      let chat = chats.find(chat => chat.id === Number(chatId));
 ┊174┊174┊
 ┊175┊175┊      if (!chat) {
 ┊176┊176┊        throw new Error(`Cannot find chat ${chatId}.`);
```
```diff
@@ -191,7 +191,7 @@
 ┊191┊191┊          const listingMemberIds = chat.listingMemberIds.concat(recipientId);
 ┊192┊192┊
 ┊193┊193┊          chats = chats.map(chat => {
-┊194┊   ┊            if (chat.id === chatId) {
+┊   ┊194┊            if (chat.id === Number(chatId)) {
 ┊195┊195┊              chat = {...chat, listingMemberIds};
 ┊196┊196┊            }
 ┊197┊197┊            return chat;
```
```diff
@@ -217,7 +217,7 @@
 ┊217┊217┊          recipients.push({
 ┊218┊218┊            userId: holderId,
 ┊219┊219┊            messageId: id,
-┊220┊   ┊            chatId: chatId,
+┊   ┊220┊            chatId: Number(chatId),
 ┊221┊221┊            receivedAt: null,
 ┊222┊222┊            readAt: null,
 ┊223┊223┊          });
```
```diff
@@ -226,7 +226,7 @@
 ┊226┊226┊
 ┊227┊227┊      const message: Message = {
 ┊228┊228┊        id,
-┊229┊   ┊        chatId,
+┊   ┊229┊        chatId: Number(chatId),
 ┊230┊230┊        senderId: currentUser,
 ┊231┊231┊        content,
 ┊232┊232┊        createdAt: moment().unix(),
```
```diff
@@ -236,7 +236,7 @@
 ┊236┊236┊      };
 ┊237┊237┊
 ┊238┊238┊      chats = chats.map(chat => {
-┊239┊   ┊        if (chat.id === chatId) {
+┊   ┊239┊        if (chat.id === Number(chatId)) {
 ┊240┊240┊          chat = {...chat, messages: chat.messages.concat(message)}
 ┊241┊241┊        }
 ┊242┊242┊        return chat;
```
```diff
@@ -245,7 +245,7 @@
 ┊245┊245┊      return message;
 ┊246┊246┊    },
 ┊247┊247┊    removeMessages: (obj, {chatId, messageIds, all}) => {
-┊248┊   ┊      const chat = chats.find(chat => chat.id === chatId);
+┊   ┊248┊      const chat = chats.find(chat => chat.id === Number(chatId));
 ┊249┊249┊
 ┊250┊250┊      if (!chat) {
 ┊251┊251┊        throw new Error(`Cannot find chat ${chatId}.`);
```
```diff
@@ -261,7 +261,7 @@
 ┊261┊261┊
 ┊262┊262┊      let deletedIds: number[] = [];
 ┊263┊263┊      chats = chats.map(chat => {
-┊264┊   ┊        if (chat.id === chatId) {
+┊   ┊264┊        if (chat.id === Number(chatId)) {
 ┊265┊265┊          // Instead of chaining map and filter we can loop once using reduce
 ┊266┊266┊          const messages = chat.messages.reduce<Message[]>((filtered, message) => {
 ┊267┊267┊            if (all || messageIds!.includes(message.id)) {
```

[}]: #



[//]: # (foot-start)

[{]: <helper> (navStep)

| [< Previous Step](step2.md) | [Next Step >](step4.md) |
|:--------------------------------|--------------------------------:|

[}]: #

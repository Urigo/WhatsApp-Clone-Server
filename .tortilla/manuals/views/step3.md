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
+┊  ┊ 2┊import bodyParser from "body-parser";
+┊  ┊ 3┊import cors from 'cors';
+┊  ┊ 4┊import express from 'express';
+┊  ┊ 5┊import { ApolloServer } from "apollo-server-express";
+┊  ┊ 6┊
+┊  ┊ 7┊const PORT = 4000;
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
@@ -0,0 +1,448 @@
+┊   ┊  1┊import moment from 'moment';
+┊   ┊  2┊
+┊   ┊  3┊export enum MessageType {
+┊   ┊  4┊  PICTURE,
+┊   ┊  5┊  TEXT,
+┊   ┊  6┊  LOCATION,
+┊   ┊  7┊}
+┊   ┊  8┊
+┊   ┊  9┊export interface UserDb {
+┊   ┊ 10┊  id: number,
+┊   ┊ 11┊  username: string,
+┊   ┊ 12┊  password: string,
+┊   ┊ 13┊  name: string,
+┊   ┊ 14┊  picture?: string | null,
+┊   ┊ 15┊  phone?: string | null,
+┊   ┊ 16┊}
+┊   ┊ 17┊
+┊   ┊ 18┊export interface ChatDb {
+┊   ┊ 19┊  id: number,
+┊   ┊ 20┊  createdAt: Date,
+┊   ┊ 21┊  name?: string | null,
+┊   ┊ 22┊  picture?: string | null,
+┊   ┊ 23┊  // All members, current and past ones.
+┊   ┊ 24┊  allTimeMemberIds: number[],
+┊   ┊ 25┊  // Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
+┊   ┊ 26┊  listingMemberIds: number[],
+┊   ┊ 27┊  // Actual members of the group (they are not the only ones who get the group listed). Null for chats.
+┊   ┊ 28┊  actualGroupMemberIds?: number[] | null,
+┊   ┊ 29┊  adminIds?: number[] | null,
+┊   ┊ 30┊  ownerId?: number | null,
+┊   ┊ 31┊  messages: MessageDb[],
+┊   ┊ 32┊}
+┊   ┊ 33┊
+┊   ┊ 34┊export interface MessageDb {
+┊   ┊ 35┊  id: number,
+┊   ┊ 36┊  chatId: number,
+┊   ┊ 37┊  senderId: number,
+┊   ┊ 38┊  content: string,
+┊   ┊ 39┊  createdAt: Date,
+┊   ┊ 40┊  type: MessageType,
+┊   ┊ 41┊  recipients: RecipientDb[],
+┊   ┊ 42┊  holderIds: number[],
+┊   ┊ 43┊}
+┊   ┊ 44┊
+┊   ┊ 45┊export interface RecipientDb {
+┊   ┊ 46┊  userId: number,
+┊   ┊ 47┊  messageId: number,
+┊   ┊ 48┊  chatId: number,
+┊   ┊ 49┊  receivedAt: Date | null,
+┊   ┊ 50┊  readAt: Date | null,
+┊   ┊ 51┊}
+┊   ┊ 52┊
+┊   ┊ 53┊const users: UserDb[] = [
+┊   ┊ 54┊  {
+┊   ┊ 55┊    id: 1,
+┊   ┊ 56┊    username: 'ethan',
+┊   ┊ 57┊    password: '$2a$08$NO9tkFLCoSqX1c5wk3s7z.JfxaVMKA.m7zUDdDwEquo4rvzimQeJm', // 111
+┊   ┊ 58┊    name: 'Ethan Gonzalez',
+┊   ┊ 59┊    picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
+┊   ┊ 60┊    phone: '+391234567890',
+┊   ┊ 61┊  },
+┊   ┊ 62┊  {
+┊   ┊ 63┊    id: 2,
+┊   ┊ 64┊    username: 'bryan',
+┊   ┊ 65┊    password: '$2a$08$xE4FuCi/ifxjL2S8CzKAmuKLwv18ktksSN.F3XYEnpmcKtpbpeZgO', // 222
+┊   ┊ 66┊    name: 'Bryan Wallace',
+┊   ┊ 67┊    picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
+┊   ┊ 68┊    phone: '+391234567891',
+┊   ┊ 69┊  },
+┊   ┊ 70┊  {
+┊   ┊ 71┊    id: 3,
+┊   ┊ 72┊    username: 'avery',
+┊   ┊ 73┊    password: '$2a$08$UHgH7J8G6z1mGQn2qx2kdeWv0jvgHItyAsL9hpEUI3KJmhVW5Q1d.', // 333
+┊   ┊ 74┊    name: 'Avery Stewart',
+┊   ┊ 75┊    picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
+┊   ┊ 76┊    phone: '+391234567892',
+┊   ┊ 77┊  },
+┊   ┊ 78┊  {
+┊   ┊ 79┊    id: 4,
+┊   ┊ 80┊    username: 'katie',
+┊   ┊ 81┊    password: '$2a$08$wR1k5Q3T9FC7fUgB7Gdb9Os/GV7dGBBf4PLlWT7HERMFhmFDt47xi', // 444
+┊   ┊ 82┊    name: 'Katie Peterson',
+┊   ┊ 83┊    picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
+┊   ┊ 84┊    phone: '+391234567893',
+┊   ┊ 85┊  },
+┊   ┊ 86┊  {
+┊   ┊ 87┊    id: 5,
+┊   ┊ 88┊    username: 'ray',
+┊   ┊ 89┊    password: '$2a$08$6.mbXqsDX82ZZ7q5d8Osb..JrGSsNp4R3IKj7mxgF6YGT0OmMw242', // 555
+┊   ┊ 90┊    name: 'Ray Edwards',
+┊   ┊ 91┊    picture: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
+┊   ┊ 92┊    phone: '+391234567894',
+┊   ┊ 93┊  },
+┊   ┊ 94┊  {
+┊   ┊ 95┊    id: 6,
+┊   ┊ 96┊    username: 'niko',
+┊   ┊ 97┊    password: '$2a$08$fL5lZR.Rwf9FWWe8XwwlceiPBBim8n9aFtaem.INQhiKT4.Ux3Uq.', // 666
+┊   ┊ 98┊    name: 'Niccolò Belli',
+┊   ┊ 99┊    picture: 'https://randomuser.me/api/portraits/thumb/men/4.jpg',
+┊   ┊100┊    phone: '+391234567895',
+┊   ┊101┊  },
+┊   ┊102┊  {
+┊   ┊103┊    id: 7,
+┊   ┊104┊    username: 'mario',
+┊   ┊105┊    password: '$2a$08$nDHDmWcVxDnH5DDT3HMMC.psqcnu6wBiOgkmJUy9IH..qxa3R6YrO', // 777
+┊   ┊106┊    name: 'Mario Rossi',
+┊   ┊107┊    picture: 'https://randomuser.me/api/portraits/thumb/men/5.jpg',
+┊   ┊108┊    phone: '+391234567896',
+┊   ┊109┊  },
+┊   ┊110┊];
+┊   ┊111┊
+┊   ┊112┊const chats: ChatDb[] = [
+┊   ┊113┊  {
+┊   ┊114┊    id: 1,
+┊   ┊115┊    createdAt: moment().subtract(10, 'weeks').toDate(),
+┊   ┊116┊    name: null,
+┊   ┊117┊    picture: null,
+┊   ┊118┊    allTimeMemberIds: [1, 3],
+┊   ┊119┊    listingMemberIds: [1, 3],
+┊   ┊120┊    adminIds: null,
+┊   ┊121┊    ownerId: null,
+┊   ┊122┊    messages: [
+┊   ┊123┊      {
+┊   ┊124┊        id: 1,
+┊   ┊125┊        chatId: 1,
+┊   ┊126┊        senderId: 1,
+┊   ┊127┊        content: 'You on your way?',
+┊   ┊128┊        createdAt: moment().subtract(1, 'hours').toDate(),
+┊   ┊129┊        type: MessageType.TEXT,
+┊   ┊130┊        recipients: [
+┊   ┊131┊          {
+┊   ┊132┊            userId: 3,
+┊   ┊133┊            messageId: 1,
+┊   ┊134┊            chatId: 1,
+┊   ┊135┊            receivedAt: null,
+┊   ┊136┊            readAt: null,
+┊   ┊137┊          },
+┊   ┊138┊        ],
+┊   ┊139┊        holderIds: [1, 3],
+┊   ┊140┊      },
+┊   ┊141┊      {
+┊   ┊142┊        id: 2,
+┊   ┊143┊        chatId: 1,
+┊   ┊144┊        senderId: 3,
+┊   ┊145┊        content: 'Yep!',
+┊   ┊146┊        createdAt: moment().subtract(1, 'hours').add(5, 'minutes').toDate(),
+┊   ┊147┊        type: MessageType.TEXT,
+┊   ┊148┊        recipients: [
+┊   ┊149┊          {
+┊   ┊150┊            userId: 1,
+┊   ┊151┊            messageId: 2,
+┊   ┊152┊            chatId: 1,
+┊   ┊153┊            receivedAt: null,
+┊   ┊154┊            readAt: null,
+┊   ┊155┊          },
+┊   ┊156┊        ],
+┊   ┊157┊        holderIds: [3, 1],
+┊   ┊158┊      },
+┊   ┊159┊    ],
+┊   ┊160┊  },
+┊   ┊161┊  {
+┊   ┊162┊    id: 2,
+┊   ┊163┊    createdAt: moment().subtract(9, 'weeks').toDate(),
+┊   ┊164┊    name: null,
+┊   ┊165┊    picture: null,
+┊   ┊166┊    allTimeMemberIds: [1, 4],
+┊   ┊167┊    listingMemberIds: [1, 4],
+┊   ┊168┊    adminIds: null,
+┊   ┊169┊    ownerId: null,
+┊   ┊170┊    messages: [
+┊   ┊171┊      {
+┊   ┊172┊        id: 1,
+┊   ┊173┊        chatId: 2,
+┊   ┊174┊        senderId: 1,
+┊   ┊175┊        content: 'Hey, it\'s me',
+┊   ┊176┊        createdAt: moment().subtract(2, 'hours').toDate(),
+┊   ┊177┊        type: MessageType.TEXT,
+┊   ┊178┊        recipients: [
+┊   ┊179┊          {
+┊   ┊180┊            userId: 4,
+┊   ┊181┊            messageId: 1,
+┊   ┊182┊            chatId: 2,
+┊   ┊183┊            receivedAt: null,
+┊   ┊184┊            readAt: null,
+┊   ┊185┊          },
+┊   ┊186┊        ],
+┊   ┊187┊        holderIds: [1, 4],
+┊   ┊188┊      },
+┊   ┊189┊    ],
+┊   ┊190┊  },
+┊   ┊191┊  {
+┊   ┊192┊    id: 3,
+┊   ┊193┊    createdAt: moment().subtract(8, 'weeks').toDate(),
+┊   ┊194┊    name: null,
+┊   ┊195┊    picture: null,
+┊   ┊196┊    allTimeMemberIds: [1, 5],
+┊   ┊197┊    listingMemberIds: [1, 5],
+┊   ┊198┊    adminIds: null,
+┊   ┊199┊    ownerId: null,
+┊   ┊200┊    messages: [
+┊   ┊201┊      {
+┊   ┊202┊        id: 1,
+┊   ┊203┊        chatId: 3,
+┊   ┊204┊        senderId: 1,
+┊   ┊205┊        content: 'I should buy a boat',
+┊   ┊206┊        createdAt: moment().subtract(1, 'days').toDate(),
+┊   ┊207┊        type: MessageType.TEXT,
+┊   ┊208┊        recipients: [
+┊   ┊209┊          {
+┊   ┊210┊            userId: 5,
+┊   ┊211┊            messageId: 1,
+┊   ┊212┊            chatId: 3,
+┊   ┊213┊            receivedAt: null,
+┊   ┊214┊            readAt: null,
+┊   ┊215┊          },
+┊   ┊216┊        ],
+┊   ┊217┊        holderIds: [1, 5],
+┊   ┊218┊      },
+┊   ┊219┊      {
+┊   ┊220┊        id: 2,
+┊   ┊221┊        chatId: 3,
+┊   ┊222┊        senderId: 1,
+┊   ┊223┊        content: 'You still there?',
+┊   ┊224┊        createdAt: moment().subtract(1, 'days').add(16, 'hours').toDate(),
+┊   ┊225┊        type: MessageType.TEXT,
+┊   ┊226┊        recipients: [
+┊   ┊227┊          {
+┊   ┊228┊            userId: 5,
+┊   ┊229┊            messageId: 2,
+┊   ┊230┊            chatId: 3,
+┊   ┊231┊            receivedAt: null,
+┊   ┊232┊            readAt: null,
+┊   ┊233┊          },
+┊   ┊234┊        ],
+┊   ┊235┊        holderIds: [1, 5],
+┊   ┊236┊      },
+┊   ┊237┊    ],
+┊   ┊238┊  },
+┊   ┊239┊  {
+┊   ┊240┊    id: 4,
+┊   ┊241┊    createdAt: moment().subtract(7, 'weeks').toDate(),
+┊   ┊242┊    name: null,
+┊   ┊243┊    picture: null,
+┊   ┊244┊    allTimeMemberIds: [3, 4],
+┊   ┊245┊    listingMemberIds: [3, 4],
+┊   ┊246┊    adminIds: null,
+┊   ┊247┊    ownerId: null,
+┊   ┊248┊    messages: [
+┊   ┊249┊      {
+┊   ┊250┊        id: 1,
+┊   ┊251┊        chatId: 4,
+┊   ┊252┊        senderId: 3,
+┊   ┊253┊        content: 'Look at my mukluks!',
+┊   ┊254┊        createdAt: moment().subtract(4, 'days').toDate(),
+┊   ┊255┊        type: MessageType.TEXT,
+┊   ┊256┊        recipients: [
+┊   ┊257┊          {
+┊   ┊258┊            userId: 4,
+┊   ┊259┊            messageId: 1,
+┊   ┊260┊            chatId: 4,
+┊   ┊261┊            receivedAt: null,
+┊   ┊262┊            readAt: null,
+┊   ┊263┊          },
+┊   ┊264┊        ],
+┊   ┊265┊        holderIds: [3, 4],
+┊   ┊266┊      },
+┊   ┊267┊    ],
+┊   ┊268┊  },
+┊   ┊269┊  {
+┊   ┊270┊    id: 5,
+┊   ┊271┊    createdAt: moment().subtract(6, 'weeks').toDate(),
+┊   ┊272┊    name: null,
+┊   ┊273┊    picture: null,
+┊   ┊274┊    allTimeMemberIds: [2, 5],
+┊   ┊275┊    listingMemberIds: [2, 5],
+┊   ┊276┊    adminIds: null,
+┊   ┊277┊    ownerId: null,
+┊   ┊278┊    messages: [
+┊   ┊279┊      {
+┊   ┊280┊        id: 1,
+┊   ┊281┊        chatId: 5,
+┊   ┊282┊        senderId: 2,
+┊   ┊283┊        content: 'This is wicked good ice cream.',
+┊   ┊284┊        createdAt: moment().subtract(2, 'weeks').toDate(),
+┊   ┊285┊        type: MessageType.TEXT,
+┊   ┊286┊        recipients: [
+┊   ┊287┊          {
+┊   ┊288┊            userId: 5,
+┊   ┊289┊            messageId: 1,
+┊   ┊290┊            chatId: 5,
+┊   ┊291┊            receivedAt: null,
+┊   ┊292┊            readAt: null,
+┊   ┊293┊          },
+┊   ┊294┊        ],
+┊   ┊295┊        holderIds: [2, 5],
+┊   ┊296┊      },
+┊   ┊297┊      {
+┊   ┊298┊        id: 2,
+┊   ┊299┊        chatId: 6,
+┊   ┊300┊        senderId: 5,
+┊   ┊301┊        content: 'Love it!',
+┊   ┊302┊        createdAt: moment().subtract(2, 'weeks').add(10, 'minutes').toDate(),
+┊   ┊303┊        type: MessageType.TEXT,
+┊   ┊304┊        recipients: [
+┊   ┊305┊          {
+┊   ┊306┊            userId: 2,
+┊   ┊307┊            messageId: 2,
+┊   ┊308┊            chatId: 5,
+┊   ┊309┊            receivedAt: null,
+┊   ┊310┊            readAt: null,
+┊   ┊311┊          },
+┊   ┊312┊        ],
+┊   ┊313┊        holderIds: [5, 2],
+┊   ┊314┊      },
+┊   ┊315┊    ],
+┊   ┊316┊  },
+┊   ┊317┊  {
+┊   ┊318┊    id: 6,
+┊   ┊319┊    createdAt: moment().subtract(5, 'weeks').toDate(),
+┊   ┊320┊    name: null,
+┊   ┊321┊    picture: null,
+┊   ┊322┊    allTimeMemberIds: [1, 6],
+┊   ┊323┊    listingMemberIds: [1],
+┊   ┊324┊    adminIds: null,
+┊   ┊325┊    ownerId: null,
+┊   ┊326┊    messages: [],
+┊   ┊327┊  },
+┊   ┊328┊  {
+┊   ┊329┊    id: 7,
+┊   ┊330┊    createdAt: moment().subtract(4, 'weeks').toDate(),
+┊   ┊331┊    name: null,
+┊   ┊332┊    picture: null,
+┊   ┊333┊    allTimeMemberIds: [2, 1],
+┊   ┊334┊    listingMemberIds: [2],
+┊   ┊335┊    adminIds: null,
+┊   ┊336┊    ownerId: null,
+┊   ┊337┊    messages: [],
+┊   ┊338┊  },
+┊   ┊339┊  {
+┊   ┊340┊    id: 8,
+┊   ┊341┊    createdAt: moment().subtract(3, 'weeks').toDate(),
+┊   ┊342┊    name: 'A user 0 group',
+┊   ┊343┊    picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
+┊   ┊344┊    allTimeMemberIds: [1, 3, 4, 6],
+┊   ┊345┊    listingMemberIds: [1, 3, 4, 6],
+┊   ┊346┊    actualGroupMemberIds: [1, 4, 6],
+┊   ┊347┊    adminIds: [1, 6],
+┊   ┊348┊    ownerId: 1,
+┊   ┊349┊    messages: [
+┊   ┊350┊      {
+┊   ┊351┊        id: 1,
+┊   ┊352┊        chatId: 8,
+┊   ┊353┊        senderId: 1,
+┊   ┊354┊        content: 'I made a group',
+┊   ┊355┊        createdAt: moment().subtract(2, 'weeks').toDate(),
+┊   ┊356┊        type: MessageType.TEXT,
+┊   ┊357┊        recipients: [
+┊   ┊358┊          {
+┊   ┊359┊            userId: 3,
+┊   ┊360┊            messageId: 1,
+┊   ┊361┊            chatId: 8,
+┊   ┊362┊            receivedAt: null,
+┊   ┊363┊            readAt: null,
+┊   ┊364┊          },
+┊   ┊365┊          {
+┊   ┊366┊            userId: 4,
+┊   ┊367┊            messageId: 1,
+┊   ┊368┊            chatId: 8,
+┊   ┊369┊            receivedAt: moment().subtract(2, 'weeks').add(1, 'minutes').toDate(),
+┊   ┊370┊            readAt: moment().subtract(2, 'weeks').add(5, 'minutes').toDate(),
+┊   ┊371┊          },
+┊   ┊372┊          {
+┊   ┊373┊            userId: 6,
+┊   ┊374┊            messageId: 1,
+┊   ┊375┊            chatId: 8,
+┊   ┊376┊            receivedAt: null,
+┊   ┊377┊            readAt: null,
+┊   ┊378┊          },
+┊   ┊379┊        ],
+┊   ┊380┊        holderIds: [1, 3, 4, 6],
+┊   ┊381┊      },
+┊   ┊382┊      {
+┊   ┊383┊        id: 2,
+┊   ┊384┊        chatId: 8,
+┊   ┊385┊        senderId: 1,
+┊   ┊386┊        content: 'Ops, user 3 was not supposed to be here',
+┊   ┊387┊        createdAt: moment().subtract(2, 'weeks').add(2, 'minutes').toDate(),
+┊   ┊388┊        type: MessageType.TEXT,
+┊   ┊389┊        recipients: [
+┊   ┊390┊          {
+┊   ┊391┊            userId: 4,
+┊   ┊392┊            messageId: 2,
+┊   ┊393┊            chatId: 8,
+┊   ┊394┊            receivedAt: moment().subtract(2, 'weeks').add(3, 'minutes').toDate(),
+┊   ┊395┊            readAt: moment().subtract(2, 'weeks').add(5, 'minutes').toDate(),
+┊   ┊396┊          },
+┊   ┊397┊          {
+┊   ┊398┊            userId: 6,
+┊   ┊399┊            messageId: 2,
+┊   ┊400┊            chatId: 8,
+┊   ┊401┊            receivedAt: null,
+┊   ┊402┊            readAt: null,
+┊   ┊403┊          },
+┊   ┊404┊        ],
+┊   ┊405┊        holderIds: [1, 4, 6],
+┊   ┊406┊      },
+┊   ┊407┊      {
+┊   ┊408┊        id: 3,
+┊   ┊409┊        chatId: 8,
+┊   ┊410┊        senderId: 4,
+┊   ┊411┊        content: 'Awesome!',
+┊   ┊412┊        createdAt: moment().subtract(2, 'weeks').add(10, 'minutes').toDate(),
+┊   ┊413┊        type: MessageType.TEXT,
+┊   ┊414┊        recipients: [
+┊   ┊415┊          {
+┊   ┊416┊            userId: 1,
+┊   ┊417┊            messageId: 3,
+┊   ┊418┊            chatId: 8,
+┊   ┊419┊            receivedAt: null,
+┊   ┊420┊            readAt: null,
+┊   ┊421┊          },
+┊   ┊422┊          {
+┊   ┊423┊            userId: 6,
+┊   ┊424┊            messageId: 3,
+┊   ┊425┊            chatId: 8,
+┊   ┊426┊            receivedAt: null,
+┊   ┊427┊            readAt: null,
+┊   ┊428┊          },
+┊   ┊429┊        ],
+┊   ┊430┊        holderIds: [1, 4, 6],
+┊   ┊431┊      },
+┊   ┊432┊    ],
+┊   ┊433┊  },
+┊   ┊434┊  {
+┊   ┊435┊    id: 9,
+┊   ┊436┊    createdAt: moment().subtract(2, 'weeks').toDate(),
+┊   ┊437┊    name: 'A user 5 group',
+┊   ┊438┊    picture: null,
+┊   ┊439┊    allTimeMemberIds: [6, 3],
+┊   ┊440┊    listingMemberIds: [6, 3],
+┊   ┊441┊    actualGroupMemberIds: [6, 3],
+┊   ┊442┊    adminIds: [6],
+┊   ┊443┊    ownerId: 6,
+┊   ┊444┊    messages: [],
+┊   ┊445┊  },
+┊   ┊446┊];
+┊   ┊447┊
+┊   ┊448┊export const db = {users, chats};
```

[}]: #

Its' time to create our schema and our resolvers:

[{]: <helper> (diffStep "1.3")

#### Step 1.3: Add resolvers and schema

##### Changed package.json
```diff
@@ -12,6 +12,7 @@
 ┊12┊12┊    "@types/cors": "^2.8.4",
 ┊13┊13┊    "@types/express": "^4.16.1",
 ┊14┊14┊    "@types/graphql": "^14.0.7",
+┊  ┊15┊    "@types/graphql-iso-date": "^3.3.1",
 ┊15┊16┊    "@types/node": "^11.9.4",
 ┊16┊17┊    "nodemon": "^1.18.10",
 ┊17┊18┊    "ts-node": "^8.0.2",
```
```diff
@@ -23,6 +24,7 @@
 ┊23┊24┊    "cors": "^2.8.5",
 ┊24┊25┊    "express": "^4.16.4",
 ┊25┊26┊    "graphql": "^14.1.1",
+┊  ┊27┊    "graphql-iso-date": "^3.6.1",
 ┊26┊28┊    "moment": "^2.24.0"
 ┊27┊29┊  }
 ┊28┊30┊}
```

##### Changed schema&#x2F;resolvers.ts
```diff
@@ -1,5 +1,65 @@
 ┊ 1┊ 1┊import { IResolvers } from 'apollo-server-express';
+┊  ┊ 2┊import { GraphQLDateTime } from 'graphql-iso-date';
+┊  ┊ 3┊import { ChatDb, db, MessageDb, RecipientDb, UserDb } from "../db";
+┊  ┊ 4┊
+┊  ┊ 5┊let users = db.users;
+┊  ┊ 6┊let chats = db.chats;
+┊  ┊ 7┊const currentUser = users[0];
 ┊ 2┊ 8┊
 ┊ 3┊ 9┊export const resolvers: IResolvers = {
-┊ 4┊  ┊  Query: {},
+┊  ┊10┊  Date: GraphQLDateTime,
+┊  ┊11┊  Query: {
+┊  ┊12┊    me: (): UserDb => currentUser,
+┊  ┊13┊    users: (): UserDb[] => users.filter(user => user.id !== currentUser.id),
+┊  ┊14┊    chats: (): ChatDb[] => chats.filter(chat => chat.listingMemberIds.includes(currentUser.id)),
+┊  ┊15┊    chat: (obj: any, {chatId}): ChatDb | null => chats.find(chat => chat.id === chatId) || null,
+┊  ┊16┊  },
+┊  ┊17┊  Chat: {
+┊  ┊18┊    name: (chat: ChatDb): string => chat.name ? chat.name : users
+┊  ┊19┊      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser.id))!.name,
+┊  ┊20┊    picture: (chat: ChatDb) => chat.name ? chat.picture : users
+┊  ┊21┊      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser.id))!.picture,
+┊  ┊22┊    allTimeMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.allTimeMemberIds.includes(user.id)),
+┊  ┊23┊    listingMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.listingMemberIds.includes(user.id)),
+┊  ┊24┊    actualGroupMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)),
+┊  ┊25┊    admins: (chat: ChatDb): UserDb[] => users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
+┊  ┊26┊    owner: (chat: ChatDb): UserDb | null => users.find(user => chat.ownerId === user.id) || null,
+┊  ┊27┊    isGroup: (chat: ChatDb): boolean => !!chat.name,
+┊  ┊28┊    messages: (chat: ChatDb, {amount = 0}: {amount: number}): MessageDb[] => {
+┊  ┊29┊      const messages = chat.messages
+┊  ┊30┊      .filter(message => message.holderIds.includes(currentUser.id))
+┊  ┊31┊      .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf()) || <MessageDb[]>[];
+┊  ┊32┊      return (amount ? messages.slice(0, amount) : messages).reverse();
+┊  ┊33┊    },
+┊  ┊34┊    lastMessage: (chat: ChatDb): MessageDb => {
+┊  ┊35┊      return chat.messages
+┊  ┊36┊        .filter(message => message.holderIds.includes(currentUser.id))
+┊  ┊37┊        .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())[0] || null;
+┊  ┊38┊    },
+┊  ┊39┊    updatedAt: (chat: ChatDb): Date => {
+┊  ┊40┊      const lastMessage = chat.messages
+┊  ┊41┊        .filter(message => message.holderIds.includes(currentUser.id))
+┊  ┊42┊        .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())[0];
+┊  ┊43┊
+┊  ┊44┊      return lastMessage ? lastMessage.createdAt : chat.createdAt;
+┊  ┊45┊    },
+┊  ┊46┊    unreadMessages: (chat: ChatDb): number => chat.messages
+┊  ┊47┊      .filter(message => message.holderIds.includes(currentUser.id) &&
+┊  ┊48┊        message.recipients.find(recipient => recipient.userId === currentUser.id && !recipient.readAt))
+┊  ┊49┊      .length,
+┊  ┊50┊  },
+┊  ┊51┊  Message: {
+┊  ┊52┊    chat: (message: MessageDb): ChatDb | null => chats.find(chat => message.chatId === chat.id) || null,
+┊  ┊53┊    sender: (message: MessageDb): UserDb | null => users.find(user => user.id === message.senderId) || null,
+┊  ┊54┊    holders: (message: MessageDb): UserDb[] => users.filter(user => message.holderIds.includes(user.id)),
+┊  ┊55┊    ownership: (message: MessageDb): boolean => message.senderId === currentUser.id,
+┊  ┊56┊  },
+┊  ┊57┊  Recipient: {
+┊  ┊58┊    user: (recipient: RecipientDb): UserDb | null => users.find(user => recipient.userId === user.id) || null,
+┊  ┊59┊    message: (recipient: RecipientDb): MessageDb | null => {
+┊  ┊60┊      const chat = chats.find(chat => recipient.chatId === chat.id);
+┊  ┊61┊      return chat ? chat.messages.find(message => recipient.messageId === message.id) || null : null;
+┊  ┊62┊    },
+┊  ┊63┊    chat: (recipient: RecipientDb): ChatDb | null => chats.find(chat => recipient.chatId === chat.id) || null,
+┊  ┊64┊  },
 ┊ 5┊65┊};
```

##### Changed schema&#x2F;typeDefs.ts
```diff
@@ -1,2 +1,76 @@
 ┊ 1┊ 1┊export default `
+┊  ┊ 2┊  scalar Date
+┊  ┊ 3┊
+┊  ┊ 4┊  type Query {
+┊  ┊ 5┊    me: User
+┊  ┊ 6┊    users: [User!]
+┊  ┊ 7┊    chats: [Chat!]!
+┊  ┊ 8┊    chat(chatId: ID!): Chat
+┊  ┊ 9┊  }
+┊  ┊10┊
+┊  ┊11┊  enum MessageType {
+┊  ┊12┊    LOCATION
+┊  ┊13┊    TEXT
+┊  ┊14┊    PICTURE
+┊  ┊15┊  }
+┊  ┊16┊
+┊  ┊17┊  type Chat {
+┊  ┊18┊    #May be a chat or a group
+┊  ┊19┊    id: ID!
+┊  ┊20┊    createdAt: Date!
+┊  ┊21┊    #Computed for chats
+┊  ┊22┊    name: String
+┊  ┊23┊    #Computed for chats
+┊  ┊24┊    picture: String
+┊  ┊25┊    #All members, current and past ones. Includes users who still didn't get the chat listed.
+┊  ┊26┊    allTimeMembers: [User!]!
+┊  ┊27┊    #Whoever gets the chat listed. For groups includes past members who still didn't delete the group. For chats they are the only ones who can send messages.
+┊  ┊28┊    listingMembers: [User!]!
+┊  ┊29┊    #Actual members of the group. Null for chats. For groups they are the only ones who can send messages. They aren't the only ones who get the group listed.
+┊  ┊30┊    actualGroupMembers: [User!]
+┊  ┊31┊    #Null for chats
+┊  ┊32┊    admins: [User!]
+┊  ┊33┊    #If null the group is read-only. Null for chats.
+┊  ┊34┊    owner: User
+┊  ┊35┊    #Computed property
+┊  ┊36┊    isGroup: Boolean!
+┊  ┊37┊    messages(amount: Int): [Message]!
+┊  ┊38┊    #Computed property
+┊  ┊39┊    lastMessage: Message
+┊  ┊40┊    #Computed property
+┊  ┊41┊    updatedAt: Date!
+┊  ┊42┊    #Computed property
+┊  ┊43┊    unreadMessages: Int!
+┊  ┊44┊  }
+┊  ┊45┊
+┊  ┊46┊  type Message {
+┊  ┊47┊    id: ID!
+┊  ┊48┊    sender: User!
+┊  ┊49┊    chat: Chat!
+┊  ┊50┊    content: String!
+┊  ┊51┊    createdAt: Date!
+┊  ┊52┊    #FIXME: should return MessageType
+┊  ┊53┊    type: Int!
+┊  ┊54┊    #Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise
+┊  ┊55┊    holders: [User!]!
+┊  ┊56┊    #Computed property
+┊  ┊57┊    ownership: Boolean!
+┊  ┊58┊    #Whoever received the message
+┊  ┊59┊    recipients: [Recipient!]!
+┊  ┊60┊  }
+┊  ┊61┊
+┊  ┊62┊  type Recipient {
+┊  ┊63┊    user: User!
+┊  ┊64┊    message: Message!
+┊  ┊65┊    chat: Chat!
+┊  ┊66┊    receivedAt: Date
+┊  ┊67┊    readAt: Date
+┊  ┊68┊  }
+┊  ┊69┊
+┊  ┊70┊  type User {
+┊  ┊71┊    id: ID!
+┊  ┊72┊    name: String
+┊  ┊73┊    picture: String
+┊  ┊74┊    phone: String
+┊  ┊75┊  }
 ┊ 2┊76┊`;
```

##### Changed yarn.lock
```diff
@@ -118,7 +118,14 @@
 ┊118┊118┊    "@types/express-serve-static-core" "*"
 ┊119┊119┊    "@types/serve-static" "*"
 ┊120┊120┊
-┊121┊   ┊"@types/graphql@^14.0.7":
+┊   ┊121┊"@types/graphql-iso-date@^3.3.1":
+┊   ┊122┊  version "3.3.1"
+┊   ┊123┊  resolved "https://registry.yarnpkg.com/@types/graphql-iso-date/-/graphql-iso-date-3.3.1.tgz#dbb540ae62c68c00eba1d1feb4602d7209257e9d"
+┊   ┊124┊  integrity sha512-x64IejUTqiiC2NGMgMYVOsKgViKknfnhzJHS8pMiYdDqbR5Fd9XHAkujGYvAOBkjFB6TDunY6S8uLDT/OnrKBA==
+┊   ┊125┊  dependencies:
+┊   ┊126┊    "@types/graphql" "*"
+┊   ┊127┊
+┊   ┊128┊"@types/graphql@*", "@types/graphql@^14.0.7":
 ┊122┊129┊  version "14.0.7"
 ┊123┊130┊  resolved "https://registry.yarnpkg.com/@types/graphql/-/graphql-14.0.7.tgz#daa09397220a68ce1cbb3f76a315ff3cd92312f6"
 ┊124┊131┊  integrity sha512-BoLDjdvLQsXPZLJux3lEZANwGr3Xag56Ngy0U3y8uoRSDdeLcn43H3oBcgZlnd++iOQElBpaRVDHPzEDekyvXQ==
```
```diff
@@ -1117,6 +1124,11 @@
 ┊1117┊1124┊  dependencies:
 ┊1118┊1125┊    "@apollographql/apollo-tools" "^0.3.3"
 ┊1119┊1126┊
+┊    ┊1127┊graphql-iso-date@^3.6.1:
+┊    ┊1128┊  version "3.6.1"
+┊    ┊1129┊  resolved "https://registry.yarnpkg.com/graphql-iso-date/-/graphql-iso-date-3.6.1.tgz#bd2d0dc886e0f954cbbbc496bbf1d480b57ffa96"
+┊    ┊1130┊  integrity sha512-AwFGIuYMJQXOEAgRlJlFL4H1ncFM8n8XmoVDTNypNOZyQ8LFDG2ppMFlsS862BSTCDcSUfHp8PD3/uJhv7t59Q==
+┊    ┊1131┊
 ┊1120┊1132┊graphql-subscriptions@^1.0.0:
 ┊1121┊1133┊  version "1.0.0"
 ┊1122┊1134┊  resolved "https://registry.yarnpkg.com/graphql-subscriptions/-/graphql-subscriptions-1.0.0.tgz#475267694b3bd465af6477dbab4263a3f62702b8"
```

[}]: #

# Chapter 6

First, let's install `graphql-code-generator`  in our server and add it to the run scripts:

    $ npm install graphql-code-generator

[{]: <helper> (diffStep "2.1")

#### Step 2.1: Install graphql-code-generator

##### Added codegen.yml
```diff
@@ -0,0 +1,18 @@
+┊  ┊ 1┊overwrite: true
+┊  ┊ 2┊schema: "./schema/typeDefs.ts"
+┊  ┊ 3┊documents: null
+┊  ┊ 4┊require:
+┊  ┊ 5┊  - ts-node/register
+┊  ┊ 6┊generates:
+┊  ┊ 7┊  ./types.d.ts:
+┊  ┊ 8┊    config:
+┊  ┊ 9┊      optionalType: undefined | null
+┊  ┊10┊      mappers:
+┊  ┊11┊        Chat: ./db#ChatDb
+┊  ┊12┊        Message: ./db#MessageDb
+┊  ┊13┊        Recipient: ./db#RecipientDb
+┊  ┊14┊        User: ./db#UserDb
+┊  ┊15┊    plugins:
+┊  ┊16┊      - "typescript-common"
+┊  ┊17┊      - "typescript-server"
+┊  ┊18┊      - "typescript-resolvers"
```

##### Changed package.json
```diff
@@ -4,8 +4,12 @@
 ┊ 4┊ 4┊  "private": true,
 ┊ 5┊ 5┊  "scripts": {
 ┊ 6┊ 6┊    "build": "tsc",
-┊ 7┊  ┊    "start": "ts-node index.ts",
-┊ 8┊  ┊    "dev": "nodemon --exec yarn start:server -e ts"
+┊  ┊ 7┊    "generate": "gql-gen",
+┊  ┊ 8┊    "generate:watch": "nodemon --exec yarn generate -e graphql",
+┊  ┊ 9┊    "start:server": "ts-node index.ts",
+┊  ┊10┊    "start:server:watch": "nodemon --exec yarn start:server -e ts",
+┊  ┊11┊    "dev": "concurrently \"yarn generate:watch\" \"yarn start:server:watch\"",
+┊  ┊12┊    "start": "yarn generate && yarn start:server"
 ┊ 9┊13┊  },
 ┊10┊14┊  "devDependencies": {
 ┊11┊15┊    "@types/body-parser": "^1.17.0",
```
```diff
@@ -14,6 +18,10 @@
 ┊14┊18┊    "@types/graphql": "^14.0.7",
 ┊15┊19┊    "@types/graphql-iso-date": "^3.3.1",
 ┊16┊20┊    "@types/node": "^11.9.4",
+┊  ┊21┊    "concurrently": "^4.1.0",
+┊  ┊22┊    "graphql-codegen-typescript-common": "^0.16.1",
+┊  ┊23┊    "graphql-codegen-typescript-resolvers": "^0.16.1",
+┊  ┊24┊    "graphql-codegen-typescript-server": "^0.16.1",
 ┊17┊25┊    "nodemon": "^1.18.10",
 ┊18┊26┊    "ts-node": "^8.0.2",
 ┊19┊27┊    "typescript": "^3.3.3"
```
```diff
@@ -24,6 +32,7 @@
 ┊24┊32┊    "cors": "^2.8.5",
 ┊25┊33┊    "express": "^4.16.4",
 ┊26┊34┊    "graphql": "^14.1.1",
+┊  ┊35┊    "graphql-code-generator": "^0.16.1",
 ┊27┊36┊    "graphql-iso-date": "^3.6.1",
 ┊28┊37┊    "moment": "^2.24.0"
 ┊29┊38┊  }
```

##### Changed yarn.lock
```diff
@@ -14,6 +14,94 @@
 ┊ 14┊ 14┊  resolved "https://registry.yarnpkg.com/@apollographql/graphql-playground-html/-/graphql-playground-html-1.6.6.tgz#022209e28a2b547dcde15b219f0c50f47aa5beb3"
 ┊ 15┊ 15┊  integrity sha512-lqK94b+caNtmKFs5oUVXlSpN3sm5IXZ+KfhMxOtr0LR2SqErzkoJilitjDvJ1WbjHlxLI7WtCjRmOLdOGJqtMQ==
 ┊ 16┊ 16┊
+┊   ┊ 17┊"@babel/code-frame@^7.0.0":
+┊   ┊ 18┊  version "7.0.0"
+┊   ┊ 19┊  resolved "https://registry.yarnpkg.com/@babel/code-frame/-/code-frame-7.0.0.tgz#06e2ab19bdb535385559aabb5ba59729482800f8"
+┊   ┊ 20┊  integrity sha512-OfC2uemaknXr87bdLUkWog7nYuliM9Ij5HUcajsVcMCpQrcLmtxRbVFTIqmcSkSeYRBFBRxs2FiUqFJDLdiebA==
+┊   ┊ 21┊  dependencies:
+┊   ┊ 22┊    "@babel/highlight" "^7.0.0"
+┊   ┊ 23┊
+┊   ┊ 24┊"@babel/generator@^7.2.2":
+┊   ┊ 25┊  version "7.3.3"
+┊   ┊ 26┊  resolved "https://registry.yarnpkg.com/@babel/generator/-/generator-7.3.3.tgz#185962ade59a52e00ca2bdfcfd1d58e528d4e39e"
+┊   ┊ 27┊  integrity sha512-aEADYwRRZjJyMnKN7llGIlircxTCofm3dtV5pmY6ob18MSIuipHpA2yZWkPlycwu5HJcx/pADS3zssd8eY7/6A==
+┊   ┊ 28┊  dependencies:
+┊   ┊ 29┊    "@babel/types" "^7.3.3"
+┊   ┊ 30┊    jsesc "^2.5.1"
+┊   ┊ 31┊    lodash "^4.17.11"
+┊   ┊ 32┊    source-map "^0.5.0"
+┊   ┊ 33┊    trim-right "^1.0.1"
+┊   ┊ 34┊
+┊   ┊ 35┊"@babel/helper-function-name@^7.1.0":
+┊   ┊ 36┊  version "7.1.0"
+┊   ┊ 37┊  resolved "https://registry.yarnpkg.com/@babel/helper-function-name/-/helper-function-name-7.1.0.tgz#a0ceb01685f73355d4360c1247f582bfafc8ff53"
+┊   ┊ 38┊  integrity sha512-A95XEoCpb3TO+KZzJ4S/5uW5fNe26DjBGqf1o9ucyLyCmi1dXq/B3c8iaWTfBk3VvetUxl16e8tIrd5teOCfGw==
+┊   ┊ 39┊  dependencies:
+┊   ┊ 40┊    "@babel/helper-get-function-arity" "^7.0.0"
+┊   ┊ 41┊    "@babel/template" "^7.1.0"
+┊   ┊ 42┊    "@babel/types" "^7.0.0"
+┊   ┊ 43┊
+┊   ┊ 44┊"@babel/helper-get-function-arity@^7.0.0":
+┊   ┊ 45┊  version "7.0.0"
+┊   ┊ 46┊  resolved "https://registry.yarnpkg.com/@babel/helper-get-function-arity/-/helper-get-function-arity-7.0.0.tgz#83572d4320e2a4657263734113c42868b64e49c3"
+┊   ┊ 47┊  integrity sha512-r2DbJeg4svYvt3HOS74U4eWKsUAMRH01Z1ds1zx8KNTPtpTL5JAsdFv8BNyOpVqdFhHkkRDIg5B4AsxmkjAlmQ==
+┊   ┊ 48┊  dependencies:
+┊   ┊ 49┊    "@babel/types" "^7.0.0"
+┊   ┊ 50┊
+┊   ┊ 51┊"@babel/helper-split-export-declaration@^7.0.0":
+┊   ┊ 52┊  version "7.0.0"
+┊   ┊ 53┊  resolved "https://registry.yarnpkg.com/@babel/helper-split-export-declaration/-/helper-split-export-declaration-7.0.0.tgz#3aae285c0311c2ab095d997b8c9a94cad547d813"
+┊   ┊ 54┊  integrity sha512-MXkOJqva62dfC0w85mEf/LucPPS/1+04nmmRMPEBUB++hiiThQ2zPtX/mEWQ3mtzCEjIJvPY8nuwxXtQeQwUag==
+┊   ┊ 55┊  dependencies:
+┊   ┊ 56┊    "@babel/types" "^7.0.0"
+┊   ┊ 57┊
+┊   ┊ 58┊"@babel/highlight@^7.0.0":
+┊   ┊ 59┊  version "7.0.0"
+┊   ┊ 60┊  resolved "https://registry.yarnpkg.com/@babel/highlight/-/highlight-7.0.0.tgz#f710c38c8d458e6dd9a201afb637fcb781ce99e4"
+┊   ┊ 61┊  integrity sha512-UFMC4ZeFC48Tpvj7C8UgLvtkaUuovQX+5xNWrsIoMG8o2z+XFKjKaN9iVmS84dPwVN00W4wPmqvYoZF3EGAsfw==
+┊   ┊ 62┊  dependencies:
+┊   ┊ 63┊    chalk "^2.0.0"
+┊   ┊ 64┊    esutils "^2.0.2"
+┊   ┊ 65┊    js-tokens "^4.0.0"
+┊   ┊ 66┊
+┊   ┊ 67┊"@babel/parser@^7.2.0", "@babel/parser@^7.2.2", "@babel/parser@^7.2.3":
+┊   ┊ 68┊  version "7.3.3"
+┊   ┊ 69┊  resolved "https://registry.yarnpkg.com/@babel/parser/-/parser-7.3.3.tgz#092d450db02bdb6ccb1ca8ffd47d8774a91aef87"
+┊   ┊ 70┊  integrity sha512-xsH1CJoln2r74hR+y7cg2B5JCPaTh+Hd+EbBRk9nWGSNspuo6krjhX0Om6RnRQuIvFq8wVXCLKH3kwKDYhanSg==
+┊   ┊ 71┊
+┊   ┊ 72┊"@babel/template@^7.1.0":
+┊   ┊ 73┊  version "7.2.2"
+┊   ┊ 74┊  resolved "https://registry.yarnpkg.com/@babel/template/-/template-7.2.2.tgz#005b3fdf0ed96e88041330379e0da9a708eb2907"
+┊   ┊ 75┊  integrity sha512-zRL0IMM02AUDwghf5LMSSDEz7sBCO2YnNmpg3uWTZj/v1rcG2BmQUvaGU8GhU8BvfMh1k2KIAYZ7Ji9KXPUg7g==
+┊   ┊ 76┊  dependencies:
+┊   ┊ 77┊    "@babel/code-frame" "^7.0.0"
+┊   ┊ 78┊    "@babel/parser" "^7.2.2"
+┊   ┊ 79┊    "@babel/types" "^7.2.2"
+┊   ┊ 80┊
+┊   ┊ 81┊"@babel/traverse@^7.1.6":
+┊   ┊ 82┊  version "7.2.3"
+┊   ┊ 83┊  resolved "https://registry.yarnpkg.com/@babel/traverse/-/traverse-7.2.3.tgz#7ff50cefa9c7c0bd2d81231fdac122f3957748d8"
+┊   ┊ 84┊  integrity sha512-Z31oUD/fJvEWVR0lNZtfgvVt512ForCTNKYcJBGbPb1QZfve4WGH8Wsy7+Mev33/45fhP/hwQtvgusNdcCMgSw==
+┊   ┊ 85┊  dependencies:
+┊   ┊ 86┊    "@babel/code-frame" "^7.0.0"
+┊   ┊ 87┊    "@babel/generator" "^7.2.2"
+┊   ┊ 88┊    "@babel/helper-function-name" "^7.1.0"
+┊   ┊ 89┊    "@babel/helper-split-export-declaration" "^7.0.0"
+┊   ┊ 90┊    "@babel/parser" "^7.2.3"
+┊   ┊ 91┊    "@babel/types" "^7.2.2"
+┊   ┊ 92┊    debug "^4.1.0"
+┊   ┊ 93┊    globals "^11.1.0"
+┊   ┊ 94┊    lodash "^4.17.10"
+┊   ┊ 95┊
+┊   ┊ 96┊"@babel/types@^7.0.0", "@babel/types@^7.2.0", "@babel/types@^7.2.2", "@babel/types@^7.3.3":
+┊   ┊ 97┊  version "7.3.3"
+┊   ┊ 98┊  resolved "https://registry.yarnpkg.com/@babel/types/-/types-7.3.3.tgz#6c44d1cdac2a7625b624216657d5bc6c107ab436"
+┊   ┊ 99┊  integrity sha512-2tACZ80Wg09UnPg5uGAOUvvInaqLk3l/IAhQzlxLQOIXacr6bMsra5SH6AWw/hIDRCSbCdHP2KzSOD+cT7TzMQ==
+┊   ┊100┊  dependencies:
+┊   ┊101┊    esutils "^2.0.2"
+┊   ┊102┊    lodash "^4.17.11"
+┊   ┊103┊    to-fast-properties "^2.0.0"
+┊   ┊104┊
 ┊ 17┊105┊"@protobufjs/aspromise@^1.1.1", "@protobufjs/aspromise@^1.1.2":
 ┊ 18┊106┊  version "1.1.2"
 ┊ 19┊107┊  resolved "https://registry.yarnpkg.com/@protobufjs/aspromise/-/aspromise-1.1.2.tgz#9b8b0cc663d669a7d8f6f5d0893a14d348f30fbf"
```
```diff
@@ -67,6 +155,13 @@
 ┊ 67┊155┊  resolved "https://registry.yarnpkg.com/@protobufjs/utf8/-/utf8-1.1.0.tgz#a777360b5b39a1a2e5106f8e858f2fd2d060c570"
 ┊ 68┊156┊  integrity sha1-p3c2C1s5oaLlEG+OhY8v0tBgxXA=
 ┊ 69┊157┊
+┊   ┊158┊"@samverschueren/stream-to-observable@^0.3.0":
+┊   ┊159┊  version "0.3.0"
+┊   ┊160┊  resolved "https://registry.yarnpkg.com/@samverschueren/stream-to-observable/-/stream-to-observable-0.3.0.tgz#ecdf48d532c58ea477acfcab80348424f8d0662f"
+┊   ┊161┊  integrity sha512-MI4Xx6LHs4Webyvi6EbspgyAb4D2Q2VtnCQ1blOJcoLS6mVa8lNN2rkIy1CVxfTUpoyIbCTkXES1rLXztFD1lg==
+┊   ┊162┊  dependencies:
+┊   ┊163┊    any-observable "^0.3.0"
+┊   ┊164┊
 ┊ 70┊165┊"@types/accepts@^1.3.5":
 ┊ 71┊166┊  version "1.3.5"
 ┊ 72┊167┊  resolved "https://registry.yarnpkg.com/@types/accepts/-/accepts-1.3.5.tgz#c34bec115cfc746e04fe5a059df4ce7e7b391575"
```
```diff
@@ -74,6 +169,18 @@
 ┊ 74┊169┊  dependencies:
 ┊ 75┊170┊    "@types/node" "*"
 ┊ 76┊171┊
+┊   ┊172┊"@types/babel-types@*":
+┊   ┊173┊  version "7.0.5"
+┊   ┊174┊  resolved "https://registry.yarnpkg.com/@types/babel-types/-/babel-types-7.0.5.tgz#26f5bba8c58acd9b84d1a9135fb2789a1c191bc1"
+┊   ┊175┊  integrity sha512-0t0R7fKAXT/P++S98djRkXbL9Sxd9NNtfNg3BNw2EQOjVIkiMBdmO55N2Tp3wGK3mylmM7Vck9h5tEoSuSUabA==
+┊   ┊176┊
+┊   ┊177┊"@types/babylon@6.16.4":
+┊   ┊178┊  version "6.16.4"
+┊   ┊179┊  resolved "https://registry.yarnpkg.com/@types/babylon/-/babylon-6.16.4.tgz#d3df72518b34a6a015d0dc58745cd238b5bb8ad2"
+┊   ┊180┊  integrity sha512-8dZMcGPno3g7pJ/d0AyJERo+lXh9i1JhDuCUs+4lNIN9eUe5Yh6UCLrpgSEi05Ve2JMLauL2aozdvKwNL0px1Q==
+┊   ┊181┊  dependencies:
+┊   ┊182┊    "@types/babel-types" "*"
+┊   ┊183┊
 ┊ 77┊184┊"@types/body-parser@*", "@types/body-parser@1.17.0", "@types/body-parser@^1.17.0":
 ┊ 78┊185┊  version "1.17.0"
 ┊ 79┊186┊  resolved "https://registry.yarnpkg.com/@types/body-parser/-/body-parser-1.17.0.tgz#9f5c9d9bd04bb54be32d5eb9fc0d8c974e6cf58c"
```
```diff
@@ -130,6 +237,11 @@
 ┊130┊237┊  resolved "https://registry.yarnpkg.com/@types/graphql/-/graphql-14.0.7.tgz#daa09397220a68ce1cbb3f76a315ff3cd92312f6"
 ┊131┊238┊  integrity sha512-BoLDjdvLQsXPZLJux3lEZANwGr3Xag56Ngy0U3y8uoRSDdeLcn43H3oBcgZlnd++iOQElBpaRVDHPzEDekyvXQ==
 ┊132┊239┊
+┊   ┊240┊"@types/is-glob@4.0.0":
+┊   ┊241┊  version "4.0.0"
+┊   ┊242┊  resolved "https://registry.yarnpkg.com/@types/is-glob/-/is-glob-4.0.0.tgz#fb8a2bff539025d4dcd6d5efe7689e03341b876d"
+┊   ┊243┊  integrity sha512-zC/2EmD8scdsGIeE+Xg7kP7oi9VP90zgMQtm9Cr25av4V+a+k8slQyiT60qSw8KORYrOKlPXfHwoa1bQbRzskQ==
+┊   ┊244┊
 ┊133┊245┊"@types/long@^4.0.0":
 ┊134┊246┊  version "4.0.0"
 ┊135┊247┊  resolved "https://registry.yarnpkg.com/@types/long/-/long-4.0.0.tgz#719551d2352d301ac8b81db732acb6bdc28dbdef"
```
```diff
@@ -150,6 +262,11 @@
 ┊150┊262┊  resolved "https://registry.yarnpkg.com/@types/node/-/node-10.12.26.tgz#2dec19f1f7981c95cb54bab8f618ecb5dc983d0e"
 ┊151┊263┊  integrity sha512-nMRqS+mL1TOnIJrL6LKJcNZPB8V3eTfRo9FQA2b5gDvrHurC8XbSA86KNe0dShlEL7ReWJv/OU9NL7Z0dnqWTg==
 ┊152┊264┊
+┊   ┊265┊"@types/prettier@1.15.2":
+┊   ┊266┊  version "1.15.2"
+┊   ┊267┊  resolved "https://registry.yarnpkg.com/@types/prettier/-/prettier-1.15.2.tgz#91594ea7cb6f3b1f7ea69f32621246654c7cc231"
+┊   ┊268┊  integrity sha512-XIB0ZCaFZmWUHAa9dBqP5UKXXHwuukmVlP+XcyU94dui2k+l2lG+CHAbt2ffenHPUqoIs5Beh8Pdf2YEq/CZ7A==
+┊   ┊269┊
 ┊153┊270┊"@types/range-parser@*":
 ┊154┊271┊  version "1.2.3"
 ┊155┊272┊  resolved "https://registry.yarnpkg.com/@types/range-parser/-/range-parser-1.2.3.tgz#7ee330ba7caafb98090bece86a5ee44115904c2c"
```
```diff
@@ -163,6 +280,11 @@
 ┊163┊280┊    "@types/express-serve-static-core" "*"
 ┊164┊281┊    "@types/mime" "*"
 ┊165┊282┊
+┊   ┊283┊"@types/valid-url@1.0.2":
+┊   ┊284┊  version "1.0.2"
+┊   ┊285┊  resolved "https://registry.yarnpkg.com/@types/valid-url/-/valid-url-1.0.2.tgz#60fa435ce24bfd5ba107b8d2a80796aeaf3a8f45"
+┊   ┊286┊  integrity sha1-YPpDXOJL/VuhB7jSqAeWrq86j0U=
+┊   ┊287┊
 ┊166┊288┊"@types/ws@^6.0.0":
 ┊167┊289┊  version "6.0.1"
 ┊168┊290┊  resolved "https://registry.yarnpkg.com/@types/ws/-/ws-6.0.1.tgz#ca7a3f3756aa12f62a0a62145ed14c6db25d5a28"
```
```diff
@@ -184,6 +306,16 @@
 ┊184┊306┊    mime-types "~2.1.18"
 ┊185┊307┊    negotiator "0.6.1"
 ┊186┊308┊
+┊   ┊309┊ajv@^6.5.5:
+┊   ┊310┊  version "6.9.1"
+┊   ┊311┊  resolved "https://registry.yarnpkg.com/ajv/-/ajv-6.9.1.tgz#a4d3683d74abc5670e75f0b16520f70a20ea8dc1"
+┊   ┊312┊  integrity sha512-XDN92U311aINL77ieWHmqCcNlwjoP5cHXDxIxbf2MaPYuCXOHS7gHH8jktxeK5omgd52XbSTX6a4Piwd1pQmzA==
+┊   ┊313┊  dependencies:
+┊   ┊314┊    fast-deep-equal "^2.0.1"
+┊   ┊315┊    fast-json-stable-stringify "^2.0.0"
+┊   ┊316┊    json-schema-traverse "^0.4.1"
+┊   ┊317┊    uri-js "^4.2.2"
+┊   ┊318┊
 ┊187┊319┊ansi-align@^2.0.0:
 ┊188┊320┊  version "2.0.0"
 ┊189┊321┊  resolved "https://registry.yarnpkg.com/ansi-align/-/ansi-align-2.0.0.tgz#c36aeccba563b89ceb556f3690f0b1d9e3547f7f"
```
```diff
@@ -191,6 +323,11 @@
 ┊191┊323┊  dependencies:
 ┊192┊324┊    string-width "^2.0.0"
 ┊193┊325┊
+┊   ┊326┊ansi-escapes@^3.0.0, ansi-escapes@^3.2.0:
+┊   ┊327┊  version "3.2.0"
+┊   ┊328┊  resolved "https://registry.yarnpkg.com/ansi-escapes/-/ansi-escapes-3.2.0.tgz#8780b98ff9dbf5638152d1f1fe5c1d7b4442976b"
+┊   ┊329┊  integrity sha512-cBhpre4ma+U0T1oM5fXg7Dy1Jw7zzwv7lt/GoCpr+hDQJoYnKVPLL4dCvSEFMmQurOQvSrwT7SL/DAlhBI97RQ==
+┊   ┊330┊
 ┊194┊331┊ansi-regex@^2.0.0:
 ┊195┊332┊  version "2.1.1"
 ┊196┊333┊  resolved "https://registry.yarnpkg.com/ansi-regex/-/ansi-regex-2.1.1.tgz#c3b33ab5ee360d86e0e628f0468ae7ef27d654df"
```
```diff
@@ -201,6 +338,16 @@
 ┊201┊338┊  resolved "https://registry.yarnpkg.com/ansi-regex/-/ansi-regex-3.0.0.tgz#ed0317c322064f79466c02966bddb605ab37d998"
 ┊202┊339┊  integrity sha1-7QMXwyIGT3lGbAKWa922Bas32Zg=
 ┊203┊340┊
+┊   ┊341┊ansi-regex@^4.0.0:
+┊   ┊342┊  version "4.0.0"
+┊   ┊343┊  resolved "https://registry.yarnpkg.com/ansi-regex/-/ansi-regex-4.0.0.tgz#70de791edf021404c3fd615aa89118ae0432e5a9"
+┊   ┊344┊  integrity sha512-iB5Dda8t/UqpPI/IjsejXu5jOGDrzn41wJyljwPH65VCIbk6+1BzFIMJGFwTNrYXT1CrD+B4l19U7awiQ8rk7w==
+┊   ┊345┊
+┊   ┊346┊ansi-styles@^2.2.1:
+┊   ┊347┊  version "2.2.1"
+┊   ┊348┊  resolved "https://registry.yarnpkg.com/ansi-styles/-/ansi-styles-2.2.1.tgz#b432dd3358b634cf75e1e4664368240533c1ddbe"
+┊   ┊349┊  integrity sha1-tDLdM1i2NM914eRmQ2gkBTPB3b4=
+┊   ┊350┊
 ┊204┊351┊ansi-styles@^3.2.1:
 ┊205┊352┊  version "3.2.1"
 ┊206┊353┊  resolved "https://registry.yarnpkg.com/ansi-styles/-/ansi-styles-3.2.1.tgz#41fbb20243e50b12be0f04b8dedbf07520ce841d"
```
```diff
@@ -208,6 +355,11 @@
 ┊208┊355┊  dependencies:
 ┊209┊356┊    color-convert "^1.9.0"
 ┊210┊357┊
+┊   ┊358┊any-observable@^0.3.0:
+┊   ┊359┊  version "0.3.0"
+┊   ┊360┊  resolved "https://registry.yarnpkg.com/any-observable/-/any-observable-0.3.0.tgz#af933475e5806a67d0d7df090dd5e8bef65d119b"
+┊   ┊361┊  integrity sha512-/FQM1EDkTsf63Ub2C6O7GuYFDsSXUwsaZDurV0np41ocwq0jthUAYCmhBX9f+KwlaCgIuWyr/4WlUQUBfKfZog==
+┊   ┊362┊
 ┊211┊363┊anymatch@^2.0.0:
 ┊212┊364┊  version "2.0.0"
 ┊213┊365┊  resolved "https://registry.yarnpkg.com/anymatch/-/anymatch-2.0.0.tgz#bcb24b4f37934d9aa7ac17b4adaf89e7c76ef2eb"
```
```diff
@@ -376,6 +528,13 @@
 ┊376┊528┊  resolved "https://registry.yarnpkg.com/arg/-/arg-4.1.0.tgz#583c518199419e0037abb74062c37f8519e575f0"
 ┊377┊529┊  integrity sha512-ZWc51jO3qegGkVh8Hwpv636EkbesNV5ZNQPCtRa+0qytRYPEs9IYT9qITY9buezqUH5uqyzlWLcufrzU2rffdg==
 ┊378┊530┊
+┊   ┊531┊argparse@^1.0.7:
+┊   ┊532┊  version "1.0.10"
+┊   ┊533┊  resolved "https://registry.yarnpkg.com/argparse/-/argparse-1.0.10.tgz#bcd6791ea5ae09725e17e5ad988134cd40b3d911"
+┊   ┊534┊  integrity sha512-o5Roy6tNG4SL/FOkCAN6RzjiakZS25RLYFrcMttJqbdd8BWrnA+fGz57iN5Pb06pvBGvl5gQ0B48dJlslXvoTg==
+┊   ┊535┊  dependencies:
+┊   ┊536┊    sprintf-js "~1.0.2"
+┊   ┊537┊
 ┊379┊538┊arr-diff@^4.0.0:
 ┊380┊539┊  version "4.0.0"
 ┊381┊540┊  resolved "https://registry.yarnpkg.com/arr-diff/-/arr-diff-4.0.0.tgz#d6461074febfec71e7e15235761a329a5dc7c520"
```
```diff
@@ -401,12 +560,24 @@
 ┊401┊560┊  resolved "https://registry.yarnpkg.com/array-unique/-/array-unique-0.3.2.tgz#a894b75d4bc4f6cd679ef3244a9fd8f46ae2d428"
 ┊402┊561┊  integrity sha1-qJS3XUvE9s1nnvMkSp/Y9Gri1Cg=
 ┊403┊562┊
+┊   ┊563┊asn1@~0.2.3:
+┊   ┊564┊  version "0.2.4"
+┊   ┊565┊  resolved "https://registry.yarnpkg.com/asn1/-/asn1-0.2.4.tgz#8d2475dfab553bb33e77b54e59e880bb8ce23136"
+┊   ┊566┊  integrity sha512-jxwzQpLQjSmWXgwaCZE9Nz+glAG01yF1QnWgbhGwHI5A6FRIEY6IVqtHhIepHqI7/kyEyQEagBC5mBEFlIYvdg==
+┊   ┊567┊  dependencies:
+┊   ┊568┊    safer-buffer "~2.1.0"
+┊   ┊569┊
+┊   ┊570┊assert-plus@1.0.0, assert-plus@^1.0.0:
+┊   ┊571┊  version "1.0.0"
+┊   ┊572┊  resolved "https://registry.yarnpkg.com/assert-plus/-/assert-plus-1.0.0.tgz#f12e0f3c5d77b0b1cdd9146942e4e96c1e4dd525"
+┊   ┊573┊  integrity sha1-8S4PPF13sLHN2RRpQuTpbB5N1SU=
+┊   ┊574┊
 ┊404┊575┊assign-symbols@^1.0.0:
 ┊405┊576┊  version "1.0.0"
 ┊406┊577┊  resolved "https://registry.yarnpkg.com/assign-symbols/-/assign-symbols-1.0.0.tgz#59667f41fadd4f20ccbc2bb96b8d4f7f78ec0367"
 ┊407┊578┊  integrity sha1-WWZ/QfrdTyDMvCu5a41Pf3jsA2c=
 ┊408┊579┊
-┊409┊   ┊async-each@^1.0.1:
+┊   ┊580┊async-each@^1.0.0, async-each@^1.0.1:
 ┊410┊581┊  version "1.0.1"
 ┊411┊582┊  resolved "https://registry.yarnpkg.com/async-each/-/async-each-1.0.1.tgz#19d386a1d9edc6e7c1c85d388aedbcc56d33602d"
 ┊412┊583┊  integrity sha1-GdOGodntxufByF04iu28xW0zYC0=
```
```diff
@@ -423,11 +594,47 @@
 ┊423┊594┊  dependencies:
 ┊424┊595┊    retry "0.12.0"
 ┊425┊596┊
+┊   ┊597┊async@^2.6.1:
+┊   ┊598┊  version "2.6.2"
+┊   ┊599┊  resolved "https://registry.yarnpkg.com/async/-/async-2.6.2.tgz#18330ea7e6e313887f5d2f2a904bac6fe4dd5381"
+┊   ┊600┊  integrity sha512-H1qVYh1MYhEEFLsP97cVKqCGo7KfCyTt6uEWqsTBr9SO84oK9Uwbyd/yCW+6rKJLHksBNUVWZDAjfS+Ccx0Bbg==
+┊   ┊601┊  dependencies:
+┊   ┊602┊    lodash "^4.17.11"
+┊   ┊603┊
+┊   ┊604┊asynckit@^0.4.0:
+┊   ┊605┊  version "0.4.0"
+┊   ┊606┊  resolved "https://registry.yarnpkg.com/asynckit/-/asynckit-0.4.0.tgz#c79ed97f7f34cb8f2ba1bc9790bcc366474b4b79"
+┊   ┊607┊  integrity sha1-x57Zf380y48robyXkLzDZkdLS3k=
+┊   ┊608┊
 ┊426┊609┊atob@^2.1.1:
 ┊427┊610┊  version "2.1.2"
 ┊428┊611┊  resolved "https://registry.yarnpkg.com/atob/-/atob-2.1.2.tgz#6d9517eb9e030d2436666651e86bd9f6f13533c9"
 ┊429┊612┊  integrity sha512-Wm6ukoaOGJi/73p/cl2GvLjTI5JM1k/O14isD73YML8StrH/7/lRFgmg8nICZgD3bZZvjwCGxtMOD3wWNAu8cg==
 ┊430┊613┊
+┊   ┊614┊aws-sign2@~0.7.0:
+┊   ┊615┊  version "0.7.0"
+┊   ┊616┊  resolved "https://registry.yarnpkg.com/aws-sign2/-/aws-sign2-0.7.0.tgz#b46e890934a9591f2d2f6f86d7e6a9f1b3fe76a8"
+┊   ┊617┊  integrity sha1-tG6JCTSpWR8tL2+G1+ap8bP+dqg=
+┊   ┊618┊
+┊   ┊619┊aws4@^1.8.0:
+┊   ┊620┊  version "1.8.0"
+┊   ┊621┊  resolved "https://registry.yarnpkg.com/aws4/-/aws4-1.8.0.tgz#f0e003d9ca9e7f59c7a508945d7b2ef9a04a542f"
+┊   ┊622┊  integrity sha512-ReZxvNHIOv88FlT7rxcXIIC0fPt4KZqZbOlivyWtXLt8ESx84zd3kMC6iK5jVeS2qt+g7ftS7ye4fi06X5rtRQ==
+┊   ┊623┊
+┊   ┊624┊babel-types@7.0.0-beta.3:
+┊   ┊625┊  version "7.0.0-beta.3"
+┊   ┊626┊  resolved "https://registry.yarnpkg.com/babel-types/-/babel-types-7.0.0-beta.3.tgz#cd927ca70e0ae8ab05f4aab83778cfb3e6eb20b4"
+┊   ┊627┊  integrity sha512-36k8J+byAe181OmCMawGhw+DtKO7AwexPVtsPXoMfAkjtZgoCX3bEuHWfdE5sYxRM8dojvtG/+O08M0Z/YDC6w==
+┊   ┊628┊  dependencies:
+┊   ┊629┊    esutils "^2.0.2"
+┊   ┊630┊    lodash "^4.2.0"
+┊   ┊631┊    to-fast-properties "^2.0.0"
+┊   ┊632┊
+┊   ┊633┊babylon@7.0.0-beta.47:
+┊   ┊634┊  version "7.0.0-beta.47"
+┊   ┊635┊  resolved "https://registry.yarnpkg.com/babylon/-/babylon-7.0.0-beta.47.tgz#6d1fa44f0abec41ab7c780481e62fd9aafbdea80"
+┊   ┊636┊  integrity sha512-+rq2cr4GDhtToEzKFD6KZZMDBXhjFAr9JjPw9pAppZACeEWqNM294j+NdBzkSHYXwzzBmVjZ3nEVJlOhbR2gOQ==
+┊   ┊637┊
 ┊431┊638┊backo2@^1.0.2:
 ┊432┊639┊  version "1.0.2"
 ┊433┊640┊  resolved "https://registry.yarnpkg.com/backo2/-/backo2-1.0.2.tgz#31ab1ac8b129363463e35b3ebb69f4dfcfba7947"
```
```diff
@@ -451,6 +658,13 @@
 ┊451┊658┊    mixin-deep "^1.2.0"
 ┊452┊659┊    pascalcase "^0.1.1"
 ┊453┊660┊
+┊   ┊661┊bcrypt-pbkdf@^1.0.0:
+┊   ┊662┊  version "1.0.2"
+┊   ┊663┊  resolved "https://registry.yarnpkg.com/bcrypt-pbkdf/-/bcrypt-pbkdf-1.0.2.tgz#a4301d389b6a43f9b67ff3ca11a3f6637e360e9e"
+┊   ┊664┊  integrity sha1-pDAdOJtqQ/m2f/PKEaP2Y342Dp4=
+┊   ┊665┊  dependencies:
+┊   ┊666┊    tweetnacl "^0.14.3"
+┊   ┊667┊
 ┊454┊668┊binary-extensions@^1.0.0:
 ┊455┊669┊  version "1.13.0"
 ┊456┊670┊  resolved "https://registry.yarnpkg.com/binary-extensions/-/binary-extensions-1.13.0.tgz#9523e001306a32444b907423f1de2164222f6ab1"
```
```diff
@@ -493,7 +707,7 @@
 ┊493┊707┊    balanced-match "^1.0.0"
 ┊494┊708┊    concat-map "0.0.1"
 ┊495┊709┊
-┊496┊   ┊braces@^2.3.1, braces@^2.3.2:
+┊   ┊710┊braces@^2.3.0, braces@^2.3.1, braces@^2.3.2:
 ┊497┊711┊  version "2.3.2"
 ┊498┊712┊  resolved "https://registry.yarnpkg.com/braces/-/braces-2.3.2.tgz#5979fd3f14cd531565e5fa2df1abfff1dfaee729"
 ┊499┊713┊  integrity sha512-aNdbnj9P8PjdXU4ybaWLK2IF3jc/EoDYbC7AazW6to3TRsfXxscC9UXOB5iDiEQrkyIbWp2SLQda4+QAa7nc3w==
```
```diff
@@ -541,17 +755,35 @@
 ┊541┊755┊    union-value "^1.0.0"
 ┊542┊756┊    unset-value "^1.0.0"
 ┊543┊757┊
+┊   ┊758┊camel-case@^3.0.0:
+┊   ┊759┊  version "3.0.0"
+┊   ┊760┊  resolved "https://registry.yarnpkg.com/camel-case/-/camel-case-3.0.0.tgz#ca3c3688a4e9cf3a4cda777dc4dcbc713249cf73"
+┊   ┊761┊  integrity sha1-yjw2iKTpzzpM2nd9xNy8cTJJz3M=
+┊   ┊762┊  dependencies:
+┊   ┊763┊    no-case "^2.2.0"
+┊   ┊764┊    upper-case "^1.1.1"
+┊   ┊765┊
 ┊544┊766┊camelcase@^4.0.0:
 ┊545┊767┊  version "4.1.0"
 ┊546┊768┊  resolved "https://registry.yarnpkg.com/camelcase/-/camelcase-4.1.0.tgz#d545635be1e33c542649c69173e5de6acfae34dd"
 ┊547┊769┊  integrity sha1-1UVjW+HjPFQmScaRc+Xeas+uNN0=
 ┊548┊770┊
+┊   ┊771┊camelcase@^5.0.0:
+┊   ┊772┊  version "5.0.0"
+┊   ┊773┊  resolved "https://registry.yarnpkg.com/camelcase/-/camelcase-5.0.0.tgz#03295527d58bd3cd4aa75363f35b2e8d97be2f42"
+┊   ┊774┊  integrity sha512-faqwZqnWxbxn+F1d399ygeamQNy3lPp/H9H6rNrqYh4FSVCtcY+3cub1MxA8o9mDd55mM8Aghuu/kuyYA6VTsA==
+┊   ┊775┊
 ┊549┊776┊capture-stack-trace@^1.0.0:
 ┊550┊777┊  version "1.0.1"
 ┊551┊778┊  resolved "https://registry.yarnpkg.com/capture-stack-trace/-/capture-stack-trace-1.0.1.tgz#a6c0bbe1f38f3aa0b92238ecb6ff42c344d4135d"
 ┊552┊779┊  integrity sha512-mYQLZnx5Qt1JgB1WEiMCf2647plpGeQ2NMR/5L0HNZzGQo4fuSPnK+wjfPnKZV0aiJDgzmWqqkV/g7JD+DW0qw==
 ┊553┊780┊
-┊554┊   ┊chalk@^2.0.1:
+┊   ┊781┊caseless@~0.12.0:
+┊   ┊782┊  version "0.12.0"
+┊   ┊783┊  resolved "https://registry.yarnpkg.com/caseless/-/caseless-0.12.0.tgz#1b681c21ff84033c826543090689420d187151dc"
+┊   ┊784┊  integrity sha1-G2gcIf+EAzyCZUMJBolCDRhxUdw=
+┊   ┊785┊
+┊   ┊786┊chalk@2.4.2, chalk@^2.0.0, chalk@^2.0.1, chalk@^2.4.1, chalk@^2.4.2:
 ┊555┊787┊  version "2.4.2"
 ┊556┊788┊  resolved "https://registry.yarnpkg.com/chalk/-/chalk-2.4.2.tgz#cd42541677a54333cf541a49108c1432b44c9424"
 ┊557┊789┊  integrity sha512-Mti+f9lpJNcwF4tWV8/OrTTtF1gZi+f8FqlyAdouralcFWFQWF2+NgCHShjkCb+IFBLq9buZwE1xckQU4peSuQ==
```
```diff
@@ -560,6 +792,66 @@
 ┊560┊792┊    escape-string-regexp "^1.0.5"
 ┊561┊793┊    supports-color "^5.3.0"
 ┊562┊794┊
+┊   ┊795┊chalk@^1.0.0, chalk@^1.1.3:
+┊   ┊796┊  version "1.1.3"
+┊   ┊797┊  resolved "https://registry.yarnpkg.com/chalk/-/chalk-1.1.3.tgz#a8115c55e4a702fe4d150abd3872822a7e09fc98"
+┊   ┊798┊  integrity sha1-qBFcVeSnAv5NFQq9OHKCKn4J/Jg=
+┊   ┊799┊  dependencies:
+┊   ┊800┊    ansi-styles "^2.2.1"
+┊   ┊801┊    escape-string-regexp "^1.0.2"
+┊   ┊802┊    has-ansi "^2.0.0"
+┊   ┊803┊    strip-ansi "^3.0.0"
+┊   ┊804┊    supports-color "^2.0.0"
+┊   ┊805┊
+┊   ┊806┊change-case@3.1.0:
+┊   ┊807┊  version "3.1.0"
+┊   ┊808┊  resolved "https://registry.yarnpkg.com/change-case/-/change-case-3.1.0.tgz#0e611b7edc9952df2e8513b27b42de72647dd17e"
+┊   ┊809┊  integrity sha512-2AZp7uJZbYEzRPsFoa+ijKdvp9zsrnnt6+yFokfwEpeJm0xuJDVoxiRCAaTzyJND8GJkofo2IcKWaUZ/OECVzw==
+┊   ┊810┊  dependencies:
+┊   ┊811┊    camel-case "^3.0.0"
+┊   ┊812┊    constant-case "^2.0.0"
+┊   ┊813┊    dot-case "^2.1.0"
+┊   ┊814┊    header-case "^1.0.0"
+┊   ┊815┊    is-lower-case "^1.1.0"
+┊   ┊816┊    is-upper-case "^1.1.0"
+┊   ┊817┊    lower-case "^1.1.1"
+┊   ┊818┊    lower-case-first "^1.0.0"
+┊   ┊819┊    no-case "^2.3.2"
+┊   ┊820┊    param-case "^2.1.0"
+┊   ┊821┊    pascal-case "^2.0.0"
+┊   ┊822┊    path-case "^2.1.0"
+┊   ┊823┊    sentence-case "^2.1.0"
+┊   ┊824┊    snake-case "^2.1.0"
+┊   ┊825┊    swap-case "^1.1.0"
+┊   ┊826┊    title-case "^2.1.0"
+┊   ┊827┊    upper-case "^1.1.1"
+┊   ┊828┊    upper-case-first "^1.1.0"
+┊   ┊829┊
+┊   ┊830┊chardet@^0.7.0:
+┊   ┊831┊  version "0.7.0"
+┊   ┊832┊  resolved "https://registry.yarnpkg.com/chardet/-/chardet-0.7.0.tgz#90094849f0937f2eedc2425d0d28a9e5f0cbad9e"
+┊   ┊833┊  integrity sha512-mT8iDcrh03qDGRRmoA2hmBJnxpllMR+0/0qlzjqZES6NdiWDcZkCNAk4rPFZ9Q85r27unkiNNg8ZOiwZXBHwcA==
+┊   ┊834┊
+┊   ┊835┊chokidar@2.0.4:
+┊   ┊836┊  version "2.0.4"
+┊   ┊837┊  resolved "https://registry.yarnpkg.com/chokidar/-/chokidar-2.0.4.tgz#356ff4e2b0e8e43e322d18a372460bbcf3accd26"
+┊   ┊838┊  integrity sha512-z9n7yt9rOvIJrMhvDtDictKrkFHeihkNl6uWMmZlmL6tJtX9Cs+87oK+teBx+JIgzvbX3yZHT3eF8vpbDxHJXQ==
+┊   ┊839┊  dependencies:
+┊   ┊840┊    anymatch "^2.0.0"
+┊   ┊841┊    async-each "^1.0.0"
+┊   ┊842┊    braces "^2.3.0"
+┊   ┊843┊    glob-parent "^3.1.0"
+┊   ┊844┊    inherits "^2.0.1"
+┊   ┊845┊    is-binary-path "^1.0.0"
+┊   ┊846┊    is-glob "^4.0.0"
+┊   ┊847┊    lodash.debounce "^4.0.8"
+┊   ┊848┊    normalize-path "^2.1.1"
+┊   ┊849┊    path-is-absolute "^1.0.0"
+┊   ┊850┊    readdirp "^2.0.0"
+┊   ┊851┊    upath "^1.0.5"
+┊   ┊852┊  optionalDependencies:
+┊   ┊853┊    fsevents "^1.2.2"
+┊   ┊854┊
 ┊563┊855┊chokidar@^2.1.0:
 ┊564┊856┊  version "2.1.2"
 ┊565┊857┊  resolved "https://registry.yarnpkg.com/chokidar/-/chokidar-2.1.2.tgz#9c23ea40b01638439e0513864d362aeacc5ad058"
```
```diff
@@ -604,6 +896,35 @@
 ┊604┊896┊  resolved "https://registry.yarnpkg.com/cli-boxes/-/cli-boxes-1.0.0.tgz#4fa917c3e59c94a004cd61f8ee509da651687143"
 ┊605┊897┊  integrity sha1-T6kXw+WclKAEzWH47lCdplFocUM=
 ┊606┊898┊
+┊   ┊899┊cli-cursor@^2.0.0, cli-cursor@^2.1.0:
+┊   ┊900┊  version "2.1.0"
+┊   ┊901┊  resolved "https://registry.yarnpkg.com/cli-cursor/-/cli-cursor-2.1.0.tgz#b35dac376479facc3e94747d41d0d0f5238ffcb5"
+┊   ┊902┊  integrity sha1-s12sN2R5+sw+lHR9QdDQ9SOP/LU=
+┊   ┊903┊  dependencies:
+┊   ┊904┊    restore-cursor "^2.0.0"
+┊   ┊905┊
+┊   ┊906┊cli-truncate@^0.2.1:
+┊   ┊907┊  version "0.2.1"
+┊   ┊908┊  resolved "https://registry.yarnpkg.com/cli-truncate/-/cli-truncate-0.2.1.tgz#9f15cfbb0705005369216c626ac7d05ab90dd574"
+┊   ┊909┊  integrity sha1-nxXPuwcFAFNpIWxiasfQWrkN1XQ=
+┊   ┊910┊  dependencies:
+┊   ┊911┊    slice-ansi "0.0.4"
+┊   ┊912┊    string-width "^1.0.1"
+┊   ┊913┊
+┊   ┊914┊cli-width@^2.0.0:
+┊   ┊915┊  version "2.2.0"
+┊   ┊916┊  resolved "https://registry.yarnpkg.com/cli-width/-/cli-width-2.2.0.tgz#ff19ede8a9a5e579324147b0c11f0fbcbabed639"
+┊   ┊917┊  integrity sha1-/xnt6Kml5XkyQUewwR8PvLq+1jk=
+┊   ┊918┊
+┊   ┊919┊cliui@^4.0.0:
+┊   ┊920┊  version "4.1.0"
+┊   ┊921┊  resolved "https://registry.yarnpkg.com/cliui/-/cliui-4.1.0.tgz#348422dbe82d800b3022eef4f6ac10bf2e4d1b49"
+┊   ┊922┊  integrity sha512-4FG+RSG9DL7uEwRUZXZn3SS34DiDPfzP0VOiEwtUWlE+AR2EIg+hSyvrIgUUfhdgR/UkAeW2QHgeP+hWrXs7jQ==
+┊   ┊923┊  dependencies:
+┊   ┊924┊    string-width "^2.1.1"
+┊   ┊925┊    strip-ansi "^4.0.0"
+┊   ┊926┊    wrap-ansi "^2.0.0"
+┊   ┊927┊
 ┊607┊928┊code-point-at@^1.0.0:
 ┊608┊929┊  version "1.1.0"
 ┊609┊930┊  resolved "https://registry.yarnpkg.com/code-point-at/-/code-point-at-1.1.0.tgz#0d070b4d043a5bea33a2f1a40e2edb3d9a4ccf77"
```
```diff
@@ -617,7 +938,7 @@
 ┊617┊938┊    map-visit "^1.0.0"
 ┊618┊939┊    object-visit "^1.0.0"
 ┊619┊940┊
-┊620┊   ┊color-convert@^1.9.0:
+┊   ┊941┊color-convert@^1.9.0, color-convert@^1.9.1:
 ┊621┊942┊  version "1.9.3"
 ┊622┊943┊  resolved "https://registry.yarnpkg.com/color-convert/-/color-convert-1.9.3.tgz#bb71850690e1f136567de629d2d5471deda4c1e8"
 ┊623┊944┊  integrity sha512-QfAUtd+vFdAtFQcC8CCyYt1fYWxSqAiK2cSD6zDB8N3cpsEBAvRxp9zOGg6G/SHHJYAT88/az/IuDGALsNVbGg==
```
```diff
@@ -629,6 +950,62 @@
 ┊ 629┊ 950┊  resolved "https://registry.yarnpkg.com/color-name/-/color-name-1.1.3.tgz#a7d0558bd89c42f795dd42328f740831ca53bc25"
 ┊ 630┊ 951┊  integrity sha1-p9BVi9icQveV3UIyj3QIMcpTvCU=
 ┊ 631┊ 952┊
+┊    ┊ 953┊color-name@^1.0.0:
+┊    ┊ 954┊  version "1.1.4"
+┊    ┊ 955┊  resolved "https://registry.yarnpkg.com/color-name/-/color-name-1.1.4.tgz#c2a09a87acbde69543de6f63fa3995c826c536a2"
+┊    ┊ 956┊  integrity sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==
+┊    ┊ 957┊
+┊    ┊ 958┊color-string@^1.5.2:
+┊    ┊ 959┊  version "1.5.3"
+┊    ┊ 960┊  resolved "https://registry.yarnpkg.com/color-string/-/color-string-1.5.3.tgz#c9bbc5f01b58b5492f3d6857459cb6590ce204cc"
+┊    ┊ 961┊  integrity sha512-dC2C5qeWoYkxki5UAXapdjqO672AM4vZuPGRQfO8b5HKuKGBbKWpITyDYN7TOFKvRW7kOgAn3746clDBMDJyQw==
+┊    ┊ 962┊  dependencies:
+┊    ┊ 963┊    color-name "^1.0.0"
+┊    ┊ 964┊    simple-swizzle "^0.2.2"
+┊    ┊ 965┊
+┊    ┊ 966┊color@3.0.x:
+┊    ┊ 967┊  version "3.0.0"
+┊    ┊ 968┊  resolved "https://registry.yarnpkg.com/color/-/color-3.0.0.tgz#d920b4328d534a3ac8295d68f7bd4ba6c427be9a"
+┊    ┊ 969┊  integrity sha512-jCpd5+s0s0t7p3pHQKpnJ0TpQKKdleP71LWcA0aqiljpiuAkOSUFN/dyH8ZwF0hRmFlrIuRhufds1QyEP9EB+w==
+┊    ┊ 970┊  dependencies:
+┊    ┊ 971┊    color-convert "^1.9.1"
+┊    ┊ 972┊    color-string "^1.5.2"
+┊    ┊ 973┊
+┊    ┊ 974┊colornames@^1.1.1:
+┊    ┊ 975┊  version "1.1.1"
+┊    ┊ 976┊  resolved "https://registry.yarnpkg.com/colornames/-/colornames-1.1.1.tgz#f8889030685c7c4ff9e2a559f5077eb76a816f96"
+┊    ┊ 977┊  integrity sha1-+IiQMGhcfE/54qVZ9Qd+t2qBb5Y=
+┊    ┊ 978┊
+┊    ┊ 979┊colors@^1.2.1:
+┊    ┊ 980┊  version "1.3.3"
+┊    ┊ 981┊  resolved "https://registry.yarnpkg.com/colors/-/colors-1.3.3.tgz#39e005d546afe01e01f9c4ca8fa50f686a01205d"
+┊    ┊ 982┊  integrity sha512-mmGt/1pZqYRjMxB1axhTo16/snVZ5krrKkcmMeVKxzECMMXoCgnvTPp10QgHfcbQZw8Dq2jMNG6je4JlWU0gWg==
+┊    ┊ 983┊
+┊    ┊ 984┊colorspace@1.1.x:
+┊    ┊ 985┊  version "1.1.1"
+┊    ┊ 986┊  resolved "https://registry.yarnpkg.com/colorspace/-/colorspace-1.1.1.tgz#9ac2491e1bc6f8fb690e2176814f8d091636d972"
+┊    ┊ 987┊  integrity sha512-pI3btWyiuz7Ken0BWh9Elzsmv2bM9AhA7psXib4anUXy/orfZ/E0MbQwhSOG/9L8hLlalqrU0UhOuqxW1YjmVw==
+┊    ┊ 988┊  dependencies:
+┊    ┊ 989┊    color "3.0.x"
+┊    ┊ 990┊    text-hex "1.0.x"
+┊    ┊ 991┊
+┊    ┊ 992┊combined-stream@^1.0.6, combined-stream@~1.0.6:
+┊    ┊ 993┊  version "1.0.7"
+┊    ┊ 994┊  resolved "https://registry.yarnpkg.com/combined-stream/-/combined-stream-1.0.7.tgz#2d1d24317afb8abe95d6d2c0b07b57813539d828"
+┊    ┊ 995┊  integrity sha512-brWl9y6vOB1xYPZcpZde3N9zDByXTosAeMDo4p1wzo6UMOX4vumB+TP1RZ76sfE6Md68Q0NJSrE/gbezd4Ul+w==
+┊    ┊ 996┊  dependencies:
+┊    ┊ 997┊    delayed-stream "~1.0.0"
+┊    ┊ 998┊
+┊    ┊ 999┊commander@2.19.0:
+┊    ┊1000┊  version "2.19.0"
+┊    ┊1001┊  resolved "https://registry.yarnpkg.com/commander/-/commander-2.19.0.tgz#f6198aa84e5b83c46054b94ddedbfed5ee9ff12a"
+┊    ┊1002┊  integrity sha512-6tvAOO+D6OENvRAh524Dh9jcfKTYDQAqvqezbCW82xj5X0pSrcpxtvRKHLG0yBY6SD7PSDrJaj+0AiOcKVd1Xg==
+┊    ┊1003┊
+┊    ┊1004┊common-tags@1.8.0:
+┊    ┊1005┊  version "1.8.0"
+┊    ┊1006┊  resolved "https://registry.yarnpkg.com/common-tags/-/common-tags-1.8.0.tgz#8e3153e542d4a39e9b10554434afaaf98956a937"
+┊    ┊1007┊  integrity sha512-6P6g0uetGpW/sdyUy/iQQCbFF0kWVMSIVSyYz7Zgjcgh8mgw8PQzDNZeyZ5DQ2gM7LBoZPHmnjz8rUthkBG5tw==
+┊    ┊1008┊
 ┊ 632┊1009┊component-emitter@^1.2.1:
 ┊ 633┊1010┊  version "1.2.1"
 ┊ 634┊1011┊  resolved "https://registry.yarnpkg.com/component-emitter/-/component-emitter-1.2.1.tgz#137918d6d78283f7df7a6b7c5a63e140e69425e6"
```
```diff
@@ -639,6 +1016,21 @@
 ┊ 639┊1016┊  resolved "https://registry.yarnpkg.com/concat-map/-/concat-map-0.0.1.tgz#d8a96bd77fd68df7793a73036a3ba0d5405d477b"
 ┊ 640┊1017┊  integrity sha1-2Klr13/Wjfd5OnMDajug1UBdR3s=
 ┊ 641┊1018┊
+┊    ┊1019┊concurrently@^4.1.0:
+┊    ┊1020┊  version "4.1.0"
+┊    ┊1021┊  resolved "https://registry.yarnpkg.com/concurrently/-/concurrently-4.1.0.tgz#17fdf067da71210685d9ea554423ef239da30d33"
+┊    ┊1022┊  integrity sha512-pwzXCE7qtOB346LyO9eFWpkFJVO3JQZ/qU/feGeaAHiX1M3Rw3zgXKc5cZ8vSH5DGygkjzLFDzA/pwoQDkRNGg==
+┊    ┊1023┊  dependencies:
+┊    ┊1024┊    chalk "^2.4.1"
+┊    ┊1025┊    date-fns "^1.23.0"
+┊    ┊1026┊    lodash "^4.17.10"
+┊    ┊1027┊    read-pkg "^4.0.1"
+┊    ┊1028┊    rxjs "^6.3.3"
+┊    ┊1029┊    spawn-command "^0.0.2-1"
+┊    ┊1030┊    supports-color "^4.5.0"
+┊    ┊1031┊    tree-kill "^1.1.0"
+┊    ┊1032┊    yargs "^12.0.1"
+┊    ┊1033┊
 ┊ 642┊1034┊configstore@^3.0.0:
 ┊ 643┊1035┊  version "3.1.2"
 ┊ 644┊1036┊  resolved "https://registry.yarnpkg.com/configstore/-/configstore-3.1.2.tgz#c6f25defaeef26df12dd33414b001fe81a543f8f"
```
```diff
@@ -656,6 +1048,14 @@
 ┊ 656┊1048┊  resolved "https://registry.yarnpkg.com/console-control-strings/-/console-control-strings-1.1.0.tgz#3d7cf4464db6446ea644bf4b39507f9851008e8e"
 ┊ 657┊1049┊  integrity sha1-PXz0Rk22RG6mRL9LOVB/mFEAjo4=
 ┊ 658┊1050┊
+┊    ┊1051┊constant-case@^2.0.0:
+┊    ┊1052┊  version "2.0.0"
+┊    ┊1053┊  resolved "https://registry.yarnpkg.com/constant-case/-/constant-case-2.0.0.tgz#4175764d389d3fa9c8ecd29186ed6005243b6a46"
+┊    ┊1054┊  integrity sha1-QXV2TTidP6nI7NKRhu1gBSQ7akY=
+┊    ┊1055┊  dependencies:
+┊    ┊1056┊    snake-case "^2.1.0"
+┊    ┊1057┊    upper-case "^1.1.1"
+┊    ┊1058┊
 ┊ 659┊1059┊content-disposition@0.5.2:
 ┊ 660┊1060┊  version "0.5.2"
 ┊ 661┊1061┊  resolved "https://registry.yarnpkg.com/content-disposition/-/content-disposition-0.5.2.tgz#0cf68bb9ddf5f2be7961c3a85178cb85dba78cb4"
```
```diff
@@ -686,7 +1086,7 @@
 ┊ 686┊1086┊  resolved "https://registry.yarnpkg.com/core-js/-/core-js-3.0.0-beta.13.tgz#7732c69be5e4758887917235fe7c0352c4cb42a1"
 ┊ 687┊1087┊  integrity sha512-16Q43c/3LT9NyePUJKL8nRIQgYWjcBhjJSMWg96PVSxoS0PeE0NHitPI3opBrs9MGGHjte1KoEVr9W63YKlTXQ==
 ┊ 688┊1088┊
-┊ 689┊    ┊core-util-is@~1.0.0:
+┊    ┊1089┊core-util-is@1.0.2, core-util-is@~1.0.0:
 ┊ 690┊1090┊  version "1.0.2"
 ┊ 691┊1091┊  resolved "https://registry.yarnpkg.com/core-util-is/-/core-util-is-1.0.2.tgz#b5fd54220aa2bc5ab57aab7140c940754503c1a7"
 ┊ 692┊1092┊  integrity sha1-tf1UIgqivFq1eqtxQMlAdUUDwac=
```
```diff
@@ -706,6 +1106,14 @@
 ┊ 706┊1106┊  dependencies:
 ┊ 707┊1107┊    capture-stack-trace "^1.0.0"
 ┊ 708┊1108┊
+┊    ┊1109┊cross-fetch@2.2.2:
+┊    ┊1110┊  version "2.2.2"
+┊    ┊1111┊  resolved "https://registry.yarnpkg.com/cross-fetch/-/cross-fetch-2.2.2.tgz#a47ff4f7fc712daba8f6a695a11c948440d45723"
+┊    ┊1112┊  integrity sha1-pH/09/xxLauo9qaVoRyUhEDUVyM=
+┊    ┊1113┊  dependencies:
+┊    ┊1114┊    node-fetch "2.1.2"
+┊    ┊1115┊    whatwg-fetch "2.0.4"
+┊    ┊1116┊
 ┊ 709┊1117┊cross-spawn@^5.0.1:
 ┊ 710┊1118┊  version "5.1.0"
 ┊ 711┊1119┊  resolved "https://registry.yarnpkg.com/cross-spawn/-/cross-spawn-5.1.0.tgz#e8bd0efee58fcff6f8f94510a0a554bbfa235449"
```
```diff
@@ -715,11 +1123,34 @@
 ┊ 715┊1123┊    shebang-command "^1.2.0"
 ┊ 716┊1124┊    which "^1.2.9"
 ┊ 717┊1125┊
+┊    ┊1126┊cross-spawn@^6.0.0:
+┊    ┊1127┊  version "6.0.5"
+┊    ┊1128┊  resolved "https://registry.yarnpkg.com/cross-spawn/-/cross-spawn-6.0.5.tgz#4a5ec7c64dfae22c3a14124dbacdee846d80cbc4"
+┊    ┊1129┊  integrity sha512-eTVLrBSt7fjbDygz805pMnstIs2VTBNkRm0qxZd+M7A5XDdxVRWO5MxGBXZhjY4cqLYLdtrGqRf8mBPmzwSpWQ==
+┊    ┊1130┊  dependencies:
+┊    ┊1131┊    nice-try "^1.0.4"
+┊    ┊1132┊    path-key "^2.0.1"
+┊    ┊1133┊    semver "^5.5.0"
+┊    ┊1134┊    shebang-command "^1.2.0"
+┊    ┊1135┊    which "^1.2.9"
+┊    ┊1136┊
 ┊ 718┊1137┊crypto-random-string@^1.0.0:
 ┊ 719┊1138┊  version "1.0.0"
 ┊ 720┊1139┊  resolved "https://registry.yarnpkg.com/crypto-random-string/-/crypto-random-string-1.0.0.tgz#a230f64f568310e1498009940790ec99545bca7e"
 ┊ 721┊1140┊  integrity sha1-ojD2T1aDEOFJgAmUB5DsmVRbyn4=
 ┊ 722┊1141┊
+┊    ┊1142┊dashdash@^1.12.0:
+┊    ┊1143┊  version "1.14.1"
+┊    ┊1144┊  resolved "https://registry.yarnpkg.com/dashdash/-/dashdash-1.14.1.tgz#853cfa0f7cbe2fed5de20326b8dd581035f6e2f0"
+┊    ┊1145┊  integrity sha1-hTz6D3y+L+1d4gMmuN1YEDX24vA=
+┊    ┊1146┊  dependencies:
+┊    ┊1147┊    assert-plus "^1.0.0"
+┊    ┊1148┊
+┊    ┊1149┊date-fns@^1.23.0, date-fns@^1.27.2:
+┊    ┊1150┊  version "1.30.1"
+┊    ┊1151┊  resolved "https://registry.yarnpkg.com/date-fns/-/date-fns-1.30.1.tgz#2e71bf0b119153dbb4cc4e88d9ea5acfb50dc05c"
+┊    ┊1152┊  integrity sha512-hBSVCvSmWC+QypYObzwGOd9wqdDpOt+0wl0KbU+R+uuZBS1jN8VsD1ss3irQDknRj5NvxiTF6oj/nDRnN/UQNw==
+┊    ┊1153┊
 ┊ 723┊1154┊debug@2.6.9, debug@^2.1.2, debug@^2.2.0, debug@^2.3.3:
 ┊ 724┊1155┊  version "2.6.9"
 ┊ 725┊1156┊  resolved "https://registry.yarnpkg.com/debug/-/debug-2.6.9.tgz#5d128515df134ff327e90a4c93f4e077a536341f"
```
```diff
@@ -734,6 +1165,18 @@
 ┊ 734┊1165┊  dependencies:
 ┊ 735┊1166┊    ms "^2.1.1"
 ┊ 736┊1167┊
+┊    ┊1168┊debug@^4.1.0:
+┊    ┊1169┊  version "4.1.1"
+┊    ┊1170┊  resolved "https://registry.yarnpkg.com/debug/-/debug-4.1.1.tgz#3b72260255109c6b589cee050f1d516139664791"
+┊    ┊1171┊  integrity sha512-pYAIzeRo8J6KPEaJ0VWOh5Pzkbw/RetuzehGM7QRRX5he4fPHx2rdKMB256ehJCkX+XRQm16eZLqLNS8RSZXZw==
+┊    ┊1172┊  dependencies:
+┊    ┊1173┊    ms "^2.1.1"
+┊    ┊1174┊
+┊    ┊1175┊decamelize@^1.2.0:
+┊    ┊1176┊  version "1.2.0"
+┊    ┊1177┊  resolved "https://registry.yarnpkg.com/decamelize/-/decamelize-1.2.0.tgz#f6534d15148269b20352e7bee26f501f9a191290"
+┊    ┊1178┊  integrity sha1-9lNNFRSCabIDUue+4m9QH5oZEpA=
+┊    ┊1179┊
 ┊ 737┊1180┊decode-uri-component@^0.2.0:
 ┊ 738┊1181┊  version "0.2.0"
 ┊ 739┊1182┊  resolved "https://registry.yarnpkg.com/decode-uri-component/-/decode-uri-component-0.2.0.tgz#eb3913333458775cb84cd1a1fae062106bb87545"
```
```diff
@@ -744,6 +1187,11 @@
 ┊ 744┊1187┊  resolved "https://registry.yarnpkg.com/deep-extend/-/deep-extend-0.6.0.tgz#c4fa7c95404a17a9c3e8ca7e1537312b736330ac"
 ┊ 745┊1188┊  integrity sha512-LOHxIOaPYdHlJRtCQfDIVZtfw/ufM8+rVj649RIHzcm/vGwQRXFt6OPqIFWsm2XEMrNIEtWR64sY1LEKD2vAOA==
 ┊ 746┊1189┊
+┊    ┊1190┊deepmerge@3.1.0:
+┊    ┊1191┊  version "3.1.0"
+┊    ┊1192┊  resolved "https://registry.yarnpkg.com/deepmerge/-/deepmerge-3.1.0.tgz#a612626ce4803da410d77554bfd80361599c034d"
+┊    ┊1193┊  integrity sha512-/TnecbwXEdycfbsM2++O3eGiatEFHjjNciHEwJclM+T5Kd94qD1AP+2elP/Mq0L5b9VZJao5znR01Mz6eX8Seg==
+┊    ┊1194┊
 ┊ 747┊1195┊define-properties@^1.1.2:
 ┊ 748┊1196┊  version "1.1.3"
 ┊ 749┊1197┊  resolved "https://registry.yarnpkg.com/define-properties/-/define-properties-1.1.3.tgz#cf88da6cbee26fe6db7094f61d870cbd84cee9f1"
```
```diff
@@ -773,6 +1221,11 @@
 ┊ 773┊1221┊    is-descriptor "^1.0.2"
 ┊ 774┊1222┊    isobject "^3.0.1"
 ┊ 775┊1223┊
+┊    ┊1224┊delayed-stream@~1.0.0:
+┊    ┊1225┊  version "1.0.0"
+┊    ┊1226┊  resolved "https://registry.yarnpkg.com/delayed-stream/-/delayed-stream-1.0.0.tgz#df3ae199acadfb7d440aaae0b29e2272b24ec619"
+┊    ┊1227┊  integrity sha1-3zrhmayt+31ECqrgsp4icrJOxhk=
+┊    ┊1228┊
 ┊ 776┊1229┊delegates@^1.0.0:
 ┊ 777┊1230┊  version "1.0.0"
 ┊ 778┊1231┊  resolved "https://registry.yarnpkg.com/delegates/-/delegates-1.0.0.tgz#84c6e159b81904fdca59a0ef44cd870d31250f9a"
```
```diff
@@ -793,11 +1246,25 @@
 ┊ 793┊1246┊  resolved "https://registry.yarnpkg.com/destroy/-/destroy-1.0.4.tgz#978857442c44749e4206613e37946205826abd80"
 ┊ 794┊1247┊  integrity sha1-l4hXRCxEdJ5CBmE+N5RiBYJqvYA=
 ┊ 795┊1248┊
+┊    ┊1249┊detect-indent@5.0.0:
+┊    ┊1250┊  version "5.0.0"
+┊    ┊1251┊  resolved "https://registry.yarnpkg.com/detect-indent/-/detect-indent-5.0.0.tgz#3871cc0a6a002e8c3e5b3cf7f336264675f06b9d"
+┊    ┊1252┊  integrity sha1-OHHMCmoALow+Wzz38zYmRnXwa50=
+┊    ┊1253┊
 ┊ 796┊1254┊detect-libc@^1.0.2:
 ┊ 797┊1255┊  version "1.0.3"
 ┊ 798┊1256┊  resolved "https://registry.yarnpkg.com/detect-libc/-/detect-libc-1.0.3.tgz#fa137c4bd698edf55cd5cd02ac559f91a4c4ba9b"
 ┊ 799┊1257┊  integrity sha1-+hN8S9aY7fVc1c0CrFWfkaTEups=
 ┊ 800┊1258┊
+┊    ┊1259┊diagnostics@^1.1.1:
+┊    ┊1260┊  version "1.1.1"
+┊    ┊1261┊  resolved "https://registry.yarnpkg.com/diagnostics/-/diagnostics-1.1.1.tgz#cab6ac33df70c9d9a727490ae43ac995a769b22a"
+┊    ┊1262┊  integrity sha512-8wn1PmdunLJ9Tqbx+Fx/ZEuHfJf4NKSN2ZBj7SJC/OWRWha843+WsTjqMe1B5E3p28jqBlp+mJ2fPVxPyNgYKQ==
+┊    ┊1263┊  dependencies:
+┊    ┊1264┊    colorspace "1.1.x"
+┊    ┊1265┊    enabled "1.0.x"
+┊    ┊1266┊    kuler "1.0.x"
+┊    ┊1267┊
 ┊ 801┊1268┊dicer@0.3.0:
 ┊ 802┊1269┊  version "0.3.0"
 ┊ 803┊1270┊  resolved "https://registry.yarnpkg.com/dicer/-/dicer-0.3.0.tgz#eacd98b3bfbf92e8ab5c2fdb71aaac44bb06b872"
```
```diff
@@ -810,6 +1277,13 @@
 ┊ 810┊1277┊  resolved "https://registry.yarnpkg.com/diff/-/diff-3.5.0.tgz#800c0dd1e0a8bfbc95835c202ad220fe317e5a12"
 ┊ 811┊1278┊  integrity sha512-A46qtFgd+g7pDZinpnwiRJtxbC1hpgf0uzP3iG89scHk0AUC7A1TGxf5OiiOUv/JMZR8GOt8hL900hV0bOy5xA==
 ┊ 812┊1279┊
+┊    ┊1280┊dot-case@^2.1.0:
+┊    ┊1281┊  version "2.1.1"
+┊    ┊1282┊  resolved "https://registry.yarnpkg.com/dot-case/-/dot-case-2.1.1.tgz#34dcf37f50a8e93c2b3bca8bb7fb9155c7da3bee"
+┊    ┊1283┊  integrity sha1-NNzzf1Co6TwrO8qLt/uRVcfaO+4=
+┊    ┊1284┊  dependencies:
+┊    ┊1285┊    no-case "^2.2.0"
+┊    ┊1286┊
 ┊ 813┊1287┊dot-prop@^4.1.0:
 ┊ 814┊1288┊  version "4.2.0"
 ┊ 815┊1289┊  resolved "https://registry.yarnpkg.com/dot-prop/-/dot-prop-4.2.0.tgz#1f19e0c2e1aa0e32797c49799f2837ac6af69c57"
```
```diff
@@ -822,16 +1296,55 @@
 ┊ 822┊1296┊  resolved "https://registry.yarnpkg.com/duplexer3/-/duplexer3-0.1.4.tgz#ee01dd1cac0ed3cbc7fdbea37dc0a8f1ce002ce2"
 ┊ 823┊1297┊  integrity sha1-7gHdHKwO08vH/b6jfcCo8c4ALOI=
 ┊ 824┊1298┊
+┊    ┊1299┊ecc-jsbn@~0.1.1:
+┊    ┊1300┊  version "0.1.2"
+┊    ┊1301┊  resolved "https://registry.yarnpkg.com/ecc-jsbn/-/ecc-jsbn-0.1.2.tgz#3a83a904e54353287874c564b7549386849a98c9"
+┊    ┊1302┊  integrity sha1-OoOpBOVDUyh4dMVkt1SThoSamMk=
+┊    ┊1303┊  dependencies:
+┊    ┊1304┊    jsbn "~0.1.0"
+┊    ┊1305┊    safer-buffer "^2.1.0"
+┊    ┊1306┊
 ┊ 825┊1307┊ee-first@1.1.1:
 ┊ 826┊1308┊  version "1.1.1"
 ┊ 827┊1309┊  resolved "https://registry.yarnpkg.com/ee-first/-/ee-first-1.1.1.tgz#590c61156b0ae2f4f0255732a158b266bc56b21d"
 ┊ 828┊1310┊  integrity sha1-WQxhFWsK4vTwJVcyoViyZrxWsh0=
 ┊ 829┊1311┊
+┊    ┊1312┊elegant-spinner@^1.0.1:
+┊    ┊1313┊  version "1.0.1"
+┊    ┊1314┊  resolved "https://registry.yarnpkg.com/elegant-spinner/-/elegant-spinner-1.0.1.tgz#db043521c95d7e303fd8f345bedc3349cfb0729e"
+┊    ┊1315┊  integrity sha1-2wQ1IcldfjA/2PNFvtwzSc+wcp4=
+┊    ┊1316┊
+┊    ┊1317┊enabled@1.0.x:
+┊    ┊1318┊  version "1.0.2"
+┊    ┊1319┊  resolved "https://registry.yarnpkg.com/enabled/-/enabled-1.0.2.tgz#965f6513d2c2d1c5f4652b64a2e3396467fc2f93"
+┊    ┊1320┊  integrity sha1-ll9lE9LC0cX0ZStkouM5ZGf8L5M=
+┊    ┊1321┊  dependencies:
+┊    ┊1322┊    env-variable "0.0.x"
+┊    ┊1323┊
 ┊ 830┊1324┊encodeurl@~1.0.2:
 ┊ 831┊1325┊  version "1.0.2"
 ┊ 832┊1326┊  resolved "https://registry.yarnpkg.com/encodeurl/-/encodeurl-1.0.2.tgz#ad3ff4c86ec2d029322f5a02c3a9a606c95b3f59"
 ┊ 833┊1327┊  integrity sha1-rT/0yG7C0CkyL1oCw6mmBslbP1k=
 ┊ 834┊1328┊
+┊    ┊1329┊end-of-stream@^1.1.0:
+┊    ┊1330┊  version "1.4.1"
+┊    ┊1331┊  resolved "https://registry.yarnpkg.com/end-of-stream/-/end-of-stream-1.4.1.tgz#ed29634d19baba463b6ce6b80a37213eab71ec43"
+┊    ┊1332┊  integrity sha512-1MkrZNvWTKCaigbn+W15elq2BB/L22nqrSY5DKlo3X6+vclJm8Bb5djXJBmEX6fS3+zCh/F4VBK5Z2KxJt4s2Q==
+┊    ┊1333┊  dependencies:
+┊    ┊1334┊    once "^1.4.0"
+┊    ┊1335┊
+┊    ┊1336┊env-variable@0.0.x:
+┊    ┊1337┊  version "0.0.5"
+┊    ┊1338┊  resolved "https://registry.yarnpkg.com/env-variable/-/env-variable-0.0.5.tgz#913dd830bef11e96a039c038d4130604eba37f88"
+┊    ┊1339┊  integrity sha512-zoB603vQReOFvTg5xMl9I1P2PnHsHQQKTEowsKKD7nseUfJq6UWzK+4YtlWUO1nhiQUxe6XMkk+JleSZD1NZFA==
+┊    ┊1340┊
+┊    ┊1341┊error-ex@^1.3.1:
+┊    ┊1342┊  version "1.3.2"
+┊    ┊1343┊  resolved "https://registry.yarnpkg.com/error-ex/-/error-ex-1.3.2.tgz#b4ac40648107fdcdcfae242f428bea8a14d4f1bf"
+┊    ┊1344┊  integrity sha512-7dFHNmqeFSEt2ZBsCriorKnn3Z2pj+fd9kmI6QoWw4//DL+icEBfc0U7qJCisqrTsKTjw4fNFy2pW9OqStD84g==
+┊    ┊1345┊  dependencies:
+┊    ┊1346┊    is-arrayish "^0.2.1"
+┊    ┊1347┊
 ┊ 835┊1348┊es-abstract@^1.5.1:
 ┊ 836┊1349┊  version "1.13.0"
 ┊ 837┊1350┊  resolved "https://registry.yarnpkg.com/es-abstract/-/es-abstract-1.13.0.tgz#ac86145fdd5099d8dd49558ccba2eaf9b88e24e9"
```
```diff
@@ -858,11 +1371,21 @@
 ┊ 858┊1371┊  resolved "https://registry.yarnpkg.com/escape-html/-/escape-html-1.0.3.tgz#0258eae4d3d0c0974de1c169188ef0051d1d1988"
 ┊ 859┊1372┊  integrity sha1-Aljq5NPQwJdN4cFpGI7wBR0dGYg=
 ┊ 860┊1373┊
-┊ 861┊    ┊escape-string-regexp@^1.0.5:
+┊    ┊1374┊escape-string-regexp@^1.0.2, escape-string-regexp@^1.0.5:
 ┊ 862┊1375┊  version "1.0.5"
 ┊ 863┊1376┊  resolved "https://registry.yarnpkg.com/escape-string-regexp/-/escape-string-regexp-1.0.5.tgz#1b61c0562190a8dff6ae3bb2cf0200ca130b86d4"
 ┊ 864┊1377┊  integrity sha1-G2HAViGQqN/2rjuyzwIAyhMLhtQ=
 ┊ 865┊1378┊
+┊    ┊1379┊esprima@^4.0.0:
+┊    ┊1380┊  version "4.0.1"
+┊    ┊1381┊  resolved "https://registry.yarnpkg.com/esprima/-/esprima-4.0.1.tgz#13b04cdb3e6c5d19df91ab6987a8695619b0aa71"
+┊    ┊1382┊  integrity sha512-eGuFFw7Upda+g4p+QHvnW0RyTX/SVeJBDM/gCtMARO0cLuT2HcEKnTPvhjV6aGeqrCB/sbNop0Kszm0jsaWU4A==
+┊    ┊1383┊
+┊    ┊1384┊esutils@^2.0.2:
+┊    ┊1385┊  version "2.0.2"
+┊    ┊1386┊  resolved "https://registry.yarnpkg.com/esutils/-/esutils-2.0.2.tgz#0abf4f1caa5bcb1f7a9d8acc6dea4faaa04bac9b"
+┊    ┊1387┊  integrity sha1-Cr9PHKpbyx96nYrMbepPqqBLrJs=
+┊    ┊1388┊
 ┊ 866┊1389┊etag@~1.8.1:
 ┊ 867┊1390┊  version "1.8.1"
 ┊ 868┊1391┊  resolved "https://registry.yarnpkg.com/etag/-/etag-1.8.1.tgz#41ae2eeb65efa62268aebfea83ac7d79299b0887"
```
```diff
@@ -886,6 +1409,19 @@
 ┊ 886┊1409┊    signal-exit "^3.0.0"
 ┊ 887┊1410┊    strip-eof "^1.0.0"
 ┊ 888┊1411┊
+┊    ┊1412┊execa@^1.0.0:
+┊    ┊1413┊  version "1.0.0"
+┊    ┊1414┊  resolved "https://registry.yarnpkg.com/execa/-/execa-1.0.0.tgz#c6236a5bb4df6d6f15e88e7f017798216749ddd8"
+┊    ┊1415┊  integrity sha512-adbxcyWV46qiHyvSp50TKt05tB4tK3HcmF7/nxfAdhnox83seTDbwnaqKO4sXRy7roHAIFqJP/Rw/AuEbX61LA==
+┊    ┊1416┊  dependencies:
+┊    ┊1417┊    cross-spawn "^6.0.0"
+┊    ┊1418┊    get-stream "^4.0.0"
+┊    ┊1419┊    is-stream "^1.1.0"
+┊    ┊1420┊    npm-run-path "^2.0.0"
+┊    ┊1421┊    p-finally "^1.0.0"
+┊    ┊1422┊    signal-exit "^3.0.0"
+┊    ┊1423┊    strip-eof "^1.0.0"
+┊    ┊1424┊
 ┊ 889┊1425┊expand-brackets@^2.1.4:
 ┊ 890┊1426┊  version "2.1.4"
 ┊ 891┊1427┊  resolved "https://registry.yarnpkg.com/expand-brackets/-/expand-brackets-2.1.4.tgz#b77735e315ce30f6b6eff0f83b04151a22449622"
```
```diff
@@ -950,6 +1486,20 @@
 ┊ 950┊1486┊    assign-symbols "^1.0.0"
 ┊ 951┊1487┊    is-extendable "^1.0.1"
 ┊ 952┊1488┊
+┊    ┊1489┊extend@~3.0.2:
+┊    ┊1490┊  version "3.0.2"
+┊    ┊1491┊  resolved "https://registry.yarnpkg.com/extend/-/extend-3.0.2.tgz#f8b1136b4071fbd8eb140aff858b1019ec2915fa"
+┊    ┊1492┊  integrity sha512-fjquC59cD7CyW6urNXK0FBufkZcoiGG80wTuPujX590cB5Ttln20E2UB4S/WARVqhXffZl2LNgS+gQdPIIim/g==
+┊    ┊1493┊
+┊    ┊1494┊external-editor@^3.0.3:
+┊    ┊1495┊  version "3.0.3"
+┊    ┊1496┊  resolved "https://registry.yarnpkg.com/external-editor/-/external-editor-3.0.3.tgz#5866db29a97826dbe4bf3afd24070ead9ea43a27"
+┊    ┊1497┊  integrity sha512-bn71H9+qWoOQKyZDo25mOMVpSmXROAsTJVVVYzrrtol3d4y+AsKjf4Iwl2Q+IuT0kFSQ1qo166UuIwqYq7mGnA==
+┊    ┊1498┊  dependencies:
+┊    ┊1499┊    chardet "^0.7.0"
+┊    ┊1500┊    iconv-lite "^0.4.24"
+┊    ┊1501┊    tmp "^0.0.33"
+┊    ┊1502┊
 ┊ 953┊1503┊extglob@^2.0.4:
 ┊ 954┊1504┊  version "2.0.4"
 ┊ 955┊1505┊  resolved "https://registry.yarnpkg.com/extglob/-/extglob-2.0.4.tgz#ad00fe4dc612a9232e8718711dc5cb5ab0285543"
```
```diff
@@ -964,11 +1514,51 @@
 ┊ 964┊1514┊    snapdragon "^0.8.1"
 ┊ 965┊1515┊    to-regex "^3.0.1"
 ┊ 966┊1516┊
+┊    ┊1517┊extsprintf@1.3.0:
+┊    ┊1518┊  version "1.3.0"
+┊    ┊1519┊  resolved "https://registry.yarnpkg.com/extsprintf/-/extsprintf-1.3.0.tgz#96918440e3041a7a414f8c52e3c574eb3c3e1e05"
+┊    ┊1520┊  integrity sha1-lpGEQOMEGnpBT4xS48V06zw+HgU=
+┊    ┊1521┊
+┊    ┊1522┊extsprintf@^1.2.0:
+┊    ┊1523┊  version "1.4.0"
+┊    ┊1524┊  resolved "https://registry.yarnpkg.com/extsprintf/-/extsprintf-1.4.0.tgz#e2689f8f356fad62cca65a3a91c5df5f9551692f"
+┊    ┊1525┊  integrity sha1-4mifjzVvrWLMplo6kcXfX5VRaS8=
+┊    ┊1526┊
+┊    ┊1527┊fast-deep-equal@^2.0.1:
+┊    ┊1528┊  version "2.0.1"
+┊    ┊1529┊  resolved "https://registry.yarnpkg.com/fast-deep-equal/-/fast-deep-equal-2.0.1.tgz#7b05218ddf9667bf7f370bf7fdb2cb15fdd0aa49"
+┊    ┊1530┊  integrity sha1-ewUhjd+WZ79/Nwv3/bLLFf3Qqkk=
+┊    ┊1531┊
 ┊ 967┊1532┊fast-json-stable-stringify@^2.0.0:
 ┊ 968┊1533┊  version "2.0.0"
 ┊ 969┊1534┊  resolved "https://registry.yarnpkg.com/fast-json-stable-stringify/-/fast-json-stable-stringify-2.0.0.tgz#d5142c0caee6b1189f87d3a76111064f86c8bbf2"
 ┊ 970┊1535┊  integrity sha1-1RQsDK7msRifh9OnYREGT4bIu/I=
 ┊ 971┊1536┊
+┊    ┊1537┊fast-safe-stringify@^2.0.4:
+┊    ┊1538┊  version "2.0.6"
+┊    ┊1539┊  resolved "https://registry.yarnpkg.com/fast-safe-stringify/-/fast-safe-stringify-2.0.6.tgz#04b26106cc56681f51a044cfc0d76cf0008ac2c2"
+┊    ┊1540┊  integrity sha512-q8BZ89jjc+mz08rSxROs8VsrBBcn1SIw1kq9NjolL509tkABRk9io01RAjSaEv1Xb2uFLt8VtRiZbGp5H8iDtg==
+┊    ┊1541┊
+┊    ┊1542┊fecha@^2.3.3:
+┊    ┊1543┊  version "2.3.3"
+┊    ┊1544┊  resolved "https://registry.yarnpkg.com/fecha/-/fecha-2.3.3.tgz#948e74157df1a32fd1b12c3a3c3cdcb6ec9d96cd"
+┊    ┊1545┊  integrity sha512-lUGBnIamTAwk4znq5BcqsDaxSmZ9nDVJaij6NvRt/Tg4R69gERA+otPKbS86ROw9nxVMw2/mp1fnaiWqbs6Sdg==
+┊    ┊1546┊
+┊    ┊1547┊figures@^1.7.0:
+┊    ┊1548┊  version "1.7.0"
+┊    ┊1549┊  resolved "https://registry.yarnpkg.com/figures/-/figures-1.7.0.tgz#cbe1e3affcf1cd44b80cadfed28dc793a9701d2e"
+┊    ┊1550┊  integrity sha1-y+Hjr/zxzUS4DK3+0o3Hk6lwHS4=
+┊    ┊1551┊  dependencies:
+┊    ┊1552┊    escape-string-regexp "^1.0.5"
+┊    ┊1553┊    object-assign "^4.1.0"
+┊    ┊1554┊
+┊    ┊1555┊figures@^2.0.0:
+┊    ┊1556┊  version "2.0.0"
+┊    ┊1557┊  resolved "https://registry.yarnpkg.com/figures/-/figures-2.0.0.tgz#3ab1a2d2a62c8bfb431a0c94cb797a2fce27c962"
+┊    ┊1558┊  integrity sha1-OrGi0qYsi/tDGgyUy3l6L84nyWI=
+┊    ┊1559┊  dependencies:
+┊    ┊1560┊    escape-string-regexp "^1.0.5"
+┊    ┊1561┊
 ┊ 972┊1562┊fill-range@^4.0.0:
 ┊ 973┊1563┊  version "4.0.0"
 ┊ 974┊1564┊  resolved "https://registry.yarnpkg.com/fill-range/-/fill-range-4.0.0.tgz#d544811d428f98eb06a63dc402d2403c328c38f7"
```
```diff
@@ -992,11 +1582,32 @@
 ┊ 992┊1582┊    statuses "~1.4.0"
 ┊ 993┊1583┊    unpipe "~1.0.0"
 ┊ 994┊1584┊
+┊    ┊1585┊find-up@^3.0.0:
+┊    ┊1586┊  version "3.0.0"
+┊    ┊1587┊  resolved "https://registry.yarnpkg.com/find-up/-/find-up-3.0.0.tgz#49169f1d7993430646da61ecc5ae355c21c97b73"
+┊    ┊1588┊  integrity sha512-1yD6RmLI1XBfxugvORwlck6f75tYL+iR0jqwsOrOxMZyGYqUuDhJ0l4AXdO1iX/FTs9cBAMEk1gWSEx1kSbylg==
+┊    ┊1589┊  dependencies:
+┊    ┊1590┊    locate-path "^3.0.0"
+┊    ┊1591┊
 ┊ 995┊1592┊for-in@^1.0.2:
 ┊ 996┊1593┊  version "1.0.2"
 ┊ 997┊1594┊  resolved "https://registry.yarnpkg.com/for-in/-/for-in-1.0.2.tgz#81068d295a8142ec0ac726c6e2200c30fb6d5e80"
 ┊ 998┊1595┊  integrity sha1-gQaNKVqBQuwKxybG4iAMMPttXoA=
 ┊ 999┊1596┊
+┊    ┊1597┊forever-agent@~0.6.1:
+┊    ┊1598┊  version "0.6.1"
+┊    ┊1599┊  resolved "https://registry.yarnpkg.com/forever-agent/-/forever-agent-0.6.1.tgz#fbc71f0c41adeb37f96c577ad1ed42d8fdacca91"
+┊    ┊1600┊  integrity sha1-+8cfDEGt6zf5bFd60e1C2P2sypE=
+┊    ┊1601┊
+┊    ┊1602┊form-data@~2.3.2:
+┊    ┊1603┊  version "2.3.3"
+┊    ┊1604┊  resolved "https://registry.yarnpkg.com/form-data/-/form-data-2.3.3.tgz#dcce52c05f644f298c6a7ab936bd724ceffbf3a6"
+┊    ┊1605┊  integrity sha512-1lLKB2Mu3aGP1Q/2eCOx0fNbRMe7XdwktwOruhfqqd0rIJWwN4Dh+E3hrPSlDCXnSR7UtZ1N38rVXm+6+MEhJQ==
+┊    ┊1606┊  dependencies:
+┊    ┊1607┊    asynckit "^0.4.0"
+┊    ┊1608┊    combined-stream "^1.0.6"
+┊    ┊1609┊    mime-types "^2.1.12"
+┊    ┊1610┊
 ┊1000┊1611┊forwarded@~0.1.2:
 ┊1001┊1612┊  version "0.1.2"
 ┊1002┊1613┊  resolved "https://registry.yarnpkg.com/forwarded/-/forwarded-0.1.2.tgz#98c23dab1175657b8c0573e8ceccd91b0ff18c84"
```
```diff
@@ -1031,7 +1642,7 @@
 ┊1031┊1642┊  resolved "https://registry.yarnpkg.com/fs.realpath/-/fs.realpath-1.0.0.tgz#1504ad2523158caa40db4a2787cb01411994ea4f"
 ┊1032┊1643┊  integrity sha1-FQStJSMVjKpA20onh8sBQRmU6k8=
 ┊1033┊1644┊
-┊1034┊    ┊fsevents@^1.2.7:
+┊    ┊1645┊fsevents@^1.2.2, fsevents@^1.2.7:
 ┊1035┊1646┊  version "1.2.7"
 ┊1036┊1647┊  resolved "https://registry.yarnpkg.com/fsevents/-/fsevents-1.2.7.tgz#4851b664a3783e52003b3c66eb0eee1074933aa4"
 ┊1037┊1648┊  integrity sha512-Pxm6sI2MeBD7RdD12RYsqaP0nMiwx8eZBXCa6z2L+mRHm2DYrOYwihmhjpkdjUHwQhslWQjRpEgNq4XvBmaAuw==
```
```diff
@@ -1058,16 +1669,35 @@
 ┊1058┊1669┊    strip-ansi "^3.0.1"
 ┊1059┊1670┊    wide-align "^1.1.0"
 ┊1060┊1671┊
+┊    ┊1672┊get-caller-file@^1.0.1:
+┊    ┊1673┊  version "1.0.3"
+┊    ┊1674┊  resolved "https://registry.yarnpkg.com/get-caller-file/-/get-caller-file-1.0.3.tgz#f978fa4c90d1dfe7ff2d6beda2a515e713bdcf4a"
+┊    ┊1675┊  integrity sha512-3t6rVToeoZfYSGd8YoLFR2DJkiQrIiUrGcjvFX2mDw3bn6k2OtwHN0TNCLbBO+w8qTvimhDkv+LSscbJY1vE6w==
+┊    ┊1676┊
 ┊1061┊1677┊get-stream@^3.0.0:
 ┊1062┊1678┊  version "3.0.0"
 ┊1063┊1679┊  resolved "https://registry.yarnpkg.com/get-stream/-/get-stream-3.0.0.tgz#8e943d1358dc37555054ecbe2edb05aa174ede14"
 ┊1064┊1680┊  integrity sha1-jpQ9E1jcN1VQVOy+LtsFqhdO3hQ=
 ┊1065┊1681┊
+┊    ┊1682┊get-stream@^4.0.0:
+┊    ┊1683┊  version "4.1.0"
+┊    ┊1684┊  resolved "https://registry.yarnpkg.com/get-stream/-/get-stream-4.1.0.tgz#c1b255575f3dc21d59bfc79cd3d2b46b1c3a54b5"
+┊    ┊1685┊  integrity sha512-GMat4EJ5161kIy2HevLlr4luNjBgvmj413KaQA7jt4V8B4RDsfpHk7WQ9GVqfYyyx8OS/L66Kox+rJRNklLK7w==
+┊    ┊1686┊  dependencies:
+┊    ┊1687┊    pump "^3.0.0"
+┊    ┊1688┊
 ┊1066┊1689┊get-value@^2.0.3, get-value@^2.0.6:
 ┊1067┊1690┊  version "2.0.6"
 ┊1068┊1691┊  resolved "https://registry.yarnpkg.com/get-value/-/get-value-2.0.6.tgz#dc15ca1c672387ca76bd37ac0a395ba2042a2c28"
 ┊1069┊1692┊  integrity sha1-3BXKHGcjh8p2vTesCjlbogQqLCg=
 ┊1070┊1693┊
+┊    ┊1694┊getpass@^0.1.1:
+┊    ┊1695┊  version "0.1.7"
+┊    ┊1696┊  resolved "https://registry.yarnpkg.com/getpass/-/getpass-0.1.7.tgz#5eff8e3e684d569ae4cb2b1282604e8ba62149fa"
+┊    ┊1697┊  integrity sha1-Xv+OPmhNVprkyysSgmBOi6YhSfo=
+┊    ┊1698┊  dependencies:
+┊    ┊1699┊    assert-plus "^1.0.0"
+┊    ┊1700┊
 ┊1071┊1701┊glob-parent@^3.1.0:
 ┊1072┊1702┊  version "3.1.0"
 ┊1073┊1703┊  resolved "https://registry.yarnpkg.com/glob-parent/-/glob-parent-3.1.0.tgz#9e6af6299d8d3bd2bd40430832bd113df906c5ae"
```
```diff
@@ -1076,7 +1706,7 @@
 ┊1076┊1706┊    is-glob "^3.1.0"
 ┊1077┊1707┊    path-dirname "^1.0.0"
 ┊1078┊1708┊
-┊1079┊    ┊glob@^7.1.3:
+┊    ┊1709┊glob@7.1.3, glob@^7.1.3:
 ┊1080┊1710┊  version "7.1.3"
 ┊1081┊1711┊  resolved "https://registry.yarnpkg.com/glob/-/glob-7.1.3.tgz#3960832d3f1574108342dafd3a67b332c0969df1"
 ┊1082┊1712┊  integrity sha512-vcfuiIxogLV4DlGBHIUOwI0IbrJ8HWPc4MU7HzviGeNho/UJDfi6B5p3sHeWIQ0KGIU0Jpxi5ZHxemQfLkkAwQ==
```
```diff
@@ -1095,6 +1725,11 @@
 ┊1095┊1725┊  dependencies:
 ┊1096┊1726┊    ini "^1.3.4"
 ┊1097┊1727┊
+┊    ┊1728┊globals@^11.1.0:
+┊    ┊1729┊  version "11.11.0"
+┊    ┊1730┊  resolved "https://registry.yarnpkg.com/globals/-/globals-11.11.0.tgz#dcf93757fa2de5486fbeed7118538adf789e9c2e"
+┊    ┊1731┊  integrity sha512-WHq43gS+6ufNOEqlrDBxVEbb8ntfXrfAUU2ZOpCxrBdGKW3gyv8mCxAfIBD0DroPKGrJ2eSsXsLtY9MPntsyTw==
+┊    ┊1732┊
 ┊1098┊1733┊got@^6.7.1:
 ┊1099┊1734┊  version "6.7.1"
 ┊1100┊1735┊  resolved "https://registry.yarnpkg.com/got/-/got-6.7.1.tgz#240cd05785a9a18e561dc1b44b41c763ef1e8db0"
```
```diff
@@ -1117,6 +1752,103 @@
 ┊1117┊1752┊  resolved "https://registry.yarnpkg.com/graceful-fs/-/graceful-fs-4.1.15.tgz#ffb703e1066e8a0eeaa4c8b80ba9253eeefbfb00"
 ┊1118┊1753┊  integrity sha512-6uHUhOPEBgQ24HM+r6b/QwWfZq+yiFcipKFrOFiBEnWdy5sdzYoi+pJeQaPI5qOLRFqWmAXUPQNsielzdLoecA==
 ┊1119┊1754┊
+┊    ┊1755┊graphql-code-generator@^0.16.1:
+┊    ┊1756┊  version "0.16.1"
+┊    ┊1757┊  resolved "https://registry.yarnpkg.com/graphql-code-generator/-/graphql-code-generator-0.16.1.tgz#7220c98dd1cfaaf6022f7e629efefff4c90eb211"
+┊    ┊1758┊  integrity sha512-vp3GKilitpUtiOgJUBk7RhcYtFwy/OffR65mt9NCxeUQr5uDXR3dsb87Na+/opyiobE5JR/P3h6tG01i0G8+CA==
+┊    ┊1759┊  dependencies:
+┊    ┊1760┊    "@types/babylon" "6.16.4"
+┊    ┊1761┊    "@types/is-glob" "4.0.0"
+┊    ┊1762┊    "@types/prettier" "1.15.2"
+┊    ┊1763┊    "@types/valid-url" "1.0.2"
+┊    ┊1764┊    babel-types "7.0.0-beta.3"
+┊    ┊1765┊    babylon "7.0.0-beta.47"
+┊    ┊1766┊    chalk "2.4.2"
+┊    ┊1767┊    change-case "3.1.0"
+┊    ┊1768┊    chokidar "2.0.4"
+┊    ┊1769┊    commander "2.19.0"
+┊    ┊1770┊    common-tags "1.8.0"
+┊    ┊1771┊    detect-indent "5.0.0"
+┊    ┊1772┊    glob "7.1.3"
+┊    ┊1773┊    graphql-codegen-core "0.16.1"
+┊    ┊1774┊    graphql-config "2.2.1"
+┊    ┊1775┊    graphql-import "0.7.1"
+┊    ┊1776┊    graphql-tag-pluck "0.5.0"
+┊    ┊1777┊    graphql-toolkit "0.0.5"
+┊    ┊1778┊    graphql-tools "4.0.4"
+┊    ┊1779┊    indent-string "3.2.0"
+┊    ┊1780┊    inquirer "6.2.2"
+┊    ┊1781┊    is-glob "4.0.0"
+┊    ┊1782┊    is-valid-path "0.1.1"
+┊    ┊1783┊    js-yaml "3.12.1"
+┊    ┊1784┊    json-to-pretty-yaml "1.2.2"
+┊    ┊1785┊    listr "0.14.3"
+┊    ┊1786┊    listr-update-renderer "0.5.0"
+┊    ┊1787┊    log-symbols "2.2.0"
+┊    ┊1788┊    log-update "2.3.0"
+┊    ┊1789┊    mkdirp "0.5.1"
+┊    ┊1790┊    prettier "1.16.3"
+┊    ┊1791┊    request "2.88.0"
+┊    ┊1792┊    valid-url "1.0.9"
+┊    ┊1793┊
+┊    ┊1794┊graphql-codegen-core@0.16.1:
+┊    ┊1795┊  version "0.16.1"
+┊    ┊1796┊  resolved "https://registry.yarnpkg.com/graphql-codegen-core/-/graphql-codegen-core-0.16.1.tgz#3ffe1b901cc8dd5afa53006f17d9114f15a114f1"
+┊    ┊1797┊  integrity sha512-KtvZqvB6no+vPtkIYpYpVSCclT0zfqSVCDZXTYu4GiMV2RdI7C+2/WMhDGPXEj5xwb6jDWaYH23BqiN3kObtrw==
+┊    ┊1798┊  dependencies:
+┊    ┊1799┊    chalk "2.4.2"
+┊    ┊1800┊    change-case "3.1.0"
+┊    ┊1801┊    common-tags "1.8.0"
+┊    ┊1802┊    graphql-tag "2.10.1"
+┊    ┊1803┊    graphql-toolkit "0.0.5"
+┊    ┊1804┊    graphql-tools "4.0.4"
+┊    ┊1805┊    ts-log "2.1.4"
+┊    ┊1806┊    winston "3.2.1"
+┊    ┊1807┊
+┊    ┊1808┊graphql-codegen-plugin-helpers@0.16.1:
+┊    ┊1809┊  version "0.16.1"
+┊    ┊1810┊  resolved "https://registry.yarnpkg.com/graphql-codegen-plugin-helpers/-/graphql-codegen-plugin-helpers-0.16.1.tgz#fa9f2d73b30a63f7db3cc7d1748fc419a679c160"
+┊    ┊1811┊  integrity sha512-VlNOBUoa9u1s0qk1nI7xQYNvQLQNv/XeVaEKIwzxZ9s5UmXYePIABnYzerSXfb8o4zasuQ/7TLvVQn6zqw30pQ==
+┊    ┊1812┊  dependencies:
+┊    ┊1813┊    graphql-codegen-core "0.16.1"
+┊    ┊1814┊    import-from "2.1.0"
+┊    ┊1815┊
+┊    ┊1816┊graphql-codegen-typescript-common@0.16.1, graphql-codegen-typescript-common@^0.16.1:
+┊    ┊1817┊  version "0.16.1"
+┊    ┊1818┊  resolved "https://registry.yarnpkg.com/graphql-codegen-typescript-common/-/graphql-codegen-typescript-common-0.16.1.tgz#8d958ae7d1c62a430763ad232940c336e3e4e4c4"
+┊    ┊1819┊  integrity sha512-WBNGYu84qJ7r677/nEGzERWmbIuHIFTp17MfmOXjh0zJHHmfBapEb7jqjYxDGw7/VVM5SaLDAYddjaU3AvpbPg==
+┊    ┊1820┊  dependencies:
+┊    ┊1821┊    change-case "3.1.0"
+┊    ┊1822┊    common-tags "1.8.0"
+┊    ┊1823┊    graphql-codegen-core "0.16.1"
+┊    ┊1824┊    graphql-codegen-plugin-helpers "0.16.1"
+┊    ┊1825┊
+┊    ┊1826┊graphql-codegen-typescript-resolvers@^0.16.1:
+┊    ┊1827┊  version "0.16.1"
+┊    ┊1828┊  resolved "https://registry.yarnpkg.com/graphql-codegen-typescript-resolvers/-/graphql-codegen-typescript-resolvers-0.16.1.tgz#5273871195f485cae69eebf0da86f02c5ba27f81"
+┊    ┊1829┊  integrity sha512-s226V66bIeID6H6o4LPlcv5bscjbg5Qo76YCVv/WRASzJ94g8Hm+2ZG+fIcG2YT8Ge46C1q2JaKftNav0+yqIA==
+┊    ┊1830┊  dependencies:
+┊    ┊1831┊    graphql-codegen-plugin-helpers "0.16.1"
+┊    ┊1832┊    graphql-codegen-typescript-common "0.16.1"
+┊    ┊1833┊
+┊    ┊1834┊graphql-codegen-typescript-server@^0.16.1:
+┊    ┊1835┊  version "0.16.1"
+┊    ┊1836┊  resolved "https://registry.yarnpkg.com/graphql-codegen-typescript-server/-/graphql-codegen-typescript-server-0.16.1.tgz#d0ddab6487a9700a4b99f867e19666936300b7d7"
+┊    ┊1837┊  integrity sha512-AWetg8DchXfEfqoN1OrgmIM5R7fo9fZKtBruoVmrjb2FXCUWkb1wAxAdSPraMBXn/pGk8rtfq4G9BJ86KK5HZQ==
+┊    ┊1838┊  dependencies:
+┊    ┊1839┊    graphql-codegen-typescript-common "0.16.1"
+┊    ┊1840┊
+┊    ┊1841┊graphql-config@2.2.1:
+┊    ┊1842┊  version "2.2.1"
+┊    ┊1843┊  resolved "https://registry.yarnpkg.com/graphql-config/-/graphql-config-2.2.1.tgz#5fd0ec77ac7428ca5fb2026cf131be10151a0cb2"
+┊    ┊1844┊  integrity sha512-U8+1IAhw9m6WkZRRcyj8ZarK96R6lQBQ0an4lp76Ps9FyhOXENC5YQOxOFGm5CxPrX2rD0g3Je4zG5xdNJjwzQ==
+┊    ┊1845┊  dependencies:
+┊    ┊1846┊    graphql-import "^0.7.1"
+┊    ┊1847┊    graphql-request "^1.5.0"
+┊    ┊1848┊    js-yaml "^3.10.0"
+┊    ┊1849┊    lodash "^4.17.4"
+┊    ┊1850┊    minimatch "^3.0.4"
+┊    ┊1851┊
 ┊1120┊1852┊graphql-extensions@0.5.2:
 ┊1121┊1853┊  version "0.5.2"
 ┊1122┊1854┊  resolved "https://registry.yarnpkg.com/graphql-extensions/-/graphql-extensions-0.5.2.tgz#cdced94c1931c9983fffcc144e336d6cd4d8b02b"
```
```diff
@@ -1124,11 +1856,26 @@
 ┊1124┊1856┊  dependencies:
 ┊1125┊1857┊    "@apollographql/apollo-tools" "^0.3.3"
 ┊1126┊1858┊
+┊    ┊1859┊graphql-import@0.7.1, graphql-import@^0.7.1:
+┊    ┊1860┊  version "0.7.1"
+┊    ┊1861┊  resolved "https://registry.yarnpkg.com/graphql-import/-/graphql-import-0.7.1.tgz#4add8d91a5f752d764b0a4a7a461fcd93136f223"
+┊    ┊1862┊  integrity sha512-YpwpaPjRUVlw2SN3OPljpWbVRWAhMAyfSba5U47qGMOSsPLi2gYeJtngGpymjm9nk57RFWEpjqwh4+dpYuFAPw==
+┊    ┊1863┊  dependencies:
+┊    ┊1864┊    lodash "^4.17.4"
+┊    ┊1865┊    resolve-from "^4.0.0"
+┊    ┊1866┊
 ┊1127┊1867┊graphql-iso-date@^3.6.1:
 ┊1128┊1868┊  version "3.6.1"
 ┊1129┊1869┊  resolved "https://registry.yarnpkg.com/graphql-iso-date/-/graphql-iso-date-3.6.1.tgz#bd2d0dc886e0f954cbbbc496bbf1d480b57ffa96"
 ┊1130┊1870┊  integrity sha512-AwFGIuYMJQXOEAgRlJlFL4H1ncFM8n8XmoVDTNypNOZyQ8LFDG2ppMFlsS862BSTCDcSUfHp8PD3/uJhv7t59Q==
 ┊1131┊1871┊
+┊    ┊1872┊graphql-request@^1.5.0:
+┊    ┊1873┊  version "1.8.2"
+┊    ┊1874┊  resolved "https://registry.yarnpkg.com/graphql-request/-/graphql-request-1.8.2.tgz#398d10ae15c585676741bde3fc01d5ca948f8fbe"
+┊    ┊1875┊  integrity sha512-dDX2M+VMsxXFCmUX0Vo0TopIZIX4ggzOtiCsThgtrKR4niiaagsGTDIHj3fsOMFETpa064vzovI+4YV4QnMbcg==
+┊    ┊1876┊  dependencies:
+┊    ┊1877┊    cross-fetch "2.2.2"
+┊    ┊1878┊
 ┊1132┊1879┊graphql-subscriptions@^1.0.0:
 ┊1133┊1880┊  version "1.0.0"
 ┊1134┊1881┊  resolved "https://registry.yarnpkg.com/graphql-subscriptions/-/graphql-subscriptions-1.0.0.tgz#475267694b3bd465af6477dbab4263a3f62702b8"
```
```diff
@@ -1136,12 +1883,38 @@
 ┊1136┊1883┊  dependencies:
 ┊1137┊1884┊    iterall "^1.2.1"
 ┊1138┊1885┊
-┊1139┊    ┊graphql-tag@^2.9.2:
+┊    ┊1886┊graphql-tag-pluck@0.5.0:
+┊    ┊1887┊  version "0.5.0"
+┊    ┊1888┊  resolved "https://registry.yarnpkg.com/graphql-tag-pluck/-/graphql-tag-pluck-0.5.0.tgz#81f5dee3a6ca829f205ab032336be7b107398b2e"
+┊    ┊1889┊  integrity sha512-SlsIpXKbrKIV2+QxYZ7bFPQ0DpIXFd0BEz3U+Krt8tuHYMFtElcctNDppW4EeQTrSX9H5zpStBZyfOYQjQOH1w==
+┊    ┊1890┊  dependencies:
+┊    ┊1891┊    "@babel/parser" "^7.2.0"
+┊    ┊1892┊    "@babel/traverse" "^7.1.6"
+┊    ┊1893┊    "@babel/types" "^7.2.0"
+┊    ┊1894┊    source-map-support "^0.5.9"
+┊    ┊1895┊    typescript "^3.2.2"
+┊    ┊1896┊
+┊    ┊1897┊graphql-tag@2.10.1, graphql-tag@^2.9.2:
 ┊1140┊1898┊  version "2.10.1"
 ┊1141┊1899┊  resolved "https://registry.yarnpkg.com/graphql-tag/-/graphql-tag-2.10.1.tgz#10aa41f1cd8fae5373eaf11f1f67260a3cad5e02"
 ┊1142┊1900┊  integrity sha512-jApXqWBzNXQ8jYa/HLkZJaVw9jgwNqZkywa2zfFn16Iv1Zb7ELNHkJaXHR7Quvd5SIGsy6Ny7SUKATgnu05uEg==
 ┊1143┊1901┊
-┊1144┊    ┊graphql-tools@^4.0.0:
+┊    ┊1902┊graphql-toolkit@0.0.5:
+┊    ┊1903┊  version "0.0.5"
+┊    ┊1904┊  resolved "https://registry.yarnpkg.com/graphql-toolkit/-/graphql-toolkit-0.0.5.tgz#9e6ebe3d4b33fc329e5ee3b7775bfe7fba2f48a5"
+┊    ┊1905┊  integrity sha512-655RP1y8cn65mOa9EE/jnttczHE0lFXpOV1zYLTsE1A0b5j8RVuKWllSZBnnL2WHSAPPqLZ1oJEZV2uzSdV9VQ==
+┊    ┊1906┊  dependencies:
+┊    ┊1907┊    deepmerge "3.1.0"
+┊    ┊1908┊    glob "7.1.3"
+┊    ┊1909┊    graphql-import "0.7.1"
+┊    ┊1910┊    graphql-tag-pluck "0.5.0"
+┊    ┊1911┊    is-glob "4.0.0"
+┊    ┊1912┊    is-valid-path "0.1.1"
+┊    ┊1913┊    lodash "4.17.11"
+┊    ┊1914┊    request "2.88.0"
+┊    ┊1915┊    valid-url "1.0.9"
+┊    ┊1916┊
+┊    ┊1917┊graphql-tools@4.0.4, graphql-tools@^4.0.0:
 ┊1145┊1918┊  version "4.0.4"
 ┊1146┊1919┊  resolved "https://registry.yarnpkg.com/graphql-tools/-/graphql-tools-4.0.4.tgz#ca08a63454221fdde825fe45fbd315eb2a6d566b"
 ┊1147┊1920┊  integrity sha512-chF12etTIGVVGy3fCTJ1ivJX2KB7OSG4c6UOJQuqOHCmBQwTyNgCDuejZKvpYxNZiEx7bwIjrodDgDe9RIkjlw==
```
```diff
@@ -1169,6 +1942,31 @@
 ┊1169┊1942┊  dependencies:
 ┊1170┊1943┊    iterall "^1.2.2"
 ┊1171┊1944┊
+┊    ┊1945┊har-schema@^2.0.0:
+┊    ┊1946┊  version "2.0.0"
+┊    ┊1947┊  resolved "https://registry.yarnpkg.com/har-schema/-/har-schema-2.0.0.tgz#a94c2224ebcac04782a0d9035521f24735b7ec92"
+┊    ┊1948┊  integrity sha1-qUwiJOvKwEeCoNkDVSHyRzW37JI=
+┊    ┊1949┊
+┊    ┊1950┊har-validator@~5.1.0:
+┊    ┊1951┊  version "5.1.3"
+┊    ┊1952┊  resolved "https://registry.yarnpkg.com/har-validator/-/har-validator-5.1.3.tgz#1ef89ebd3e4996557675eed9893110dc350fa080"
+┊    ┊1953┊  integrity sha512-sNvOCzEQNr/qrvJgc3UG/kD4QtlHycrzwS+6mfTrrSq97BvaYcPZZI1ZSqGSPR73Cxn4LKTD4PttRwfU7jWq5g==
+┊    ┊1954┊  dependencies:
+┊    ┊1955┊    ajv "^6.5.5"
+┊    ┊1956┊    har-schema "^2.0.0"
+┊    ┊1957┊
+┊    ┊1958┊has-ansi@^2.0.0:
+┊    ┊1959┊  version "2.0.0"
+┊    ┊1960┊  resolved "https://registry.yarnpkg.com/has-ansi/-/has-ansi-2.0.0.tgz#34f5049ce1ecdf2b0649af3ef24e45ed35416d91"
+┊    ┊1961┊  integrity sha1-NPUEnOHs3ysGSa8+8k5F7TVBbZE=
+┊    ┊1962┊  dependencies:
+┊    ┊1963┊    ansi-regex "^2.0.0"
+┊    ┊1964┊
+┊    ┊1965┊has-flag@^2.0.0:
+┊    ┊1966┊  version "2.0.0"
+┊    ┊1967┊  resolved "https://registry.yarnpkg.com/has-flag/-/has-flag-2.0.0.tgz#e8207af1cc7b30d446cc70b734b5e8be18f88d51"
+┊    ┊1968┊  integrity sha1-6CB68cx7MNRGzHC3NLXovhj4jVE=
+┊    ┊1969┊
 ┊1172┊1970┊has-flag@^3.0.0:
 ┊1173┊1971┊  version "3.0.0"
 ┊1174┊1972┊  resolved "https://registry.yarnpkg.com/has-flag/-/has-flag-3.0.0.tgz#b5d454dc2199ae225699f3467e5a07f3b955bafd"
```
```diff
@@ -1222,6 +2020,19 @@
 ┊1222┊2020┊  dependencies:
 ┊1223┊2021┊    function-bind "^1.1.1"
 ┊1224┊2022┊
+┊    ┊2023┊header-case@^1.0.0:
+┊    ┊2024┊  version "1.0.1"
+┊    ┊2025┊  resolved "https://registry.yarnpkg.com/header-case/-/header-case-1.0.1.tgz#9535973197c144b09613cd65d317ef19963bd02d"
+┊    ┊2026┊  integrity sha1-lTWXMZfBRLCWE81l0xfvGZY70C0=
+┊    ┊2027┊  dependencies:
+┊    ┊2028┊    no-case "^2.2.0"
+┊    ┊2029┊    upper-case "^1.1.3"
+┊    ┊2030┊
+┊    ┊2031┊hosted-git-info@^2.1.4:
+┊    ┊2032┊  version "2.7.1"
+┊    ┊2033┊  resolved "https://registry.yarnpkg.com/hosted-git-info/-/hosted-git-info-2.7.1.tgz#97f236977bd6e125408930ff6de3eec6281ec047"
+┊    ┊2034┊  integrity sha512-7T/BxH19zbcCTa8XkMlbK5lTo1WtgkFi3GvdWEyNuc4Vex7/9Dqbnpsf4JMydcfj9HCg4zUWFTL3Za6lapg5/w==
+┊    ┊2035┊
 ┊1225┊2036┊http-errors@1.6.3, http-errors@~1.6.2, http-errors@~1.6.3:
 ┊1226┊2037┊  version "1.6.3"
 ┊1227┊2038┊  resolved "https://registry.yarnpkg.com/http-errors/-/http-errors-1.6.3.tgz#8b55680bb4be283a0b5bf4ea2e38580be1d9320d"
```
```diff
@@ -1243,6 +2054,15 @@
 ┊1243┊2054┊    statuses ">= 1.5.0 < 2"
 ┊1244┊2055┊    toidentifier "1.0.0"
 ┊1245┊2056┊
+┊    ┊2057┊http-signature@~1.2.0:
+┊    ┊2058┊  version "1.2.0"
+┊    ┊2059┊  resolved "https://registry.yarnpkg.com/http-signature/-/http-signature-1.2.0.tgz#9aecd925114772f3d95b65a60abb8f7c18fbace1"
+┊    ┊2060┊  integrity sha1-muzZJRFHcvPZW2WmCruPfBj7rOE=
+┊    ┊2061┊  dependencies:
+┊    ┊2062┊    assert-plus "^1.0.0"
+┊    ┊2063┊    jsprim "^1.2.2"
+┊    ┊2064┊    sshpk "^1.7.0"
+┊    ┊2065┊
 ┊1246┊2066┊iconv-lite@0.4.23:
 ┊1247┊2067┊  version "0.4.23"
 ┊1248┊2068┊  resolved "https://registry.yarnpkg.com/iconv-lite/-/iconv-lite-0.4.23.tgz#297871f63be507adcfbfca715d0cd0eed84e9a63"
```
```diff
@@ -1250,7 +2070,7 @@
 ┊1250┊2070┊  dependencies:
 ┊1251┊2071┊    safer-buffer ">= 2.1.2 < 3"
 ┊1252┊2072┊
-┊1253┊    ┊iconv-lite@^0.4.4:
+┊    ┊2073┊iconv-lite@^0.4.24, iconv-lite@^0.4.4:
 ┊1254┊2074┊  version "0.4.24"
 ┊1255┊2075┊  resolved "https://registry.yarnpkg.com/iconv-lite/-/iconv-lite-0.4.24.tgz#2022b4b25fbddc21d2f524974a474aafe733908b"
 ┊1256┊2076┊  integrity sha512-v3MXnZAcvnywkTUEZomIActle7RXXeedOR31wwl7VlyoXO4Qi9arvSenNQWne1TcRwhCL1HwLI21bEqdpj8/rA==
```
```diff
@@ -1269,6 +2089,13 @@
 ┊1269┊2089┊  dependencies:
 ┊1270┊2090┊    minimatch "^3.0.4"
 ┊1271┊2091┊
+┊    ┊2092┊import-from@2.1.0:
+┊    ┊2093┊  version "2.1.0"
+┊    ┊2094┊  resolved "https://registry.yarnpkg.com/import-from/-/import-from-2.1.0.tgz#335db7f2a7affd53aaa471d4b8021dee36b7f3b1"
+┊    ┊2095┊  integrity sha1-M1238qev/VOqpHHUuAId7ja387E=
+┊    ┊2096┊  dependencies:
+┊    ┊2097┊    resolve-from "^3.0.0"
+┊    ┊2098┊
 ┊1272┊2099┊import-lazy@^2.1.0:
 ┊1273┊2100┊  version "2.1.0"
 ┊1274┊2101┊  resolved "https://registry.yarnpkg.com/import-lazy/-/import-lazy-2.1.0.tgz#05698e3d45c88e8d7e9d92cb0584e77f096f3e43"
```
```diff
@@ -1279,6 +2106,11 @@
 ┊1279┊2106┊  resolved "https://registry.yarnpkg.com/imurmurhash/-/imurmurhash-0.1.4.tgz#9218b9b2b928a238b13dc4fb6b6d576f231453ea"
 ┊1280┊2107┊  integrity sha1-khi5srkoojixPcT7a21XbyMUU+o=
 ┊1281┊2108┊
+┊    ┊2109┊indent-string@3.2.0, indent-string@^3.0.0:
+┊    ┊2110┊  version "3.2.0"
+┊    ┊2111┊  resolved "https://registry.yarnpkg.com/indent-string/-/indent-string-3.2.0.tgz#4a5fd6d27cc332f37e5419a504dbb837105c9289"
+┊    ┊2112┊  integrity sha1-Sl/W0nzDMvN+VBmlBNu4NxBckok=
+┊    ┊2113┊
 ┊1282┊2114┊inflight@^1.0.4:
 ┊1283┊2115┊  version "1.0.6"
 ┊1284┊2116┊  resolved "https://registry.yarnpkg.com/inflight/-/inflight-1.0.6.tgz#49bd6331d7d02d0c09bc910a1075ba8165b56df9"
```
```diff
@@ -1297,6 +2129,30 @@
 ┊1297┊2129┊  resolved "https://registry.yarnpkg.com/ini/-/ini-1.3.5.tgz#eee25f56db1c9ec6085e0c22778083f596abf927"
 ┊1298┊2130┊  integrity sha512-RZY5huIKCMRWDUqZlEi72f/lmXKMvuszcMBduliQ3nnWbx9X/ZBQO7DijMEYS9EhHBb2qacRUMtC7svLwe0lcw==
 ┊1299┊2131┊
+┊    ┊2132┊inquirer@6.2.2:
+┊    ┊2133┊  version "6.2.2"
+┊    ┊2134┊  resolved "https://registry.yarnpkg.com/inquirer/-/inquirer-6.2.2.tgz#46941176f65c9eb20804627149b743a218f25406"
+┊    ┊2135┊  integrity sha512-Z2rREiXA6cHRR9KBOarR3WuLlFzlIfAEIiB45ll5SSadMg7WqOh1MKEjjndfuH5ewXdixWCxqnVfGOQzPeiztA==
+┊    ┊2136┊  dependencies:
+┊    ┊2137┊    ansi-escapes "^3.2.0"
+┊    ┊2138┊    chalk "^2.4.2"
+┊    ┊2139┊    cli-cursor "^2.1.0"
+┊    ┊2140┊    cli-width "^2.0.0"
+┊    ┊2141┊    external-editor "^3.0.3"
+┊    ┊2142┊    figures "^2.0.0"
+┊    ┊2143┊    lodash "^4.17.11"
+┊    ┊2144┊    mute-stream "0.0.7"
+┊    ┊2145┊    run-async "^2.2.0"
+┊    ┊2146┊    rxjs "^6.4.0"
+┊    ┊2147┊    string-width "^2.1.0"
+┊    ┊2148┊    strip-ansi "^5.0.0"
+┊    ┊2149┊    through "^2.3.6"
+┊    ┊2150┊
+┊    ┊2151┊invert-kv@^2.0.0:
+┊    ┊2152┊  version "2.0.0"
+┊    ┊2153┊  resolved "https://registry.yarnpkg.com/invert-kv/-/invert-kv-2.0.0.tgz#7393f5afa59ec9ff5f67a27620d11c226e3eec02"
+┊    ┊2154┊  integrity sha512-wPVv/y/QQ/Uiirj/vh3oP+1Ww+AWehmi1g5fFWGPF6IpCBCDVrhgHRMvrLfdYcwDh3QJbGXDW4JAuzxElLSqKA==
+┊    ┊2155┊
 ┊1300┊2156┊ipaddr.js@1.8.0:
 ┊1301┊2157┊  version "1.8.0"
 ┊1302┊2158┊  resolved "https://registry.yarnpkg.com/ipaddr.js/-/ipaddr.js-1.8.0.tgz#eaa33d6ddd7ace8f7f6fe0c9ca0440e706738b1e"
```
```diff
@@ -1316,6 +2172,16 @@
 ┊1316┊2172┊  dependencies:
 ┊1317┊2173┊    kind-of "^6.0.0"
 ┊1318┊2174┊
+┊    ┊2175┊is-arrayish@^0.2.1:
+┊    ┊2176┊  version "0.2.1"
+┊    ┊2177┊  resolved "https://registry.yarnpkg.com/is-arrayish/-/is-arrayish-0.2.1.tgz#77c99840527aa8ecb1a8ba697b80645a7a926a9d"
+┊    ┊2178┊  integrity sha1-d8mYQFJ6qOyxqLppe4BkWnqSap0=
+┊    ┊2179┊
+┊    ┊2180┊is-arrayish@^0.3.1:
+┊    ┊2181┊  version "0.3.2"
+┊    ┊2182┊  resolved "https://registry.yarnpkg.com/is-arrayish/-/is-arrayish-0.3.2.tgz#4574a2ae56f7ab206896fb431eaeed066fdf8f03"
+┊    ┊2183┊  integrity sha512-eVRqCvVlZbuw3GrM63ovNSNAeA1K16kaR/LRY/92w0zxQ5/1YzwblUX652i4Xs9RwAGjW9d9y6X88t8OaAJfWQ==
+┊    ┊2184┊
 ┊1319┊2185┊is-binary-path@^1.0.0:
 ┊1320┊2186┊  version "1.0.1"
 ┊1321┊2187┊  resolved "https://registry.yarnpkg.com/is-binary-path/-/is-binary-path-1.0.1.tgz#75f16642b480f187a711c814161fd3a4a7655898"
```
```diff
@@ -1389,6 +2255,11 @@
 ┊1389┊2255┊  dependencies:
 ┊1390┊2256┊    is-plain-object "^2.0.4"
 ┊1391┊2257┊
+┊    ┊2258┊is-extglob@^1.0.0:
+┊    ┊2259┊  version "1.0.0"
+┊    ┊2260┊  resolved "https://registry.yarnpkg.com/is-extglob/-/is-extglob-1.0.0.tgz#ac468177c4943405a092fc8f29760c6ffc6206c0"
+┊    ┊2261┊  integrity sha1-rEaBd8SUNAWgkvyPKXYMb/xiBsA=
+┊    ┊2262┊
 ┊1392┊2263┊is-extglob@^2.1.0, is-extglob@^2.1.1:
 ┊1393┊2264┊  version "2.1.1"
 ┊1394┊2265┊  resolved "https://registry.yarnpkg.com/is-extglob/-/is-extglob-2.1.1.tgz#a88c02535791f02ed37c76a1b9ea9773c833f8c2"
```
```diff
@@ -1406,6 +2277,20 @@
 ┊1406┊2277┊  resolved "https://registry.yarnpkg.com/is-fullwidth-code-point/-/is-fullwidth-code-point-2.0.0.tgz#a3b30a5c4f199183167aaab93beefae3ddfb654f"
 ┊1407┊2278┊  integrity sha1-o7MKXE8ZkYMWeqq5O+764937ZU8=
 ┊1408┊2279┊
+┊    ┊2280┊is-glob@4.0.0, is-glob@^4.0.0:
+┊    ┊2281┊  version "4.0.0"
+┊    ┊2282┊  resolved "https://registry.yarnpkg.com/is-glob/-/is-glob-4.0.0.tgz#9521c76845cc2610a85203ddf080a958c2ffabc0"
+┊    ┊2283┊  integrity sha1-lSHHaEXMJhCoUgPd8ICpWML/q8A=
+┊    ┊2284┊  dependencies:
+┊    ┊2285┊    is-extglob "^2.1.1"
+┊    ┊2286┊
+┊    ┊2287┊is-glob@^2.0.0:
+┊    ┊2288┊  version "2.0.1"
+┊    ┊2289┊  resolved "https://registry.yarnpkg.com/is-glob/-/is-glob-2.0.1.tgz#d096f926a3ded5600f3fdfd91198cb0888c2d863"
+┊    ┊2290┊  integrity sha1-0Jb5JqPe1WAPP9/ZEZjLCIjC2GM=
+┊    ┊2291┊  dependencies:
+┊    ┊2292┊    is-extglob "^1.0.0"
+┊    ┊2293┊
 ┊1409┊2294┊is-glob@^3.1.0:
 ┊1410┊2295┊  version "3.1.0"
 ┊1411┊2296┊  resolved "https://registry.yarnpkg.com/is-glob/-/is-glob-3.1.0.tgz#7ba5ae24217804ac70707b96922567486cc3e84a"
```
```diff
@@ -1413,13 +2298,6 @@
 ┊1413┊2298┊  dependencies:
 ┊1414┊2299┊    is-extglob "^2.1.0"
 ┊1415┊2300┊
-┊1416┊    ┊is-glob@^4.0.0:
-┊1417┊    ┊  version "4.0.0"
-┊1418┊    ┊  resolved "https://registry.yarnpkg.com/is-glob/-/is-glob-4.0.0.tgz#9521c76845cc2610a85203ddf080a958c2ffabc0"
-┊1419┊    ┊  integrity sha1-lSHHaEXMJhCoUgPd8ICpWML/q8A=
-┊1420┊    ┊  dependencies:
-┊1421┊    ┊    is-extglob "^2.1.1"
-┊1422┊    ┊
 ┊1423┊2301┊is-installed-globally@^0.1.0:
 ┊1424┊2302┊  version "0.1.0"
 ┊1425┊2303┊  resolved "https://registry.yarnpkg.com/is-installed-globally/-/is-installed-globally-0.1.0.tgz#0dfd98f5a9111716dd535dda6492f67bf3d25a80"
```
```diff
@@ -1428,10 +2306,24 @@
 ┊1428┊2306┊    global-dirs "^0.1.0"
 ┊1429┊2307┊    is-path-inside "^1.0.0"
 ┊1430┊2308┊
-┊1431┊    ┊is-npm@^1.0.0:
-┊1432┊    ┊  version "1.0.0"
-┊1433┊    ┊  resolved "https://registry.yarnpkg.com/is-npm/-/is-npm-1.0.0.tgz#f2fb63a65e4905b406c86072765a1a4dc793b9f4"
-┊1434┊    ┊  integrity sha1-8vtjpl5JBbQGyGBydloaTceTufQ=
+┊    ┊2309┊is-invalid-path@^0.1.0:
+┊    ┊2310┊  version "0.1.0"
+┊    ┊2311┊  resolved "https://registry.yarnpkg.com/is-invalid-path/-/is-invalid-path-0.1.0.tgz#307a855b3cf1a938b44ea70d2c61106053714f34"
+┊    ┊2312┊  integrity sha1-MHqFWzzxqTi0TqcNLGEQYFNxTzQ=
+┊    ┊2313┊  dependencies:
+┊    ┊2314┊    is-glob "^2.0.0"
+┊    ┊2315┊
+┊    ┊2316┊is-lower-case@^1.1.0:
+┊    ┊2317┊  version "1.1.3"
+┊    ┊2318┊  resolved "https://registry.yarnpkg.com/is-lower-case/-/is-lower-case-1.1.3.tgz#7e147be4768dc466db3bfb21cc60b31e6ad69393"
+┊    ┊2319┊  integrity sha1-fhR75HaNxGbbO/shzGCzHmrWk5M=
+┊    ┊2320┊  dependencies:
+┊    ┊2321┊    lower-case "^1.1.0"
+┊    ┊2322┊
+┊    ┊2323┊is-npm@^1.0.0:
+┊    ┊2324┊  version "1.0.0"
+┊    ┊2325┊  resolved "https://registry.yarnpkg.com/is-npm/-/is-npm-1.0.0.tgz#f2fb63a65e4905b406c86072765a1a4dc793b9f4"
+┊    ┊2326┊  integrity sha1-8vtjpl5JBbQGyGBydloaTceTufQ=
 ┊1435┊2327┊
 ┊1436┊2328┊is-number@^3.0.0:
 ┊1437┊2329┊  version "3.0.0"
```
```diff
@@ -1445,6 +2337,13 @@
 ┊1445┊2337┊  resolved "https://registry.yarnpkg.com/is-obj/-/is-obj-1.0.1.tgz#3e4729ac1f5fde025cd7d83a896dab9f4f67db0f"
 ┊1446┊2338┊  integrity sha1-PkcprB9f3gJc19g6iW2rn09n2w8=
 ┊1447┊2339┊
+┊    ┊2340┊is-observable@^1.1.0:
+┊    ┊2341┊  version "1.1.0"
+┊    ┊2342┊  resolved "https://registry.yarnpkg.com/is-observable/-/is-observable-1.1.0.tgz#b3e986c8f44de950867cab5403f5a3465005975e"
+┊    ┊2343┊  integrity sha512-NqCa4Sa2d+u7BWc6CukaObG3Fh+CU9bvixbpcXYhy2VvYS7vVGIdAgnIS5Ks3A/cqk4rebLJ9s8zBstT2aKnIA==
+┊    ┊2344┊  dependencies:
+┊    ┊2345┊    symbol-observable "^1.1.0"
+┊    ┊2346┊
 ┊1448┊2347┊is-path-inside@^1.0.0:
 ┊1449┊2348┊  version "1.0.1"
 ┊1450┊2349┊  resolved "https://registry.yarnpkg.com/is-path-inside/-/is-path-inside-1.0.1.tgz#8ef5b7de50437a3fdca6b4e865ef7aa55cb48036"
```
```diff
@@ -1459,6 +2358,11 @@
 ┊1459┊2358┊  dependencies:
 ┊1460┊2359┊    isobject "^3.0.1"
 ┊1461┊2360┊
+┊    ┊2361┊is-promise@^2.1.0:
+┊    ┊2362┊  version "2.1.0"
+┊    ┊2363┊  resolved "https://registry.yarnpkg.com/is-promise/-/is-promise-2.1.0.tgz#79a2a9ece7f096e80f36d2b2f3bc16c1ff4bf3fa"
+┊    ┊2364┊  integrity sha1-eaKp7OfwlugPNtKy87wWwf9L8/o=
+┊    ┊2365┊
 ┊1462┊2366┊is-redirect@^1.0.0:
 ┊1463┊2367┊  version "1.0.0"
 ┊1464┊2368┊  resolved "https://registry.yarnpkg.com/is-redirect/-/is-redirect-1.0.0.tgz#1d03dded53bd8db0f30c26e4f95d36fc7c87dc24"
```
```diff
@@ -1488,6 +2392,25 @@
 ┊1488┊2392┊  dependencies:
 ┊1489┊2393┊    has-symbols "^1.0.0"
 ┊1490┊2394┊
+┊    ┊2395┊is-typedarray@~1.0.0:
+┊    ┊2396┊  version "1.0.0"
+┊    ┊2397┊  resolved "https://registry.yarnpkg.com/is-typedarray/-/is-typedarray-1.0.0.tgz#e479c80858df0c1b11ddda6940f96011fcda4a9a"
+┊    ┊2398┊  integrity sha1-5HnICFjfDBsR3dppQPlgEfzaSpo=
+┊    ┊2399┊
+┊    ┊2400┊is-upper-case@^1.1.0:
+┊    ┊2401┊  version "1.1.2"
+┊    ┊2402┊  resolved "https://registry.yarnpkg.com/is-upper-case/-/is-upper-case-1.1.2.tgz#8d0b1fa7e7933a1e58483600ec7d9661cbaf756f"
+┊    ┊2403┊  integrity sha1-jQsfp+eTOh5YSDYA7H2WYcuvdW8=
+┊    ┊2404┊  dependencies:
+┊    ┊2405┊    upper-case "^1.1.0"
+┊    ┊2406┊
+┊    ┊2407┊is-valid-path@0.1.1:
+┊    ┊2408┊  version "0.1.1"
+┊    ┊2409┊  resolved "https://registry.yarnpkg.com/is-valid-path/-/is-valid-path-0.1.1.tgz#110f9ff74c37f663e1ec7915eb451f2db93ac9df"
+┊    ┊2410┊  integrity sha1-EQ+f90w39mPh7HkV60UfLbk6yd8=
+┊    ┊2411┊  dependencies:
+┊    ┊2412┊    is-invalid-path "^0.1.0"
+┊    ┊2413┊
 ┊1491┊2414┊is-windows@^1.0.2:
 ┊1492┊2415┊  version "1.0.2"
 ┊1493┊2416┊  resolved "https://registry.yarnpkg.com/is-windows/-/is-windows-1.0.2.tgz#d1850eb9791ecd18e6182ce12a30f396634bb19d"
```
```diff
@@ -1515,11 +2438,77 @@
 ┊1515┊2438┊  resolved "https://registry.yarnpkg.com/isobject/-/isobject-3.0.1.tgz#4e431e92b11a9731636aa1f9c8d1ccbcfdab78df"
 ┊1516┊2439┊  integrity sha1-TkMekrEalzFjaqH5yNHMvP2reN8=
 ┊1517┊2440┊
+┊    ┊2441┊isstream@~0.1.2:
+┊    ┊2442┊  version "0.1.2"
+┊    ┊2443┊  resolved "https://registry.yarnpkg.com/isstream/-/isstream-0.1.2.tgz#47e63f7af55afa6f92e1500e690eb8b8529c099a"
+┊    ┊2444┊  integrity sha1-R+Y/evVa+m+S4VAOaQ64uFKcCZo=
+┊    ┊2445┊
 ┊1518┊2446┊iterall@^1.1.3, iterall@^1.2.1, iterall@^1.2.2:
 ┊1519┊2447┊  version "1.2.2"
 ┊1520┊2448┊  resolved "https://registry.yarnpkg.com/iterall/-/iterall-1.2.2.tgz#92d70deb8028e0c39ff3164fdbf4d8b088130cd7"
 ┊1521┊2449┊  integrity sha512-yynBb1g+RFUPY64fTrFv7nsjRrENBQJaX2UL+2Szc9REFrSNm1rpSXHGzhmAy7a9uv3vlvgBlXnf9RqmPH1/DA==
 ┊1522┊2450┊
+┊    ┊2451┊js-tokens@^4.0.0:
+┊    ┊2452┊  version "4.0.0"
+┊    ┊2453┊  resolved "https://registry.yarnpkg.com/js-tokens/-/js-tokens-4.0.0.tgz#19203fb59991df98e3a287050d4647cdeaf32499"
+┊    ┊2454┊  integrity sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==
+┊    ┊2455┊
+┊    ┊2456┊js-yaml@3.12.1, js-yaml@^3.10.0:
+┊    ┊2457┊  version "3.12.1"
+┊    ┊2458┊  resolved "https://registry.yarnpkg.com/js-yaml/-/js-yaml-3.12.1.tgz#295c8632a18a23e054cf5c9d3cecafe678167600"
+┊    ┊2459┊  integrity sha512-um46hB9wNOKlwkHgiuyEVAybXBjwFUV0Z/RaHJblRd9DXltue9FTYvzCr9ErQrK9Adz5MU4gHWVaNUfdmrC8qA==
+┊    ┊2460┊  dependencies:
+┊    ┊2461┊    argparse "^1.0.7"
+┊    ┊2462┊    esprima "^4.0.0"
+┊    ┊2463┊
+┊    ┊2464┊jsbn@~0.1.0:
+┊    ┊2465┊  version "0.1.1"
+┊    ┊2466┊  resolved "https://registry.yarnpkg.com/jsbn/-/jsbn-0.1.1.tgz#a5e654c2e5a2deb5f201d96cefbca80c0ef2f513"
+┊    ┊2467┊  integrity sha1-peZUwuWi3rXyAdls77yoDA7y9RM=
+┊    ┊2468┊
+┊    ┊2469┊jsesc@^2.5.1:
+┊    ┊2470┊  version "2.5.2"
+┊    ┊2471┊  resolved "https://registry.yarnpkg.com/jsesc/-/jsesc-2.5.2.tgz#80564d2e483dacf6e8ef209650a67df3f0c283a4"
+┊    ┊2472┊  integrity sha512-OYu7XEzjkCQ3C5Ps3QIZsQfNpqoJyZZA99wd9aWd05NCtC5pWOkShK2mkL6HXQR6/Cy2lbNdPlZBpuQHXE63gA==
+┊    ┊2473┊
+┊    ┊2474┊json-parse-better-errors@^1.0.1:
+┊    ┊2475┊  version "1.0.2"
+┊    ┊2476┊  resolved "https://registry.yarnpkg.com/json-parse-better-errors/-/json-parse-better-errors-1.0.2.tgz#bb867cfb3450e69107c131d1c514bab3dc8bcaa9"
+┊    ┊2477┊  integrity sha512-mrqyZKfX5EhL7hvqcV6WG1yYjnjeuYDzDhhcAAUrq8Po85NBQBJP+ZDUT75qZQ98IkUoBqdkExkukOU7Ts2wrw==
+┊    ┊2478┊
+┊    ┊2479┊json-schema-traverse@^0.4.1:
+┊    ┊2480┊  version "0.4.1"
+┊    ┊2481┊  resolved "https://registry.yarnpkg.com/json-schema-traverse/-/json-schema-traverse-0.4.1.tgz#69f6a87d9513ab8bb8fe63bdb0979c448e684660"
+┊    ┊2482┊  integrity sha512-xbbCH5dCYU5T8LcEhhuh7HJ88HXuW3qsI3Y0zOZFKfZEHcpWiHU/Jxzk629Brsab/mMiHQti9wMP+845RPe3Vg==
+┊    ┊2483┊
+┊    ┊2484┊json-schema@0.2.3:
+┊    ┊2485┊  version "0.2.3"
+┊    ┊2486┊  resolved "https://registry.yarnpkg.com/json-schema/-/json-schema-0.2.3.tgz#b480c892e59a2f05954ce727bd3f2a4e882f9e13"
+┊    ┊2487┊  integrity sha1-tIDIkuWaLwWVTOcnvT8qTogvnhM=
+┊    ┊2488┊
+┊    ┊2489┊json-stringify-safe@~5.0.1:
+┊    ┊2490┊  version "5.0.1"
+┊    ┊2491┊  resolved "https://registry.yarnpkg.com/json-stringify-safe/-/json-stringify-safe-5.0.1.tgz#1296a2d58fd45f19a0f6ce01d65701e2c735b6eb"
+┊    ┊2492┊  integrity sha1-Epai1Y/UXxmg9s4B1lcB4sc1tus=
+┊    ┊2493┊
+┊    ┊2494┊json-to-pretty-yaml@1.2.2:
+┊    ┊2495┊  version "1.2.2"
+┊    ┊2496┊  resolved "https://registry.yarnpkg.com/json-to-pretty-yaml/-/json-to-pretty-yaml-1.2.2.tgz#f4cd0bd0a5e8fe1df25aaf5ba118b099fd992d5b"
+┊    ┊2497┊  integrity sha1-9M0L0KXo/h3yWq9boRiwmf2ZLVs=
+┊    ┊2498┊  dependencies:
+┊    ┊2499┊    remedial "^1.0.7"
+┊    ┊2500┊    remove-trailing-spaces "^1.0.6"
+┊    ┊2501┊
+┊    ┊2502┊jsprim@^1.2.2:
+┊    ┊2503┊  version "1.4.1"
+┊    ┊2504┊  resolved "https://registry.yarnpkg.com/jsprim/-/jsprim-1.4.1.tgz#313e66bc1e5cc06e438bc1b7499c2e5c56acb6a2"
+┊    ┊2505┊  integrity sha1-MT5mvB5cwG5Di8G3SZwuXFastqI=
+┊    ┊2506┊  dependencies:
+┊    ┊2507┊    assert-plus "1.0.0"
+┊    ┊2508┊    extsprintf "1.3.0"
+┊    ┊2509┊    json-schema "0.2.3"
+┊    ┊2510┊    verror "1.10.0"
+┊    ┊2511┊
 ┊1523┊2512┊kind-of@^3.0.2, kind-of@^3.0.3, kind-of@^3.2.0:
 ┊1524┊2513┊  version "3.2.2"
 ┊1525┊2514┊  resolved "https://registry.yarnpkg.com/kind-of/-/kind-of-3.2.2.tgz#31ea21a734bab9bbb0f32466d893aea51e4a3c64"
```
```diff
@@ -1544,6 +2533,13 @@
 ┊1544┊2533┊  resolved "https://registry.yarnpkg.com/kind-of/-/kind-of-6.0.2.tgz#01146b36a6218e64e58f3a8d66de5d7fc6f6d051"
 ┊1545┊2534┊  integrity sha512-s5kLOcnH0XqDO+FvuaLX8DDjZ18CGFk7VygH40QoKPUQhW4e2rvM0rwUq0t8IQDOwYSeLK01U90OjzBTme2QqA==
 ┊1546┊2535┊
+┊    ┊2536┊kuler@1.0.x:
+┊    ┊2537┊  version "1.0.1"
+┊    ┊2538┊  resolved "https://registry.yarnpkg.com/kuler/-/kuler-1.0.1.tgz#ef7c784f36c9fb6e16dd3150d152677b2b0228a6"
+┊    ┊2539┊  integrity sha512-J9nVUucG1p/skKul6DU3PUZrhs0LPulNaeUOox0IyXDi8S4CztTHs1gQphhuZmzXG7VOQSf6NJfKuzteQLv9gQ==
+┊    ┊2540┊  dependencies:
+┊    ┊2541┊    colornames "^1.1.1"
+┊    ┊2542┊
 ┊1547┊2543┊latest-version@^3.0.0:
 ┊1548┊2544┊  version "3.1.0"
 ┊1549┊2545┊  resolved "https://registry.yarnpkg.com/latest-version/-/latest-version-3.1.0.tgz#a205383fea322b33b5ae3b18abee0dc2f356ee15"
```
```diff
@@ -1551,16 +2547,131 @@
 ┊1551┊2547┊  dependencies:
 ┊1552┊2548┊    package-json "^4.0.0"
 ┊1553┊2549┊
+┊    ┊2550┊lcid@^2.0.0:
+┊    ┊2551┊  version "2.0.0"
+┊    ┊2552┊  resolved "https://registry.yarnpkg.com/lcid/-/lcid-2.0.0.tgz#6ef5d2df60e52f82eb228a4c373e8d1f397253cf"
+┊    ┊2553┊  integrity sha512-avPEb8P8EGnwXKClwsNUgryVjllcRqtMYa49NTsbQagYuT1DcXnl1915oxWjoyGrXR6zH/Y0Zc96xWsPcoDKeA==
+┊    ┊2554┊  dependencies:
+┊    ┊2555┊    invert-kv "^2.0.0"
+┊    ┊2556┊
+┊    ┊2557┊listr-silent-renderer@^1.1.1:
+┊    ┊2558┊  version "1.1.1"
+┊    ┊2559┊  resolved "https://registry.yarnpkg.com/listr-silent-renderer/-/listr-silent-renderer-1.1.1.tgz#924b5a3757153770bf1a8e3fbf74b8bbf3f9242e"
+┊    ┊2560┊  integrity sha1-kktaN1cVN3C/Go4/v3S4u/P5JC4=
+┊    ┊2561┊
+┊    ┊2562┊listr-update-renderer@0.5.0, listr-update-renderer@^0.5.0:
+┊    ┊2563┊  version "0.5.0"
+┊    ┊2564┊  resolved "https://registry.yarnpkg.com/listr-update-renderer/-/listr-update-renderer-0.5.0.tgz#4ea8368548a7b8aecb7e06d8c95cb45ae2ede6a2"
+┊    ┊2565┊  integrity sha512-tKRsZpKz8GSGqoI/+caPmfrypiaq+OQCbd+CovEC24uk1h952lVj5sC7SqyFUm+OaJ5HN/a1YLt5cit2FMNsFA==
+┊    ┊2566┊  dependencies:
+┊    ┊2567┊    chalk "^1.1.3"
+┊    ┊2568┊    cli-truncate "^0.2.1"
+┊    ┊2569┊    elegant-spinner "^1.0.1"
+┊    ┊2570┊    figures "^1.7.0"
+┊    ┊2571┊    indent-string "^3.0.0"
+┊    ┊2572┊    log-symbols "^1.0.2"
+┊    ┊2573┊    log-update "^2.3.0"
+┊    ┊2574┊    strip-ansi "^3.0.1"
+┊    ┊2575┊
+┊    ┊2576┊listr-verbose-renderer@^0.5.0:
+┊    ┊2577┊  version "0.5.0"
+┊    ┊2578┊  resolved "https://registry.yarnpkg.com/listr-verbose-renderer/-/listr-verbose-renderer-0.5.0.tgz#f1132167535ea4c1261102b9f28dac7cba1e03db"
+┊    ┊2579┊  integrity sha512-04PDPqSlsqIOaaaGZ+41vq5FejI9auqTInicFRndCBgE3bXG8D6W1I+mWhk+1nqbHmyhla/6BUrd5OSiHwKRXw==
+┊    ┊2580┊  dependencies:
+┊    ┊2581┊    chalk "^2.4.1"
+┊    ┊2582┊    cli-cursor "^2.1.0"
+┊    ┊2583┊    date-fns "^1.27.2"
+┊    ┊2584┊    figures "^2.0.0"
+┊    ┊2585┊
+┊    ┊2586┊listr@0.14.3:
+┊    ┊2587┊  version "0.14.3"
+┊    ┊2588┊  resolved "https://registry.yarnpkg.com/listr/-/listr-0.14.3.tgz#2fea909604e434be464c50bddba0d496928fa586"
+┊    ┊2589┊  integrity sha512-RmAl7su35BFd/xoMamRjpIE4j3v+L28o8CT5YhAXQJm1fD+1l9ngXY8JAQRJ+tFK2i5njvi0iRUKV09vPwA0iA==
+┊    ┊2590┊  dependencies:
+┊    ┊2591┊    "@samverschueren/stream-to-observable" "^0.3.0"
+┊    ┊2592┊    is-observable "^1.1.0"
+┊    ┊2593┊    is-promise "^2.1.0"
+┊    ┊2594┊    is-stream "^1.1.0"
+┊    ┊2595┊    listr-silent-renderer "^1.1.1"
+┊    ┊2596┊    listr-update-renderer "^0.5.0"
+┊    ┊2597┊    listr-verbose-renderer "^0.5.0"
+┊    ┊2598┊    p-map "^2.0.0"
+┊    ┊2599┊    rxjs "^6.3.3"
+┊    ┊2600┊
+┊    ┊2601┊locate-path@^3.0.0:
+┊    ┊2602┊  version "3.0.0"
+┊    ┊2603┊  resolved "https://registry.yarnpkg.com/locate-path/-/locate-path-3.0.0.tgz#dbec3b3ab759758071b58fe59fc41871af21400e"
+┊    ┊2604┊  integrity sha512-7AO748wWnIhNqAuaty2ZWHkQHRSNfPVIsPIfwEOWO22AmaoVrWavlOcMR5nzTLNYvp36X220/maaRsrec1G65A==
+┊    ┊2605┊  dependencies:
+┊    ┊2606┊    p-locate "^3.0.0"
+┊    ┊2607┊    path-exists "^3.0.0"
+┊    ┊2608┊
+┊    ┊2609┊lodash.debounce@^4.0.8:
+┊    ┊2610┊  version "4.0.8"
+┊    ┊2611┊  resolved "https://registry.yarnpkg.com/lodash.debounce/-/lodash.debounce-4.0.8.tgz#82d79bff30a67c4005ffd5e2515300ad9ca4d7af"
+┊    ┊2612┊  integrity sha1-gteb/zCmfEAF/9XiUVMArZyk168=
+┊    ┊2613┊
 ┊1554┊2614┊lodash.sortby@^4.7.0:
 ┊1555┊2615┊  version "4.7.0"
 ┊1556┊2616┊  resolved "https://registry.yarnpkg.com/lodash.sortby/-/lodash.sortby-4.7.0.tgz#edd14c824e2cc9c1e0b0a1b42bb5210516a42438"
 ┊1557┊2617┊  integrity sha1-7dFMgk4sycHgsKG0K7UhBRakJDg=
 ┊1558┊2618┊
+┊    ┊2619┊lodash@4.17.11, lodash@^4.17.10, lodash@^4.17.11, lodash@^4.17.4, lodash@^4.2.0:
+┊    ┊2620┊  version "4.17.11"
+┊    ┊2621┊  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.11.tgz#b39ea6229ef607ecd89e2c8df12536891cac9b8d"
+┊    ┊2622┊  integrity sha512-cQKh8igo5QUhZ7lg38DYWAxMvjSAKG0A8wGSVimP07SIUEK2UO+arSRKbRZWtelMtN5V0Hkwh5ryOto/SshYIg==
+┊    ┊2623┊
+┊    ┊2624┊log-symbols@2.2.0:
+┊    ┊2625┊  version "2.2.0"
+┊    ┊2626┊  resolved "https://registry.yarnpkg.com/log-symbols/-/log-symbols-2.2.0.tgz#5740e1c5d6f0dfda4ad9323b5332107ef6b4c40a"
+┊    ┊2627┊  integrity sha512-VeIAFslyIerEJLXHziedo2basKbMKtTw3vfn5IzG0XTjhAVEJyNHnL2p7vc+wBDSdQuUpNw3M2u6xb9QsAY5Eg==
+┊    ┊2628┊  dependencies:
+┊    ┊2629┊    chalk "^2.0.1"
+┊    ┊2630┊
+┊    ┊2631┊log-symbols@^1.0.2:
+┊    ┊2632┊  version "1.0.2"
+┊    ┊2633┊  resolved "https://registry.yarnpkg.com/log-symbols/-/log-symbols-1.0.2.tgz#376ff7b58ea3086a0f09facc74617eca501e1a18"
+┊    ┊2634┊  integrity sha1-N2/3tY6jCGoPCfrMdGF+ylAeGhg=
+┊    ┊2635┊  dependencies:
+┊    ┊2636┊    chalk "^1.0.0"
+┊    ┊2637┊
+┊    ┊2638┊log-update@2.3.0, log-update@^2.3.0:
+┊    ┊2639┊  version "2.3.0"
+┊    ┊2640┊  resolved "https://registry.yarnpkg.com/log-update/-/log-update-2.3.0.tgz#88328fd7d1ce7938b29283746f0b1bc126b24708"
+┊    ┊2641┊  integrity sha1-iDKP19HOeTiykoN0bwsbwSayRwg=
+┊    ┊2642┊  dependencies:
+┊    ┊2643┊    ansi-escapes "^3.0.0"
+┊    ┊2644┊    cli-cursor "^2.0.0"
+┊    ┊2645┊    wrap-ansi "^3.0.1"
+┊    ┊2646┊
+┊    ┊2647┊logform@^2.1.1:
+┊    ┊2648┊  version "2.1.2"
+┊    ┊2649┊  resolved "https://registry.yarnpkg.com/logform/-/logform-2.1.2.tgz#957155ebeb67a13164069825ce67ddb5bb2dd360"
+┊    ┊2650┊  integrity sha512-+lZh4OpERDBLqjiwDLpAWNQu6KMjnlXH2ByZwCuSqVPJletw0kTWJf5CgSNAUKn1KUkv3m2cUz/LK8zyEy7wzQ==
+┊    ┊2651┊  dependencies:
+┊    ┊2652┊    colors "^1.2.1"
+┊    ┊2653┊    fast-safe-stringify "^2.0.4"
+┊    ┊2654┊    fecha "^2.3.3"
+┊    ┊2655┊    ms "^2.1.1"
+┊    ┊2656┊    triple-beam "^1.3.0"
+┊    ┊2657┊
 ┊1559┊2658┊long@^4.0.0:
 ┊1560┊2659┊  version "4.0.0"
 ┊1561┊2660┊  resolved "https://registry.yarnpkg.com/long/-/long-4.0.0.tgz#9a7b71cfb7d361a194ea555241c92f7468d5bf28"
 ┊1562┊2661┊  integrity sha512-XsP+KhQif4bjX1kbuSiySJFNAehNxgLb6hPRGJ9QsUr8ajHkuXGdrHmFUTUUXhDwVX2R5bY4JNZEwbUiMhV+MA==
 ┊1563┊2662┊
+┊    ┊2663┊lower-case-first@^1.0.0:
+┊    ┊2664┊  version "1.0.2"
+┊    ┊2665┊  resolved "https://registry.yarnpkg.com/lower-case-first/-/lower-case-first-1.0.2.tgz#e5da7c26f29a7073be02d52bac9980e5922adfa1"
+┊    ┊2666┊  integrity sha1-5dp8JvKacHO+AtUrrJmA5ZIq36E=
+┊    ┊2667┊  dependencies:
+┊    ┊2668┊    lower-case "^1.1.2"
+┊    ┊2669┊
+┊    ┊2670┊lower-case@^1.1.0, lower-case@^1.1.1, lower-case@^1.1.2:
+┊    ┊2671┊  version "1.1.4"
+┊    ┊2672┊  resolved "https://registry.yarnpkg.com/lower-case/-/lower-case-1.1.4.tgz#9a2cabd1b9e8e0ae993a4bf7d5875c39c42e8eac"
+┊    ┊2673┊  integrity sha1-miyr0bno4K6ZOkv31YdcOcQujqw=
+┊    ┊2674┊
 ┊1564┊2675┊lowercase-keys@^1.0.0:
 ┊1565┊2676┊  version "1.0.1"
 ┊1566┊2677┊  resolved "https://registry.yarnpkg.com/lowercase-keys/-/lowercase-keys-1.0.1.tgz#6f9e30b47084d971a7c820ff15a6c5167b74c26f"
```
```diff
@@ -1593,6 +2704,13 @@
 ┊1593┊2704┊  resolved "https://registry.yarnpkg.com/make-error/-/make-error-1.3.5.tgz#efe4e81f6db28cadd605c70f29c831b58ef776c8"
 ┊1594┊2705┊  integrity sha512-c3sIjNUow0+8swNwVpqoH4YCShKNFkMaw6oH1mNS2haDZQqkeZFlHS3dhoeEbKKmJB4vXpJucU6oH75aDYeE9g==
 ┊1595┊2706┊
+┊    ┊2707┊map-age-cleaner@^0.1.1:
+┊    ┊2708┊  version "0.1.3"
+┊    ┊2709┊  resolved "https://registry.yarnpkg.com/map-age-cleaner/-/map-age-cleaner-0.1.3.tgz#7d583a7306434c055fe474b0f45078e6e1b4b92a"
+┊    ┊2710┊  integrity sha512-bJzx6nMoP6PDLPBFmg7+xRKeFZvFboMrGlxmNj9ClvX53KrmvM5bXFXEWjbz4cz1AFn+jWJ9z/DJSz7hrs0w3w==
+┊    ┊2711┊  dependencies:
+┊    ┊2712┊    p-defer "^1.0.0"
+┊    ┊2713┊
 ┊1596┊2714┊map-cache@^0.2.2:
 ┊1597┊2715┊  version "0.2.2"
 ┊1598┊2716┊  resolved "https://registry.yarnpkg.com/map-cache/-/map-cache-0.2.2.tgz#c32abd0bd6525d9b051645bb4f26ac5dc98a0dbf"
```
```diff
@@ -1610,6 +2728,15 @@
 ┊1610┊2728┊  resolved "https://registry.yarnpkg.com/media-typer/-/media-typer-0.3.0.tgz#8710d7af0aa626f8fffa1ce00168545263255748"
 ┊1611┊2729┊  integrity sha1-hxDXrwqmJvj/+hzgAWhUUmMlV0g=
 ┊1612┊2730┊
+┊    ┊2731┊mem@^4.0.0:
+┊    ┊2732┊  version "4.1.0"
+┊    ┊2733┊  resolved "https://registry.yarnpkg.com/mem/-/mem-4.1.0.tgz#aeb9be2d21f47e78af29e4ac5978e8afa2ca5b8a"
+┊    ┊2734┊  integrity sha512-I5u6Q1x7wxO0kdOpYBB28xueHADYps5uty/zg936CiG8NTe5sJL8EjrCuLneuDW3PlMdZBGDIn8BirEVdovZvg==
+┊    ┊2735┊  dependencies:
+┊    ┊2736┊    map-age-cleaner "^0.1.1"
+┊    ┊2737┊    mimic-fn "^1.0.0"
+┊    ┊2738┊    p-is-promise "^2.0.0"
+┊    ┊2739┊
 ┊1613┊2740┊merge-descriptors@1.0.1:
 ┊1614┊2741┊  version "1.0.1"
 ┊1615┊2742┊  resolved "https://registry.yarnpkg.com/merge-descriptors/-/merge-descriptors-1.0.1.tgz#b00aaa556dd8b44568150ec9d1b953f3f90cbb61"
```
```diff
@@ -1644,7 +2771,7 @@
 ┊1644┊2771┊  resolved "https://registry.yarnpkg.com/mime-db/-/mime-db-1.38.0.tgz#1a2aab16da9eb167b49c6e4df2d9c68d63d8e2ad"
 ┊1645┊2772┊  integrity sha512-bqVioMFFzc2awcdJZIzR3HjZFX20QhilVS7hytkKrv7xFAn8bM1gzc/FOX2awLISvWe0PV8ptFKcon+wZ5qYkg==
 ┊1646┊2773┊
-┊1647┊    ┊mime-types@~2.1.18:
+┊    ┊2774┊mime-types@^2.1.12, mime-types@~2.1.18, mime-types@~2.1.19:
 ┊1648┊2775┊  version "2.1.22"
 ┊1649┊2776┊  resolved "https://registry.yarnpkg.com/mime-types/-/mime-types-2.1.22.tgz#fe6b355a190926ab7698c9a0556a11199b2199bd"
 ┊1650┊2777┊  integrity sha512-aGl6TZGnhm/li6F7yx82bJiBZwgiEa4Hf6CNr8YO+r5UHr53tSTYZb102zyU50DOWWKeOv0uQLRL0/9EiKWCog==
```
```diff
@@ -1656,6 +2783,11 @@
 ┊1656┊2783┊  resolved "https://registry.yarnpkg.com/mime/-/mime-1.4.1.tgz#121f9ebc49e3766f311a76e1fa1c8003c4b03aa6"
 ┊1657┊2784┊  integrity sha512-KI1+qOZu5DcW6wayYHSzR/tXKCDC5Om4s1z2QJjDULzLcmf3DvzS7oluY4HCTrc+9FiKmWUgeNLg7W3uIQvxtQ==
 ┊1658┊2785┊
+┊    ┊2786┊mimic-fn@^1.0.0:
+┊    ┊2787┊  version "1.2.0"
+┊    ┊2788┊  resolved "https://registry.yarnpkg.com/mimic-fn/-/mimic-fn-1.2.0.tgz#820c86a39334640e99516928bd03fca88057d022"
+┊    ┊2789┊  integrity sha512-jf84uxzwiuiIVKiOLpfYk7N46TSy8ubTonmneY9vrpHNAnp0QBt2BxWV9dO3/j+BoVAb+a5G6YDPW3M5HOdMWQ==
+┊    ┊2790┊
 ┊1659┊2791┊minimatch@^3.0.4:
 ┊1660┊2792┊  version "3.0.4"
 ┊1661┊2793┊  resolved "https://registry.yarnpkg.com/minimatch/-/minimatch-3.0.4.tgz#5166e286457f03306064be5497e8dbb0c3d32083"
```
```diff
@@ -1696,7 +2828,7 @@
 ┊1696┊2828┊    for-in "^1.0.2"
 ┊1697┊2829┊    is-extendable "^1.0.1"
 ┊1698┊2830┊
-┊1699┊    ┊mkdirp@^0.5.0, mkdirp@^0.5.1:
+┊    ┊2831┊mkdirp@0.5.1, mkdirp@^0.5.0, mkdirp@^0.5.1:
 ┊1700┊2832┊  version "0.5.1"
 ┊1701┊2833┊  resolved "https://registry.yarnpkg.com/mkdirp/-/mkdirp-0.5.1.tgz#30057438eac6cf7f8c4767f38648d6697d75c903"
 ┊1702┊2834┊  integrity sha1-MAV0OOrGz3+MR2fzhkjWaX11yQM=
```
```diff
@@ -1718,6 +2850,11 @@
 ┊1718┊2850┊  resolved "https://registry.yarnpkg.com/ms/-/ms-2.1.1.tgz#30a5864eb3ebb0a66f2ebe6d727af06a09d86e0a"
 ┊1719┊2851┊  integrity sha512-tgp+dl5cGk28utYktBsrFqA7HKgrhgPsg6Z/EfhWI4gl1Hwq8B/GmY/0oXZ6nF8hDVesS/FpnYaD/kOWhYQvyg==
 ┊1720┊2852┊
+┊    ┊2853┊mute-stream@0.0.7:
+┊    ┊2854┊  version "0.0.7"
+┊    ┊2855┊  resolved "https://registry.yarnpkg.com/mute-stream/-/mute-stream-0.0.7.tgz#3075ce93bc21b8fab43e1bc4da7e8115ed1e7bab"
+┊    ┊2856┊  integrity sha1-MHXOk7whuPq0PhvE2n6BFe0ee6s=
+┊    ┊2857┊
 ┊1721┊2858┊nan@^2.9.2:
 ┊1722┊2859┊  version "2.12.1"
 ┊1723┊2860┊  resolved "https://registry.yarnpkg.com/nan/-/nan-2.12.1.tgz#7b1aa193e9aa86057e3c7bbd0ac448e770925552"
```
```diff
@@ -1754,6 +2891,23 @@
 ┊1754┊2891┊  resolved "https://registry.yarnpkg.com/negotiator/-/negotiator-0.6.1.tgz#2b327184e8992101177b28563fb5e7102acd0ca9"
 ┊1755┊2892┊  integrity sha1-KzJxhOiZIQEXeyhWP7XnECrNDKk=
 ┊1756┊2893┊
+┊    ┊2894┊nice-try@^1.0.4:
+┊    ┊2895┊  version "1.0.5"
+┊    ┊2896┊  resolved "https://registry.yarnpkg.com/nice-try/-/nice-try-1.0.5.tgz#a3378a7696ce7d223e88fc9b764bd7ef1089e366"
+┊    ┊2897┊  integrity sha512-1nh45deeb5olNY7eX82BkPO7SSxR5SSYJiPTrTdFUVYwAl8CKMA5N9PjTYkHiRjisVcxcQ1HXdLhx2qxxJzLNQ==
+┊    ┊2898┊
+┊    ┊2899┊no-case@^2.2.0, no-case@^2.3.2:
+┊    ┊2900┊  version "2.3.2"
+┊    ┊2901┊  resolved "https://registry.yarnpkg.com/no-case/-/no-case-2.3.2.tgz#60b813396be39b3f1288a4c1ed5d1e7d28b464ac"
+┊    ┊2902┊  integrity sha512-rmTZ9kz+f3rCvK2TD1Ue/oZlns7OGoIWP4fc3llxxRXlOkHKoWPPWJOfFYpITabSow43QJbRIoHQXtt10VldyQ==
+┊    ┊2903┊  dependencies:
+┊    ┊2904┊    lower-case "^1.1.1"
+┊    ┊2905┊
+┊    ┊2906┊node-fetch@2.1.2:
+┊    ┊2907┊  version "2.1.2"
+┊    ┊2908┊  resolved "https://registry.yarnpkg.com/node-fetch/-/node-fetch-2.1.2.tgz#ab884e8e7e57e38a944753cec706f788d1768bb5"
+┊    ┊2909┊  integrity sha1-q4hOjn5X44qUR1POxwb3iNF2i7U=
+┊    ┊2910┊
 ┊1757┊2911┊node-fetch@^2.1.2, node-fetch@^2.2.0:
 ┊1758┊2912┊  version "2.3.0"
 ┊1759┊2913┊  resolved "https://registry.yarnpkg.com/node-fetch/-/node-fetch-2.3.0.tgz#1a1d940bbfb916a1d3e0219f037e89e71f8c5fa5"
```
```diff
@@ -1806,6 +2960,16 @@
 ┊1806┊2960┊  dependencies:
 ┊1807┊2961┊    abbrev "1"
 ┊1808┊2962┊
+┊    ┊2963┊normalize-package-data@^2.3.2:
+┊    ┊2964┊  version "2.5.0"
+┊    ┊2965┊  resolved "https://registry.yarnpkg.com/normalize-package-data/-/normalize-package-data-2.5.0.tgz#e66db1838b200c1dfc233225d12cb36520e234a8"
+┊    ┊2966┊  integrity sha512-/5CMN3T0R4XTj4DcGaexo+roZSdSFW/0AOOTROrjxzCG1wrWXEsGbRKevjlIL+ZDE4sZlJr5ED4YW0yqmkK+eA==
+┊    ┊2967┊  dependencies:
+┊    ┊2968┊    hosted-git-info "^2.1.4"
+┊    ┊2969┊    resolve "^1.10.0"
+┊    ┊2970┊    semver "2 || 3 || 4 || 5"
+┊    ┊2971┊    validate-npm-package-license "^3.0.1"
+┊    ┊2972┊
 ┊1809┊2973┊normalize-path@^2.1.1:
 ┊1810┊2974┊  version "2.1.1"
 ┊1811┊2975┊  resolved "https://registry.yarnpkg.com/normalize-path/-/normalize-path-2.1.1.tgz#1ab28b556e198363a8c1a6f7e6fa20137fe6aed9"
```
```diff
@@ -1853,6 +3017,11 @@
 ┊1853┊3017┊  resolved "https://registry.yarnpkg.com/number-is-nan/-/number-is-nan-1.0.1.tgz#097b602b53422a522c1afb8790318336941a011d"
 ┊1854┊3018┊  integrity sha1-CXtgK1NCKlIsGvuHkDGDNpQaAR0=
 ┊1855┊3019┊
+┊    ┊3020┊oauth-sign@~0.9.0:
+┊    ┊3021┊  version "0.9.0"
+┊    ┊3022┊  resolved "https://registry.yarnpkg.com/oauth-sign/-/oauth-sign-0.9.0.tgz#47a7b016baa68b5fa0ecf3dee08a85c679ac6455"
+┊    ┊3023┊  integrity sha512-fexhUFFPTGV8ybAtSIGbV6gOkSv8UtRbDBnAyLQw4QPKkgNlsH2ByPGtMUqdWkos6YCRmAqViwgZrJc/mRDzZQ==
+┊    ┊3024┊
 ┊1856┊3025┊object-assign@^4, object-assign@^4.1.0:
 ┊1857┊3026┊  version "4.1.1"
 ┊1858┊3027┊  resolved "https://registry.yarnpkg.com/object-assign/-/object-assign-4.1.1.tgz#2109adc7965887cfc05cbbd442cac8bfbb360863"
```
```diff
@@ -1906,19 +3075,40 @@
 ┊1906┊3075┊  dependencies:
 ┊1907┊3076┊    ee-first "1.1.1"
 ┊1908┊3077┊
-┊1909┊    ┊once@^1.3.0:
+┊    ┊3078┊once@^1.3.0, once@^1.3.1, once@^1.4.0:
 ┊1910┊3079┊  version "1.4.0"
 ┊1911┊3080┊  resolved "https://registry.yarnpkg.com/once/-/once-1.4.0.tgz#583b1aa775961d4b113ac17d9c50baef9dd76bd1"
 ┊1912┊3081┊  integrity sha1-WDsap3WWHUsROsF9nFC6753Xa9E=
 ┊1913┊3082┊  dependencies:
 ┊1914┊3083┊    wrappy "1"
 ┊1915┊3084┊
+┊    ┊3085┊one-time@0.0.4:
+┊    ┊3086┊  version "0.0.4"
+┊    ┊3087┊  resolved "https://registry.yarnpkg.com/one-time/-/one-time-0.0.4.tgz#f8cdf77884826fe4dff93e3a9cc37b1e4480742e"
+┊    ┊3088┊  integrity sha1-+M33eISCb+Tf+T46nMN7HkSAdC4=
+┊    ┊3089┊
+┊    ┊3090┊onetime@^2.0.0:
+┊    ┊3091┊  version "2.0.1"
+┊    ┊3092┊  resolved "https://registry.yarnpkg.com/onetime/-/onetime-2.0.1.tgz#067428230fd67443b2794b22bba528b6867962d4"
+┊    ┊3093┊  integrity sha1-BnQoIw/WdEOyeUsiu6UotoZ5YtQ=
+┊    ┊3094┊  dependencies:
+┊    ┊3095┊    mimic-fn "^1.0.0"
+┊    ┊3096┊
 ┊1916┊3097┊os-homedir@^1.0.0:
 ┊1917┊3098┊  version "1.0.2"
 ┊1918┊3099┊  resolved "https://registry.yarnpkg.com/os-homedir/-/os-homedir-1.0.2.tgz#ffbc4988336e0e833de0c168c7ef152121aa7fb3"
 ┊1919┊3100┊  integrity sha1-/7xJiDNuDoM94MFox+8VISGqf7M=
 ┊1920┊3101┊
-┊1921┊    ┊os-tmpdir@^1.0.0:
+┊    ┊3102┊os-locale@^3.0.0:
+┊    ┊3103┊  version "3.1.0"
+┊    ┊3104┊  resolved "https://registry.yarnpkg.com/os-locale/-/os-locale-3.1.0.tgz#a802a6ee17f24c10483ab9935719cef4ed16bf1a"
+┊    ┊3105┊  integrity sha512-Z8l3R4wYWM40/52Z+S265okfFj8Kt2cC2MKY+xNi3kFs+XGI7WXu/I309QQQYbRW4ijiZ+yxs9pqEhJh0DqW3Q==
+┊    ┊3106┊  dependencies:
+┊    ┊3107┊    execa "^1.0.0"
+┊    ┊3108┊    lcid "^2.0.0"
+┊    ┊3109┊    mem "^4.0.0"
+┊    ┊3110┊
+┊    ┊3111┊os-tmpdir@^1.0.0, os-tmpdir@~1.0.2:
 ┊1922┊3112┊  version "1.0.2"
 ┊1923┊3113┊  resolved "https://registry.yarnpkg.com/os-tmpdir/-/os-tmpdir-1.0.2.tgz#bbe67406c79aa85c5cfec766fe5734555dfa1274"
 ┊1924┊3114┊  integrity sha1-u+Z0BseaqFxc/sdm/lc0VV36EnQ=
```
```diff
@@ -1931,11 +3121,45 @@
 ┊1931┊3121┊    os-homedir "^1.0.0"
 ┊1932┊3122┊    os-tmpdir "^1.0.0"
 ┊1933┊3123┊
+┊    ┊3124┊p-defer@^1.0.0:
+┊    ┊3125┊  version "1.0.0"
+┊    ┊3126┊  resolved "https://registry.yarnpkg.com/p-defer/-/p-defer-1.0.0.tgz#9f6eb182f6c9aa8cd743004a7d4f96b196b0fb0c"
+┊    ┊3127┊  integrity sha1-n26xgvbJqozXQwBKfU+WsZaw+ww=
+┊    ┊3128┊
 ┊1934┊3129┊p-finally@^1.0.0:
 ┊1935┊3130┊  version "1.0.0"
 ┊1936┊3131┊  resolved "https://registry.yarnpkg.com/p-finally/-/p-finally-1.0.0.tgz#3fbcfb15b899a44123b34b6dcc18b724336a2cae"
 ┊1937┊3132┊  integrity sha1-P7z7FbiZpEEjs0ttzBi3JDNqLK4=
 ┊1938┊3133┊
+┊    ┊3134┊p-is-promise@^2.0.0:
+┊    ┊3135┊  version "2.0.0"
+┊    ┊3136┊  resolved "https://registry.yarnpkg.com/p-is-promise/-/p-is-promise-2.0.0.tgz#7554e3d572109a87e1f3f53f6a7d85d1b194f4c5"
+┊    ┊3137┊  integrity sha512-pzQPhYMCAgLAKPWD2jC3Se9fEfrD9npNos0y150EeqZll7akhEgGhTW/slB6lHku8AvYGiJ+YJ5hfHKePPgFWg==
+┊    ┊3138┊
+┊    ┊3139┊p-limit@^2.0.0:
+┊    ┊3140┊  version "2.1.0"
+┊    ┊3141┊  resolved "https://registry.yarnpkg.com/p-limit/-/p-limit-2.1.0.tgz#1d5a0d20fb12707c758a655f6bbc4386b5930d68"
+┊    ┊3142┊  integrity sha512-NhURkNcrVB+8hNfLuysU8enY5xn2KXphsHBaC2YmRNTZRc7RWusw6apSpdEj3jo4CMb6W9nrF6tTnsJsJeyu6g==
+┊    ┊3143┊  dependencies:
+┊    ┊3144┊    p-try "^2.0.0"
+┊    ┊3145┊
+┊    ┊3146┊p-locate@^3.0.0:
+┊    ┊3147┊  version "3.0.0"
+┊    ┊3148┊  resolved "https://registry.yarnpkg.com/p-locate/-/p-locate-3.0.0.tgz#322d69a05c0264b25997d9f40cd8a891ab0064a4"
+┊    ┊3149┊  integrity sha512-x+12w/To+4GFfgJhBEpiDcLozRJGegY+Ei7/z0tSLkMmxGZNybVMSfWj9aJn8Z5Fc7dBUNJOOVgPv2H7IwulSQ==
+┊    ┊3150┊  dependencies:
+┊    ┊3151┊    p-limit "^2.0.0"
+┊    ┊3152┊
+┊    ┊3153┊p-map@^2.0.0:
+┊    ┊3154┊  version "2.0.0"
+┊    ┊3155┊  resolved "https://registry.yarnpkg.com/p-map/-/p-map-2.0.0.tgz#be18c5a5adeb8e156460651421aceca56c213a50"
+┊    ┊3156┊  integrity sha512-GO107XdrSUmtHxVoi60qc9tUl/KkNKm+X2CF4P9amalpGxv5YqVPJNfSb0wcA+syCopkZvYYIzW8OVTQW59x/w==
+┊    ┊3157┊
+┊    ┊3158┊p-try@^2.0.0:
+┊    ┊3159┊  version "2.0.0"
+┊    ┊3160┊  resolved "https://registry.yarnpkg.com/p-try/-/p-try-2.0.0.tgz#85080bb87c64688fa47996fe8f7dfbe8211760b1"
+┊    ┊3161┊  integrity sha512-hMp0onDKIajHfIkdRk3P4CdCmErkYAxxDtP3Wx/4nZ3aGlau2VKh3mZpcuFkH27WQkL/3WBCPOktzA9ZOAnMQQ==
+┊    ┊3162┊
 ┊1939┊3163┊package-json@^4.0.0:
 ┊1940┊3164┊  version "4.0.1"
 ┊1941┊3165┊  resolved "https://registry.yarnpkg.com/package-json/-/package-json-4.0.1.tgz#8869a0401253661c4c4ca3da6c2121ed555f5eed"
```
```diff
@@ -1946,21 +3170,56 @@
 ┊1946┊3170┊    registry-url "^3.0.3"
 ┊1947┊3171┊    semver "^5.1.0"
 ┊1948┊3172┊
+┊    ┊3173┊param-case@^2.1.0:
+┊    ┊3174┊  version "2.1.1"
+┊    ┊3175┊  resolved "https://registry.yarnpkg.com/param-case/-/param-case-2.1.1.tgz#df94fd8cf6531ecf75e6bef9a0858fbc72be2247"
+┊    ┊3176┊  integrity sha1-35T9jPZTHs915r75oIWPvHK+Ikc=
+┊    ┊3177┊  dependencies:
+┊    ┊3178┊    no-case "^2.2.0"
+┊    ┊3179┊
+┊    ┊3180┊parse-json@^4.0.0:
+┊    ┊3181┊  version "4.0.0"
+┊    ┊3182┊  resolved "https://registry.yarnpkg.com/parse-json/-/parse-json-4.0.0.tgz#be35f5425be1f7f6c747184f98a788cb99477ee0"
+┊    ┊3183┊  integrity sha1-vjX1Qlvh9/bHRxhPmKeIy5lHfuA=
+┊    ┊3184┊  dependencies:
+┊    ┊3185┊    error-ex "^1.3.1"
+┊    ┊3186┊    json-parse-better-errors "^1.0.1"
+┊    ┊3187┊
 ┊1949┊3188┊parseurl@~1.3.2:
 ┊1950┊3189┊  version "1.3.2"
 ┊1951┊3190┊  resolved "https://registry.yarnpkg.com/parseurl/-/parseurl-1.3.2.tgz#fc289d4ed8993119460c156253262cdc8de65bf3"
 ┊1952┊3191┊  integrity sha1-/CidTtiZMRlGDBViUyYs3I3mW/M=
 ┊1953┊3192┊
+┊    ┊3193┊pascal-case@^2.0.0:
+┊    ┊3194┊  version "2.0.1"
+┊    ┊3195┊  resolved "https://registry.yarnpkg.com/pascal-case/-/pascal-case-2.0.1.tgz#2d578d3455f660da65eca18ef95b4e0de912761e"
+┊    ┊3196┊  integrity sha1-LVeNNFX2YNpl7KGO+VtODekSdh4=
+┊    ┊3197┊  dependencies:
+┊    ┊3198┊    camel-case "^3.0.0"
+┊    ┊3199┊    upper-case-first "^1.1.0"
+┊    ┊3200┊
 ┊1954┊3201┊pascalcase@^0.1.1:
 ┊1955┊3202┊  version "0.1.1"
 ┊1956┊3203┊  resolved "https://registry.yarnpkg.com/pascalcase/-/pascalcase-0.1.1.tgz#b363e55e8006ca6fe21784d2db22bd15d7917f14"
 ┊1957┊3204┊  integrity sha1-s2PlXoAGym/iF4TS2yK9FdeRfxQ=
 ┊1958┊3205┊
+┊    ┊3206┊path-case@^2.1.0:
+┊    ┊3207┊  version "2.1.1"
+┊    ┊3208┊  resolved "https://registry.yarnpkg.com/path-case/-/path-case-2.1.1.tgz#94b8037c372d3fe2906e465bb45e25d226e8eea5"
+┊    ┊3209┊  integrity sha1-lLgDfDctP+KQbkZbtF4l0ibo7qU=
+┊    ┊3210┊  dependencies:
+┊    ┊3211┊    no-case "^2.2.0"
+┊    ┊3212┊
 ┊1959┊3213┊path-dirname@^1.0.0:
 ┊1960┊3214┊  version "1.0.2"
 ┊1961┊3215┊  resolved "https://registry.yarnpkg.com/path-dirname/-/path-dirname-1.0.2.tgz#cc33d24d525e099a5388c0336c6e32b9160609e0"
 ┊1962┊3216┊  integrity sha1-zDPSTVJeCZpTiMAzbG4yuRYGCeA=
 ┊1963┊3217┊
+┊    ┊3218┊path-exists@^3.0.0:
+┊    ┊3219┊  version "3.0.0"
+┊    ┊3220┊  resolved "https://registry.yarnpkg.com/path-exists/-/path-exists-3.0.0.tgz#ce0ebeaa5f78cb18925ea7d810d7b59b010fd515"
+┊    ┊3221┊  integrity sha1-zg6+ql94yxiSXqfYENe1mwEP1RU=
+┊    ┊3222┊
 ┊1964┊3223┊path-is-absolute@^1.0.0:
 ┊1965┊3224┊  version "1.0.1"
 ┊1966┊3225┊  resolved "https://registry.yarnpkg.com/path-is-absolute/-/path-is-absolute-1.0.1.tgz#174b9268735534ffbc7ace6bf53a5a9e1b5c5f5f"
```
```diff
@@ -1971,16 +3230,26 @@
 ┊1971┊3230┊  resolved "https://registry.yarnpkg.com/path-is-inside/-/path-is-inside-1.0.2.tgz#365417dede44430d1c11af61027facf074bdfc53"
 ┊1972┊3231┊  integrity sha1-NlQX3t5EQw0cEa9hAn+s8HS9/FM=
 ┊1973┊3232┊
-┊1974┊    ┊path-key@^2.0.0:
+┊    ┊3233┊path-key@^2.0.0, path-key@^2.0.1:
 ┊1975┊3234┊  version "2.0.1"
 ┊1976┊3235┊  resolved "https://registry.yarnpkg.com/path-key/-/path-key-2.0.1.tgz#411cadb574c5a140d3a4b1910d40d80cc9f40b40"
 ┊1977┊3236┊  integrity sha1-QRyttXTFoUDTpLGRDUDYDMn0C0A=
 ┊1978┊3237┊
+┊    ┊3238┊path-parse@^1.0.6:
+┊    ┊3239┊  version "1.0.6"
+┊    ┊3240┊  resolved "https://registry.yarnpkg.com/path-parse/-/path-parse-1.0.6.tgz#d62dbb5679405d72c4737ec58600e9ddcf06d24c"
+┊    ┊3241┊  integrity sha512-GSmOT2EbHrINBf9SR7CDELwlJ8AENk3Qn7OikK4nFYAu3Ote2+JYNVvkpAEQm3/TLNEJFD/xZJjzyxg3KBWOzw==
+┊    ┊3242┊
 ┊1979┊3243┊path-to-regexp@0.1.7:
 ┊1980┊3244┊  version "0.1.7"
 ┊1981┊3245┊  resolved "https://registry.yarnpkg.com/path-to-regexp/-/path-to-regexp-0.1.7.tgz#df604178005f522f15eb4490e7247a1bfaa67f8c"
 ┊1982┊3246┊  integrity sha1-32BBeABfUi8V60SQ5yR6G/qmf4w=
 ┊1983┊3247┊
+┊    ┊3248┊performance-now@^2.1.0:
+┊    ┊3249┊  version "2.1.0"
+┊    ┊3250┊  resolved "https://registry.yarnpkg.com/performance-now/-/performance-now-2.1.0.tgz#6309f4e0e5fa913ec1c69307ae364b4b377c9e7b"
+┊    ┊3251┊  integrity sha1-Ywn04OX6kT7BxpMHrjZLSzd8nns=
+┊    ┊3252┊
 ┊1984┊3253┊pify@^3.0.0:
 ┊1985┊3254┊  version "3.0.0"
 ┊1986┊3255┊  resolved "https://registry.yarnpkg.com/pify/-/pify-3.0.0.tgz#e5a4acd2c101fdf3d9a4d07f0dbc4db49dd28176"
```
```diff
@@ -1996,6 +3265,11 @@
 ┊1996┊3265┊  resolved "https://registry.yarnpkg.com/prepend-http/-/prepend-http-1.0.4.tgz#d4f4562b0ce3696e41ac52d0e002e57a635dc6dc"
 ┊1997┊3266┊  integrity sha1-1PRWKwzjaW5BrFLQ4ALlemNdxtw=
 ┊1998┊3267┊
+┊    ┊3268┊prettier@1.16.3:
+┊    ┊3269┊  version "1.16.3"
+┊    ┊3270┊  resolved "https://registry.yarnpkg.com/prettier/-/prettier-1.16.3.tgz#8c62168453badef702f34b45b6ee899574a6a65d"
+┊    ┊3271┊  integrity sha512-kn/GU6SMRYPxUakNXhpP0EedT/KmaPzr0H5lIsDogrykbaxOpOfAFfk5XA7DZrJyMAv1wlMV3CPcZruGXVVUZw==
+┊    ┊3272┊
 ┊1999┊3273┊process-nextick-args@~2.0.0:
 ┊2000┊3274┊  version "2.0.0"
 ┊2001┊3275┊  resolved "https://registry.yarnpkg.com/process-nextick-args/-/process-nextick-args-2.0.0.tgz#a37d732f4271b4ab1ad070d35508e8290788ffaa"
```
```diff
@@ -2033,12 +3307,35 @@
 ┊2033┊3307┊  resolved "https://registry.yarnpkg.com/pseudomap/-/pseudomap-1.0.2.tgz#f052a28da70e618917ef0a8ac34c1ae5a68286b3"
 ┊2034┊3308┊  integrity sha1-8FKijacOYYkX7wqKw0wa5aaChrM=
 ┊2035┊3309┊
+┊    ┊3310┊psl@^1.1.24:
+┊    ┊3311┊  version "1.1.31"
+┊    ┊3312┊  resolved "https://registry.yarnpkg.com/psl/-/psl-1.1.31.tgz#e9aa86d0101b5b105cbe93ac6b784cd547276184"
+┊    ┊3313┊  integrity sha512-/6pt4+C+T+wZUieKR620OpzN/LlnNKuWjy1iFLQ/UG35JqHlR/89MP1d96dUfkf6Dne3TuLQzOYEYshJ+Hx8mw==
+┊    ┊3314┊
 ┊2036┊3315┊pstree.remy@^1.1.6:
 ┊2037┊3316┊  version "1.1.6"
 ┊2038┊3317┊  resolved "https://registry.yarnpkg.com/pstree.remy/-/pstree.remy-1.1.6.tgz#73a55aad9e2d95814927131fbf4dc1b62d259f47"
 ┊2039┊3318┊  integrity sha512-NdF35+QsqD7EgNEI5mkI/X+UwaxVEbQaz9f4IooEmMUv6ZPmlTQYGjBPJGgrlzNdjSvIy4MWMg6Q6vCgBO2K+w==
 ┊2040┊3319┊
-┊2041┊    ┊qs@6.5.2:
+┊    ┊3320┊pump@^3.0.0:
+┊    ┊3321┊  version "3.0.0"
+┊    ┊3322┊  resolved "https://registry.yarnpkg.com/pump/-/pump-3.0.0.tgz#b4a2116815bde2f4e1ea602354e8c75565107a64"
+┊    ┊3323┊  integrity sha512-LwZy+p3SFs1Pytd/jYct4wpv49HiYCqd9Rlc5ZVdk0V+8Yzv6jR5Blk3TRmPL1ft69TxP0IMZGJ+WPFU2BFhww==
+┊    ┊3324┊  dependencies:
+┊    ┊3325┊    end-of-stream "^1.1.0"
+┊    ┊3326┊    once "^1.3.1"
+┊    ┊3327┊
+┊    ┊3328┊punycode@^1.4.1:
+┊    ┊3329┊  version "1.4.1"
+┊    ┊3330┊  resolved "https://registry.yarnpkg.com/punycode/-/punycode-1.4.1.tgz#c0d5a63b2718800ad8e1eb0fa5269c84dd41845e"
+┊    ┊3331┊  integrity sha1-wNWmOycYgArY4esPpSachN1BhF4=
+┊    ┊3332┊
+┊    ┊3333┊punycode@^2.1.0:
+┊    ┊3334┊  version "2.1.1"
+┊    ┊3335┊  resolved "https://registry.yarnpkg.com/punycode/-/punycode-2.1.1.tgz#b58b010ac40c22c5657616c8d2c2c02c7bf479ec"
+┊    ┊3336┊  integrity sha512-XRsRjdf+j5ml+y/6GKHPZbrF/8p2Yga0JPtdqTIY2Xe5ohJPD9saDJJLPvp9+NSBprVvevdXZybnj2cv8OEd0A==
+┊    ┊3337┊
+┊    ┊3338┊qs@6.5.2, qs@~6.5.2:
 ┊2042┊3339┊  version "6.5.2"
 ┊2043┊3340┊  resolved "https://registry.yarnpkg.com/qs/-/qs-6.5.2.tgz#cb3ae806e8740444584ef154ce8ee98d403f3e36"
 ┊2044┊3341┊  integrity sha512-N5ZAX4/LxJmF+7wN74pUD6qAh9/wnvdQcjq9TZjevvXzSUo7bfmw91saqMjzGS2xq91/odN2dW/WOl7qQHNDGA==
```
```diff
@@ -2068,7 +3365,16 @@
 ┊2068┊3365┊    minimist "^1.2.0"
 ┊2069┊3366┊    strip-json-comments "~2.0.1"
 ┊2070┊3367┊
-┊2071┊    ┊readable-stream@^2.0.2, readable-stream@^2.0.6:
+┊    ┊3368┊read-pkg@^4.0.1:
+┊    ┊3369┊  version "4.0.1"
+┊    ┊3370┊  resolved "https://registry.yarnpkg.com/read-pkg/-/read-pkg-4.0.1.tgz#963625378f3e1c4d48c85872b5a6ec7d5d093237"
+┊    ┊3371┊  integrity sha1-ljYlN48+HE1IyFhytabsfV0JMjc=
+┊    ┊3372┊  dependencies:
+┊    ┊3373┊    normalize-package-data "^2.3.2"
+┊    ┊3374┊    parse-json "^4.0.0"
+┊    ┊3375┊    pify "^3.0.0"
+┊    ┊3376┊
+┊    ┊3377┊readable-stream@^2.0.2, readable-stream@^2.0.6, readable-stream@^2.3.6:
 ┊2072┊3378┊  version "2.3.6"
 ┊2073┊3379┊  resolved "https://registry.yarnpkg.com/readable-stream/-/readable-stream-2.3.6.tgz#b11c27d88b8ff1fbe070643cf94b0c79ae1b0aaf"
 ┊2074┊3380┊  integrity sha512-tQtKA9WIAhBF3+VLAseyMqZeBjW0AHJoxOtYqSUZNJxauErmLbVm2FW1y+J/YA9dUrAC39ITejlZWhVIwawkKw==
```
```diff
@@ -2081,7 +3387,16 @@
 ┊2081┊3387┊    string_decoder "~1.1.1"
 ┊2082┊3388┊    util-deprecate "~1.0.1"
 ┊2083┊3389┊
-┊2084┊    ┊readdirp@^2.2.1:
+┊    ┊3390┊readable-stream@^3.1.1:
+┊    ┊3391┊  version "3.1.1"
+┊    ┊3392┊  resolved "https://registry.yarnpkg.com/readable-stream/-/readable-stream-3.1.1.tgz#ed6bbc6c5ba58b090039ff18ce670515795aeb06"
+┊    ┊3393┊  integrity sha512-DkN66hPyqDhnIQ6Jcsvx9bFjhw214O4poMBcIMgPVpQvNy9a0e0Uhg5SqySyDKAmUlwt8LonTBz1ezOnM8pUdA==
+┊    ┊3394┊  dependencies:
+┊    ┊3395┊    inherits "^2.0.3"
+┊    ┊3396┊    string_decoder "^1.1.1"
+┊    ┊3397┊    util-deprecate "^1.0.1"
+┊    ┊3398┊
+┊    ┊3399┊readdirp@^2.0.0, readdirp@^2.2.1:
 ┊2085┊3400┊  version "2.2.1"
 ┊2086┊3401┊  resolved "https://registry.yarnpkg.com/readdirp/-/readdirp-2.2.1.tgz#0e87622a3325aa33e892285caf8b4e846529a525"
 ┊2087┊3402┊  integrity sha512-1JU/8q+VgFZyxwrJ+SVIOsh+KywWGpds3NTqikiKpDMZWScmAYyKIgqkO+ARvNWJfXeXR1zxz7aHF4u4CyH6vQ==
```
```diff
@@ -2113,11 +3428,21 @@
 ┊2113┊3428┊  dependencies:
 ┊2114┊3429┊    rc "^1.0.1"
 ┊2115┊3430┊
+┊    ┊3431┊remedial@^1.0.7:
+┊    ┊3432┊  version "1.0.8"
+┊    ┊3433┊  resolved "https://registry.yarnpkg.com/remedial/-/remedial-1.0.8.tgz#a5e4fd52a0e4956adbaf62da63a5a46a78c578a0"
+┊    ┊3434┊  integrity sha512-/62tYiOe6DzS5BqVsNpH/nkGlX45C/Sp6V+NtiN6JQNS1Viay7cWkazmRkrQrdFj2eshDe96SIQNIoMxqhzBOg==
+┊    ┊3435┊
 ┊2116┊3436┊remove-trailing-separator@^1.0.1:
 ┊2117┊3437┊  version "1.1.0"
 ┊2118┊3438┊  resolved "https://registry.yarnpkg.com/remove-trailing-separator/-/remove-trailing-separator-1.1.0.tgz#c24bce2a283adad5bc3f58e0d48249b92379d8ef"
 ┊2119┊3439┊  integrity sha1-wkvOKig62tW8P1jg1IJJuSN52O8=
 ┊2120┊3440┊
+┊    ┊3441┊remove-trailing-spaces@^1.0.6:
+┊    ┊3442┊  version "1.0.7"
+┊    ┊3443┊  resolved "https://registry.yarnpkg.com/remove-trailing-spaces/-/remove-trailing-spaces-1.0.7.tgz#491f04e11d98880714d12429b0d0938cbe030ae6"
+┊    ┊3444┊  integrity sha512-wjM17CJ2kk0SgoGyJ7ZMzRRCuTq+V8YhMwpZ5XEWX0uaked2OUq6utvHXGNBQrfkUzUUABFMyxlKn+85hMv4dg==
+┊    ┊3445┊
 ┊2121┊3446┊repeat-element@^1.1.2:
 ┊2122┊3447┊  version "1.1.3"
 ┊2123┊3448┊  resolved "https://registry.yarnpkg.com/repeat-element/-/repeat-element-1.1.3.tgz#782e0d825c0c5a3bb39731f84efee6b742e6b1ce"
```
```diff
@@ -2128,11 +3453,72 @@
 ┊2128┊3453┊  resolved "https://registry.yarnpkg.com/repeat-string/-/repeat-string-1.6.1.tgz#8dcae470e1c88abc2d600fff4a776286da75e637"
 ┊2129┊3454┊  integrity sha1-jcrkcOHIirwtYA//Sndihtp15jc=
 ┊2130┊3455┊
+┊    ┊3456┊request@2.88.0:
+┊    ┊3457┊  version "2.88.0"
+┊    ┊3458┊  resolved "https://registry.yarnpkg.com/request/-/request-2.88.0.tgz#9c2fca4f7d35b592efe57c7f0a55e81052124fef"
+┊    ┊3459┊  integrity sha512-NAqBSrijGLZdM0WZNsInLJpkJokL72XYjUpnB0iwsRgxh7dB6COrHnTBNwN0E+lHDAJzu7kLAkDeY08z2/A0hg==
+┊    ┊3460┊  dependencies:
+┊    ┊3461┊    aws-sign2 "~0.7.0"
+┊    ┊3462┊    aws4 "^1.8.0"
+┊    ┊3463┊    caseless "~0.12.0"
+┊    ┊3464┊    combined-stream "~1.0.6"
+┊    ┊3465┊    extend "~3.0.2"
+┊    ┊3466┊    forever-agent "~0.6.1"
+┊    ┊3467┊    form-data "~2.3.2"
+┊    ┊3468┊    har-validator "~5.1.0"
+┊    ┊3469┊    http-signature "~1.2.0"
+┊    ┊3470┊    is-typedarray "~1.0.0"
+┊    ┊3471┊    isstream "~0.1.2"
+┊    ┊3472┊    json-stringify-safe "~5.0.1"
+┊    ┊3473┊    mime-types "~2.1.19"
+┊    ┊3474┊    oauth-sign "~0.9.0"
+┊    ┊3475┊    performance-now "^2.1.0"
+┊    ┊3476┊    qs "~6.5.2"
+┊    ┊3477┊    safe-buffer "^5.1.2"
+┊    ┊3478┊    tough-cookie "~2.4.3"
+┊    ┊3479┊    tunnel-agent "^0.6.0"
+┊    ┊3480┊    uuid "^3.3.2"
+┊    ┊3481┊
+┊    ┊3482┊require-directory@^2.1.1:
+┊    ┊3483┊  version "2.1.1"
+┊    ┊3484┊  resolved "https://registry.yarnpkg.com/require-directory/-/require-directory-2.1.1.tgz#8c64ad5fd30dab1c976e2344ffe7f792a6a6df42"
+┊    ┊3485┊  integrity sha1-jGStX9MNqxyXbiNE/+f3kqam30I=
+┊    ┊3486┊
+┊    ┊3487┊require-main-filename@^1.0.1:
+┊    ┊3488┊  version "1.0.1"
+┊    ┊3489┊  resolved "https://registry.yarnpkg.com/require-main-filename/-/require-main-filename-1.0.1.tgz#97f717b69d48784f5f526a6c5aa8ffdda055a4d1"
+┊    ┊3490┊  integrity sha1-l/cXtp1IeE9fUmpsWqj/3aBVpNE=
+┊    ┊3491┊
+┊    ┊3492┊resolve-from@^3.0.0:
+┊    ┊3493┊  version "3.0.0"
+┊    ┊3494┊  resolved "https://registry.yarnpkg.com/resolve-from/-/resolve-from-3.0.0.tgz#b22c7af7d9d6881bc8b6e653335eebcb0a188748"
+┊    ┊3495┊  integrity sha1-six699nWiBvItuZTM17rywoYh0g=
+┊    ┊3496┊
+┊    ┊3497┊resolve-from@^4.0.0:
+┊    ┊3498┊  version "4.0.0"
+┊    ┊3499┊  resolved "https://registry.yarnpkg.com/resolve-from/-/resolve-from-4.0.0.tgz#4abcd852ad32dd7baabfe9b40e00a36db5f392e6"
+┊    ┊3500┊  integrity sha512-pb/MYmXstAkysRFx8piNI1tGFNQIFA3vkE3Gq4EuA1dF6gHp/+vgZqsCGJapvy8N3Q+4o7FwvquPJcnZ7RYy4g==
+┊    ┊3501┊
 ┊2131┊3502┊resolve-url@^0.2.1:
 ┊2132┊3503┊  version "0.2.1"
 ┊2133┊3504┊  resolved "https://registry.yarnpkg.com/resolve-url/-/resolve-url-0.2.1.tgz#2c637fe77c893afd2a663fe21aa9080068e2052a"
 ┊2134┊3505┊  integrity sha1-LGN/53yJOv0qZj/iGqkIAGjiBSo=
 ┊2135┊3506┊
+┊    ┊3507┊resolve@^1.10.0:
+┊    ┊3508┊  version "1.10.0"
+┊    ┊3509┊  resolved "https://registry.yarnpkg.com/resolve/-/resolve-1.10.0.tgz#3bdaaeaf45cc07f375656dfd2e54ed0810b101ba"
+┊    ┊3510┊  integrity sha512-3sUr9aq5OfSg2S9pNtPA9hL1FVEAjvfOC4leW0SNf/mpnaakz2a9femSd6LqAww2RaFctwyf1lCqnTHuF1rxDg==
+┊    ┊3511┊  dependencies:
+┊    ┊3512┊    path-parse "^1.0.6"
+┊    ┊3513┊
+┊    ┊3514┊restore-cursor@^2.0.0:
+┊    ┊3515┊  version "2.0.0"
+┊    ┊3516┊  resolved "https://registry.yarnpkg.com/restore-cursor/-/restore-cursor-2.0.0.tgz#9f7ee287f82fd326d4fd162923d62129eee0dfaf"
+┊    ┊3517┊  integrity sha1-n37ih/gv0ybU/RYpI9YhKe7g368=
+┊    ┊3518┊  dependencies:
+┊    ┊3519┊    onetime "^2.0.0"
+┊    ┊3520┊    signal-exit "^3.0.2"
+┊    ┊3521┊
 ┊2136┊3522┊ret@~0.1.10:
 ┊2137┊3523┊  version "0.1.15"
 ┊2138┊3524┊  resolved "https://registry.yarnpkg.com/ret/-/ret-0.1.15.tgz#b8a4825d5bdb1fc3f6f53c2bc33f81388681c7bc"
```
```diff
@@ -2150,6 +3536,20 @@
 ┊2150┊3536┊  dependencies:
 ┊2151┊3537┊    glob "^7.1.3"
 ┊2152┊3538┊
+┊    ┊3539┊run-async@^2.2.0:
+┊    ┊3540┊  version "2.3.0"
+┊    ┊3541┊  resolved "https://registry.yarnpkg.com/run-async/-/run-async-2.3.0.tgz#0371ab4ae0bdd720d4166d7dfda64ff7a445a6c0"
+┊    ┊3542┊  integrity sha1-A3GrSuC91yDUFm19/aZP96RFpsA=
+┊    ┊3543┊  dependencies:
+┊    ┊3544┊    is-promise "^2.1.0"
+┊    ┊3545┊
+┊    ┊3546┊rxjs@^6.3.3, rxjs@^6.4.0:
+┊    ┊3547┊  version "6.4.0"
+┊    ┊3548┊  resolved "https://registry.yarnpkg.com/rxjs/-/rxjs-6.4.0.tgz#f3bb0fe7bda7fb69deac0c16f17b50b0b8790504"
+┊    ┊3549┊  integrity sha512-Z9Yfa11F6B9Sg/BK9MnqnQ+aQYicPLtilXBp2yUtDt2JRCE0h26d33EnfO3ZxoNxG0T92OUucP3Ct7cpfkdFfw==
+┊    ┊3550┊  dependencies:
+┊    ┊3551┊    tslib "^1.9.0"
+┊    ┊3552┊
 ┊2153┊3553┊safe-buffer@5.1.2, safe-buffer@^5.0.1, safe-buffer@^5.1.2, safe-buffer@~5.1.0, safe-buffer@~5.1.1:
 ┊2154┊3554┊  version "5.1.2"
 ┊2155┊3555┊  resolved "https://registry.yarnpkg.com/safe-buffer/-/safe-buffer-5.1.2.tgz#991ec69d296e0313747d59bdfd2b745c35f8828d"
```
```diff
@@ -2162,7 +3562,7 @@
 ┊2162┊3562┊  dependencies:
 ┊2163┊3563┊    ret "~0.1.10"
 ┊2164┊3564┊
-┊2165┊    ┊"safer-buffer@>= 2.1.2 < 3":
+┊    ┊3565┊"safer-buffer@>= 2.1.2 < 3", safer-buffer@^2.0.2, safer-buffer@^2.1.0, safer-buffer@~2.1.0:
 ┊2166┊3566┊  version "2.1.2"
 ┊2167┊3567┊  resolved "https://registry.yarnpkg.com/safer-buffer/-/safer-buffer-2.1.2.tgz#44fa161b0187b9549dd84bb91802f9bd8385cd6a"
 ┊2168┊3568┊  integrity sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==
```
```diff
@@ -2179,7 +3579,7 @@
 ┊2179┊3579┊  dependencies:
 ┊2180┊3580┊    semver "^5.0.3"
 ┊2181┊3581┊
-┊2182┊    ┊semver@^5.0.3, semver@^5.1.0, semver@^5.3.0, semver@^5.5.0:
+┊    ┊3582┊"semver@2 || 3 || 4 || 5", semver@^5.0.3, semver@^5.1.0, semver@^5.3.0, semver@^5.5.0:
 ┊2183┊3583┊  version "5.6.0"
 ┊2184┊3584┊  resolved "https://registry.yarnpkg.com/semver/-/semver-5.6.0.tgz#7e74256fbaa49c75aa7c7a205cc22799cac80004"
 ┊2185┊3585┊  integrity sha512-RS9R6R35NYgQn++fkDWaOmqGoj4Ek9gGs+DPxNUZKuwE183xjJroKvyo1IzVFeXvUrvmALy6FWD5xrdJT25gMg==
```
```diff
@@ -2203,6 +3603,14 @@
 ┊2203┊3603┊    range-parser "~1.2.0"
 ┊2204┊3604┊    statuses "~1.4.0"
 ┊2205┊3605┊
+┊    ┊3606┊sentence-case@^2.1.0:
+┊    ┊3607┊  version "2.1.1"
+┊    ┊3608┊  resolved "https://registry.yarnpkg.com/sentence-case/-/sentence-case-2.1.1.tgz#1f6e2dda39c168bf92d13f86d4a918933f667ed4"
+┊    ┊3609┊  integrity sha1-H24t2jnBaL+S0T+G1KkYkz9mftQ=
+┊    ┊3610┊  dependencies:
+┊    ┊3611┊    no-case "^2.2.0"
+┊    ┊3612┊    upper-case-first "^1.1.2"
+┊    ┊3613┊
 ┊2206┊3614┊serve-static@1.13.2:
 ┊2207┊3615┊  version "1.13.2"
 ┊2208┊3616┊  resolved "https://registry.yarnpkg.com/serve-static/-/serve-static-1.13.2.tgz#095e8472fd5b46237db50ce486a43f4b86c6cec1"
```
```diff
@@ -2213,7 +3621,7 @@
 ┊2213┊3621┊    parseurl "~1.3.2"
 ┊2214┊3622┊    send "0.16.2"
 ┊2215┊3623┊
-┊2216┊    ┊set-blocking@~2.0.0:
+┊    ┊3624┊set-blocking@^2.0.0, set-blocking@~2.0.0:
 ┊2217┊3625┊  version "2.0.0"
 ┊2218┊3626┊  resolved "https://registry.yarnpkg.com/set-blocking/-/set-blocking-2.0.0.tgz#045f9782d011ae9a6803ddd382b24392b3d890f7"
 ┊2219┊3627┊  integrity sha1-BF+XgtARrppoA93TgrJDkrPYkPc=
```
```diff
@@ -2273,6 +3681,25 @@
 ┊2273┊3681┊  resolved "https://registry.yarnpkg.com/signal-exit/-/signal-exit-3.0.2.tgz#b5fdc08f1287ea1178628e415e25132b73646c6d"
 ┊2274┊3682┊  integrity sha1-tf3AjxKH6hF4Yo5BXiUTK3NkbG0=
 ┊2275┊3683┊
+┊    ┊3684┊simple-swizzle@^0.2.2:
+┊    ┊3685┊  version "0.2.2"
+┊    ┊3686┊  resolved "https://registry.yarnpkg.com/simple-swizzle/-/simple-swizzle-0.2.2.tgz#a4da6b635ffcccca33f70d17cb92592de95e557a"
+┊    ┊3687┊  integrity sha1-pNprY1/8zMoz9w0Xy5JZLeleVXo=
+┊    ┊3688┊  dependencies:
+┊    ┊3689┊    is-arrayish "^0.3.1"
+┊    ┊3690┊
+┊    ┊3691┊slice-ansi@0.0.4:
+┊    ┊3692┊  version "0.0.4"
+┊    ┊3693┊  resolved "https://registry.yarnpkg.com/slice-ansi/-/slice-ansi-0.0.4.tgz#edbf8903f66f7ce2f8eafd6ceed65e264c831b35"
+┊    ┊3694┊  integrity sha1-7b+JA/ZvfOL46v1s7tZeJkyDGzU=
+┊    ┊3695┊
+┊    ┊3696┊snake-case@^2.1.0:
+┊    ┊3697┊  version "2.1.0"
+┊    ┊3698┊  resolved "https://registry.yarnpkg.com/snake-case/-/snake-case-2.1.0.tgz#41bdb1b73f30ec66a04d4e2cad1b76387d4d6d9f"
+┊    ┊3699┊  integrity sha1-Qb2xtz8w7GagTU4srRt2OH1NbZ8=
+┊    ┊3700┊  dependencies:
+┊    ┊3701┊    no-case "^2.2.0"
+┊    ┊3702┊
 ┊2276┊3703┊snapdragon-node@^2.0.1:
 ┊2277┊3704┊  version "2.1.1"
 ┊2278┊3705┊  resolved "https://registry.yarnpkg.com/snapdragon-node/-/snapdragon-node-2.1.1.tgz#6c175f86ff14bdb0724563e8f3c1b021a286853b"
```
```diff
@@ -2314,7 +3741,7 @@
 ┊2314┊3741┊    source-map-url "^0.4.0"
 ┊2315┊3742┊    urix "^0.1.0"
 ┊2316┊3743┊
-┊2317┊    ┊source-map-support@^0.5.6:
+┊    ┊3744┊source-map-support@^0.5.6, source-map-support@^0.5.9:
 ┊2318┊3745┊  version "0.5.10"
 ┊2319┊3746┊  resolved "https://registry.yarnpkg.com/source-map-support/-/source-map-support-0.5.10.tgz#2214080bc9d51832511ee2bab96e3c2f9353120c"
 ┊2320┊3747┊  integrity sha512-YfQ3tQFTK/yzlGJuX8pTwa4tifQj4QS2Mj7UegOu8jAz59MqIiMGPXxQhVQiIMNzayuUSF/jEuVnfFF5JqybmQ==
```
```diff
@@ -2327,7 +3754,7 @@
 ┊2327┊3754┊  resolved "https://registry.yarnpkg.com/source-map-url/-/source-map-url-0.4.0.tgz#3e935d7ddd73631b97659956d55128e87b5084a3"
 ┊2328┊3755┊  integrity sha1-PpNdfd1zYxuXZZlW1VEo6HtQhKM=
 ┊2329┊3756┊
-┊2330┊    ┊source-map@^0.5.6:
+┊    ┊3757┊source-map@^0.5.0, source-map@^0.5.6:
 ┊2331┊3758┊  version "0.5.7"
 ┊2332┊3759┊  resolved "https://registry.yarnpkg.com/source-map/-/source-map-0.5.7.tgz#8a039d2d1021d22d1ea14c80d8ea468ba2ef3fcc"
 ┊2333┊3760┊  integrity sha1-igOdLRAh0i0eoUyA2OpGi6LvP8w=
```
```diff
@@ -2337,6 +3764,37 @@
 ┊2337┊3764┊  resolved "https://registry.yarnpkg.com/source-map/-/source-map-0.6.1.tgz#74722af32e9614e9c287a8d0bbde48b5e2f1a263"
 ┊2338┊3765┊  integrity sha512-UjgapumWlbMhkBgzT7Ykc5YXUT46F0iKu8SGXq0bcwP5dz/h0Plj6enJqjz1Zbq2l5WaqYnrVbwWOWMyF3F47g==
 ┊2339┊3766┊
+┊    ┊3767┊spawn-command@^0.0.2-1:
+┊    ┊3768┊  version "0.0.2-1"
+┊    ┊3769┊  resolved "https://registry.yarnpkg.com/spawn-command/-/spawn-command-0.0.2-1.tgz#62f5e9466981c1b796dc5929937e11c9c6921bd0"
+┊    ┊3770┊  integrity sha1-YvXpRmmBwbeW3Fkpk34RycaSG9A=
+┊    ┊3771┊
+┊    ┊3772┊spdx-correct@^3.0.0:
+┊    ┊3773┊  version "3.1.0"
+┊    ┊3774┊  resolved "https://registry.yarnpkg.com/spdx-correct/-/spdx-correct-3.1.0.tgz#fb83e504445268f154b074e218c87c003cd31df4"
+┊    ┊3775┊  integrity sha512-lr2EZCctC2BNR7j7WzJ2FpDznxky1sjfxvvYEyzxNyb6lZXHODmEoJeFu4JupYlkfha1KZpJyoqiJ7pgA1qq8Q==
+┊    ┊3776┊  dependencies:
+┊    ┊3777┊    spdx-expression-parse "^3.0.0"
+┊    ┊3778┊    spdx-license-ids "^3.0.0"
+┊    ┊3779┊
+┊    ┊3780┊spdx-exceptions@^2.1.0:
+┊    ┊3781┊  version "2.2.0"
+┊    ┊3782┊  resolved "https://registry.yarnpkg.com/spdx-exceptions/-/spdx-exceptions-2.2.0.tgz#2ea450aee74f2a89bfb94519c07fcd6f41322977"
+┊    ┊3783┊  integrity sha512-2XQACfElKi9SlVb1CYadKDXvoajPgBVPn/gOQLrTvHdElaVhr7ZEbqJaRnJLVNeaI4cMEAgVCeBMKF6MWRDCRA==
+┊    ┊3784┊
+┊    ┊3785┊spdx-expression-parse@^3.0.0:
+┊    ┊3786┊  version "3.0.0"
+┊    ┊3787┊  resolved "https://registry.yarnpkg.com/spdx-expression-parse/-/spdx-expression-parse-3.0.0.tgz#99e119b7a5da00e05491c9fa338b7904823b41d0"
+┊    ┊3788┊  integrity sha512-Yg6D3XpRD4kkOmTpdgbUiEJFKghJH03fiC1OPll5h/0sO6neh2jqRDVHOQ4o/LMea0tgCkbMgea5ip/e+MkWyg==
+┊    ┊3789┊  dependencies:
+┊    ┊3790┊    spdx-exceptions "^2.1.0"
+┊    ┊3791┊    spdx-license-ids "^3.0.0"
+┊    ┊3792┊
+┊    ┊3793┊spdx-license-ids@^3.0.0:
+┊    ┊3794┊  version "3.0.3"
+┊    ┊3795┊  resolved "https://registry.yarnpkg.com/spdx-license-ids/-/spdx-license-ids-3.0.3.tgz#81c0ce8f21474756148bbb5f3bfc0f36bf15d76e"
+┊    ┊3796┊  integrity sha512-uBIcIl3Ih6Phe3XHK1NqboJLdGfwr1UN3k6wSD1dZpmPsIkb8AGNbZYJ1fOBk834+Gxy8rpfDxrS6XLEMZMY2g==
+┊    ┊3797┊
 ┊2340┊3798┊split-string@^3.0.1, split-string@^3.0.2:
 ┊2341┊3799┊  version "3.1.0"
 ┊2342┊3800┊  resolved "https://registry.yarnpkg.com/split-string/-/split-string-3.1.0.tgz#7cb09dda3a86585705c64b39a6466038682e8fe2"
```
```diff
@@ -2344,6 +3802,31 @@
 ┊2344┊3802┊  dependencies:
 ┊2345┊3803┊    extend-shallow "^3.0.0"
 ┊2346┊3804┊
+┊    ┊3805┊sprintf-js@~1.0.2:
+┊    ┊3806┊  version "1.0.3"
+┊    ┊3807┊  resolved "https://registry.yarnpkg.com/sprintf-js/-/sprintf-js-1.0.3.tgz#04e6926f662895354f3dd015203633b857297e2c"
+┊    ┊3808┊  integrity sha1-BOaSb2YolTVPPdAVIDYzuFcpfiw=
+┊    ┊3809┊
+┊    ┊3810┊sshpk@^1.7.0:
+┊    ┊3811┊  version "1.16.1"
+┊    ┊3812┊  resolved "https://registry.yarnpkg.com/sshpk/-/sshpk-1.16.1.tgz#fb661c0bef29b39db40769ee39fa70093d6f6877"
+┊    ┊3813┊  integrity sha512-HXXqVUq7+pcKeLqqZj6mHFUMvXtOJt1uoUx09pFW6011inTMxqI8BA8PM95myrIyyKwdnzjdFjLiE6KBPVtJIg==
+┊    ┊3814┊  dependencies:
+┊    ┊3815┊    asn1 "~0.2.3"
+┊    ┊3816┊    assert-plus "^1.0.0"
+┊    ┊3817┊    bcrypt-pbkdf "^1.0.0"
+┊    ┊3818┊    dashdash "^1.12.0"
+┊    ┊3819┊    ecc-jsbn "~0.1.1"
+┊    ┊3820┊    getpass "^0.1.1"
+┊    ┊3821┊    jsbn "~0.1.0"
+┊    ┊3822┊    safer-buffer "^2.0.2"
+┊    ┊3823┊    tweetnacl "~0.14.0"
+┊    ┊3824┊
+┊    ┊3825┊stack-trace@0.0.x:
+┊    ┊3826┊  version "0.0.10"
+┊    ┊3827┊  resolved "https://registry.yarnpkg.com/stack-trace/-/stack-trace-0.0.10.tgz#547c70b347e8d32b4e108ea1a2a159e5fdde19c0"
+┊    ┊3828┊  integrity sha1-VHxws0fo0ytOEI6hoqFZ5f3eGcA=
+┊    ┊3829┊
 ┊2347┊3830┊static-extend@^0.1.1:
 ┊2348┊3831┊  version "0.1.2"
 ┊2349┊3832┊  resolved "https://registry.yarnpkg.com/static-extend/-/static-extend-0.1.2.tgz#60809c39cbff55337226fd5e0b520f341f1fb5c6"
```
```diff
@@ -2376,7 +3859,7 @@
 ┊2376┊3859┊    is-fullwidth-code-point "^1.0.0"
 ┊2377┊3860┊    strip-ansi "^3.0.0"
 ┊2378┊3861┊
-┊2379┊    ┊"string-width@^1.0.2 || 2", string-width@^2.0.0, string-width@^2.1.1:
+┊    ┊3862┊"string-width@^1.0.2 || 2", string-width@^2.0.0, string-width@^2.1.0, string-width@^2.1.1:
 ┊2380┊3863┊  version "2.1.1"
 ┊2381┊3864┊  resolved "https://registry.yarnpkg.com/string-width/-/string-width-2.1.1.tgz#ab93f27a8dc13d28cac815c462143a6d9012ae9e"
 ┊2382┊3865┊  integrity sha512-nOqH59deCq9SRHlxq1Aw85Jnt4w6KvLKqWVik6oA9ZklXLNIOlqg4F2yrT1MVaTjAqvVwdfeZ7w7aCvJD7ugkw==
```
```diff
@@ -2384,6 +3867,13 @@
 ┊2384┊3867┊    is-fullwidth-code-point "^2.0.0"
 ┊2385┊3868┊    strip-ansi "^4.0.0"
 ┊2386┊3869┊
+┊    ┊3870┊string_decoder@^1.1.1:
+┊    ┊3871┊  version "1.2.0"
+┊    ┊3872┊  resolved "https://registry.yarnpkg.com/string_decoder/-/string_decoder-1.2.0.tgz#fe86e738b19544afe70469243b2a1ee9240eae8d"
+┊    ┊3873┊  integrity sha512-6YqyX6ZWEYguAxgZzHGL7SsCeGx3V2TtOTqZz1xSTSWnqsbWwbptafNyvf/ACquZUXV3DANr5BDIwNYe1mN42w==
+┊    ┊3874┊  dependencies:
+┊    ┊3875┊    safe-buffer "~5.1.0"
+┊    ┊3876┊
 ┊2387┊3877┊string_decoder@~1.1.1:
 ┊2388┊3878┊  version "1.1.1"
 ┊2389┊3879┊  resolved "https://registry.yarnpkg.com/string_decoder/-/string_decoder-1.1.1.tgz#9cf1611ba62685d7030ae9e4ba34149c3af03fc8"
```
```diff
@@ -2405,6 +3895,13 @@
 ┊2405┊3895┊  dependencies:
 ┊2406┊3896┊    ansi-regex "^3.0.0"
 ┊2407┊3897┊
+┊    ┊3898┊strip-ansi@^5.0.0:
+┊    ┊3899┊  version "5.0.0"
+┊    ┊3900┊  resolved "https://registry.yarnpkg.com/strip-ansi/-/strip-ansi-5.0.0.tgz#f78f68b5d0866c20b2c9b8c61b5298508dc8756f"
+┊    ┊3901┊  integrity sha512-Uu7gQyZI7J7gn5qLn1Np3G9vcYGTVqB+lFTytnDJv83dd8T22aGH451P3jueT2/QemInJDfxHB5Tde5OzgG1Ow==
+┊    ┊3902┊  dependencies:
+┊    ┊3903┊    ansi-regex "^4.0.0"
+┊    ┊3904┊
 ┊2408┊3905┊strip-eof@^1.0.0:
 ┊2409┊3906┊  version "1.0.0"
 ┊2410┊3907┊  resolved "https://registry.yarnpkg.com/strip-eof/-/strip-eof-1.0.0.tgz#bb43ff5598a6eb05d89b59fcd129c983313606bf"
```
```diff
@@ -2426,6 +3923,18 @@
 ┊2426┊3923┊    symbol-observable "^1.0.4"
 ┊2427┊3924┊    ws "^5.2.0"
 ┊2428┊3925┊
+┊    ┊3926┊supports-color@^2.0.0:
+┊    ┊3927┊  version "2.0.0"
+┊    ┊3928┊  resolved "https://registry.yarnpkg.com/supports-color/-/supports-color-2.0.0.tgz#535d045ce6b6363fa40117084629995e9df324c7"
+┊    ┊3929┊  integrity sha1-U10EXOa2Nj+kARcIRimZXp3zJMc=
+┊    ┊3930┊
+┊    ┊3931┊supports-color@^4.5.0:
+┊    ┊3932┊  version "4.5.0"
+┊    ┊3933┊  resolved "https://registry.yarnpkg.com/supports-color/-/supports-color-4.5.0.tgz#be7a0de484dec5c5cddf8b3d59125044912f635b"
+┊    ┊3934┊  integrity sha1-vnoN5ITexcXN34s9WRJQRJEvY1s=
+┊    ┊3935┊  dependencies:
+┊    ┊3936┊    has-flag "^2.0.0"
+┊    ┊3937┊
 ┊2429┊3938┊supports-color@^5.2.0, supports-color@^5.3.0:
 ┊2430┊3939┊  version "5.5.0"
 ┊2431┊3940┊  resolved "https://registry.yarnpkg.com/supports-color/-/supports-color-5.5.0.tgz#e2e69a44ac8772f78a1ec0b35b689df6530efc8f"
```
```diff
@@ -2433,7 +3942,15 @@
 ┊2433┊3942┊  dependencies:
 ┊2434┊3943┊    has-flag "^3.0.0"
 ┊2435┊3944┊
-┊2436┊    ┊symbol-observable@^1.0.4:
+┊    ┊3945┊swap-case@^1.1.0:
+┊    ┊3946┊  version "1.1.2"
+┊    ┊3947┊  resolved "https://registry.yarnpkg.com/swap-case/-/swap-case-1.1.2.tgz#c39203a4587385fad3c850a0bd1bcafa081974e3"
+┊    ┊3948┊  integrity sha1-w5IDpFhzhfrTyFCgvRvK+ggZdOM=
+┊    ┊3949┊  dependencies:
+┊    ┊3950┊    lower-case "^1.1.1"
+┊    ┊3951┊    upper-case "^1.1.1"
+┊    ┊3952┊
+┊    ┊3953┊symbol-observable@^1.0.4, symbol-observable@^1.1.0:
 ┊2437┊3954┊  version "1.2.0"
 ┊2438┊3955┊  resolved "https://registry.yarnpkg.com/symbol-observable/-/symbol-observable-1.2.0.tgz#c22688aed4eab3cdc2dfeacbb561660560a00804"
 ┊2439┊3956┊  integrity sha512-e900nM8RRtGhlV36KGEU9k65K3mPb1WV70OdjfxlG2EAuM1noi/E/BaW/uMhL7bPEssK8QV57vN3esixjUvcXQ==
```
```diff
@@ -2458,11 +3975,41 @@
 ┊2458┊3975┊  dependencies:
 ┊2459┊3976┊    execa "^0.7.0"
 ┊2460┊3977┊
+┊    ┊3978┊text-hex@1.0.x:
+┊    ┊3979┊  version "1.0.0"
+┊    ┊3980┊  resolved "https://registry.yarnpkg.com/text-hex/-/text-hex-1.0.0.tgz#69dc9c1b17446ee79a92bf5b884bb4b9127506f5"
+┊    ┊3981┊  integrity sha512-uuVGNWzgJ4yhRaNSiubPY7OjISw4sw4E5Uv0wbjp+OzcbmVU/rsT8ujgcXJhn9ypzsgr5vlzpPqP+MBBKcGvbg==
+┊    ┊3982┊
+┊    ┊3983┊through@^2.3.6:
+┊    ┊3984┊  version "2.3.8"
+┊    ┊3985┊  resolved "https://registry.yarnpkg.com/through/-/through-2.3.8.tgz#0dd4c9ffaabc357960b1b724115d7e0e86a2e1f5"
+┊    ┊3986┊  integrity sha1-DdTJ/6q8NXlgsbckEV1+Doai4fU=
+┊    ┊3987┊
 ┊2461┊3988┊timed-out@^4.0.0:
 ┊2462┊3989┊  version "4.0.1"
 ┊2463┊3990┊  resolved "https://registry.yarnpkg.com/timed-out/-/timed-out-4.0.1.tgz#f32eacac5a175bea25d7fab565ab3ed8741ef56f"
 ┊2464┊3991┊  integrity sha1-8y6srFoXW+ol1/q1Zas+2HQe9W8=
 ┊2465┊3992┊
+┊    ┊3993┊title-case@^2.1.0:
+┊    ┊3994┊  version "2.1.1"
+┊    ┊3995┊  resolved "https://registry.yarnpkg.com/title-case/-/title-case-2.1.1.tgz#3e127216da58d2bc5becf137ab91dae3a7cd8faa"
+┊    ┊3996┊  integrity sha1-PhJyFtpY0rxb7PE3q5Ha46fNj6o=
+┊    ┊3997┊  dependencies:
+┊    ┊3998┊    no-case "^2.2.0"
+┊    ┊3999┊    upper-case "^1.0.3"
+┊    ┊4000┊
+┊    ┊4001┊tmp@^0.0.33:
+┊    ┊4002┊  version "0.0.33"
+┊    ┊4003┊  resolved "https://registry.yarnpkg.com/tmp/-/tmp-0.0.33.tgz#6d34335889768d21b2bcda0aa277ced3b1bfadf9"
+┊    ┊4004┊  integrity sha512-jRCJlojKnZ3addtTOjdIqoRuPEKBvNXcGYqzO6zWZX8KfKEpnGY5jfggJQ3EjKuu8D4bJRr0y+cYJFmYbImXGw==
+┊    ┊4005┊  dependencies:
+┊    ┊4006┊    os-tmpdir "~1.0.2"
+┊    ┊4007┊
+┊    ┊4008┊to-fast-properties@^2.0.0:
+┊    ┊4009┊  version "2.0.0"
+┊    ┊4010┊  resolved "https://registry.yarnpkg.com/to-fast-properties/-/to-fast-properties-2.0.0.tgz#dc5e698cbd079265bc73e0377681a4e4e83f616e"
+┊    ┊4011┊  integrity sha1-3F5pjL0HkmW8c+A3doGk5Og/YW4=
+┊    ┊4012┊
 ┊2466┊4013┊to-object-path@^0.3.0:
 ┊2467┊4014┊  version "0.3.0"
 ┊2468┊4015┊  resolved "https://registry.yarnpkg.com/to-object-path/-/to-object-path-0.3.0.tgz#297588b7b0e7e0ac08e04e672f85c1f4999e17af"
```
```diff
@@ -2500,6 +4047,34 @@
 ┊2500┊4047┊  dependencies:
 ┊2501┊4048┊    nopt "~1.0.10"
 ┊2502┊4049┊
+┊    ┊4050┊tough-cookie@~2.4.3:
+┊    ┊4051┊  version "2.4.3"
+┊    ┊4052┊  resolved "https://registry.yarnpkg.com/tough-cookie/-/tough-cookie-2.4.3.tgz#53f36da3f47783b0925afa06ff9f3b165280f781"
+┊    ┊4053┊  integrity sha512-Q5srk/4vDM54WJsJio3XNn6K2sCG+CQ8G5Wz6bZhRZoAe/+TxjWB/GlFAnYEbkYVlON9FMk/fE3h2RLpPXo4lQ==
+┊    ┊4054┊  dependencies:
+┊    ┊4055┊    psl "^1.1.24"
+┊    ┊4056┊    punycode "^1.4.1"
+┊    ┊4057┊
+┊    ┊4058┊tree-kill@^1.1.0:
+┊    ┊4059┊  version "1.2.1"
+┊    ┊4060┊  resolved "https://registry.yarnpkg.com/tree-kill/-/tree-kill-1.2.1.tgz#5398f374e2f292b9dcc7b2e71e30a5c3bb6c743a"
+┊    ┊4061┊  integrity sha512-4hjqbObwlh2dLyW4tcz0Ymw0ggoaVDMveUB9w8kFSQScdRLo0gxO9J7WFcUBo+W3C1TLdFIEwNOWebgZZ0RH9Q==
+┊    ┊4062┊
+┊    ┊4063┊trim-right@^1.0.1:
+┊    ┊4064┊  version "1.0.1"
+┊    ┊4065┊  resolved "https://registry.yarnpkg.com/trim-right/-/trim-right-1.0.1.tgz#cb2e1203067e0c8de1f614094b9fe45704ea6003"
+┊    ┊4066┊  integrity sha1-yy4SAwZ+DI3h9hQJS5/kVwTqYAM=
+┊    ┊4067┊
+┊    ┊4068┊triple-beam@^1.2.0, triple-beam@^1.3.0:
+┊    ┊4069┊  version "1.3.0"
+┊    ┊4070┊  resolved "https://registry.yarnpkg.com/triple-beam/-/triple-beam-1.3.0.tgz#a595214c7298db8339eeeee083e4d10bd8cb8dd9"
+┊    ┊4071┊  integrity sha512-XrHUvV5HpdLmIj4uVMxHggLbFSZYIn7HEWsqePZcI50pco+MPqJ50wMGY794X7AOOhxOBAjbkqfAbEe/QMp2Lw==
+┊    ┊4072┊
+┊    ┊4073┊ts-log@2.1.4:
+┊    ┊4074┊  version "2.1.4"
+┊    ┊4075┊  resolved "https://registry.yarnpkg.com/ts-log/-/ts-log-2.1.4.tgz#063c5ad1cbab5d49d258d18015963489fb6fb59a"
+┊    ┊4076┊  integrity sha512-P1EJSoyV+N3bR/IWFeAqXzKPZwHpnLY6j7j58mAvewHRipo+BQM2Y1f9Y9BjEQznKwgqqZm7H8iuixmssU7tYQ==
+┊    ┊4077┊
 ┊2503┊4078┊ts-node@^8.0.2:
 ┊2504┊4079┊  version "8.0.2"
 ┊2505┊4080┊  resolved "https://registry.yarnpkg.com/ts-node/-/ts-node-8.0.2.tgz#9ecdf8d782a0ca4c80d1d641cbb236af4ac1b756"
```
```diff
@@ -2511,11 +4086,23 @@
 ┊2511┊4086┊    source-map-support "^0.5.6"
 ┊2512┊4087┊    yn "^3.0.0"
 ┊2513┊4088┊
-┊2514┊    ┊tslib@^1.9.3:
+┊    ┊4089┊tslib@^1.9.0, tslib@^1.9.3:
 ┊2515┊4090┊  version "1.9.3"
 ┊2516┊4091┊  resolved "https://registry.yarnpkg.com/tslib/-/tslib-1.9.3.tgz#d7e4dd79245d85428c4d7e4822a79917954ca286"
 ┊2517┊4092┊  integrity sha512-4krF8scpejhaOgqzBEcGM7yDIEfi0/8+8zDRZhNZZ2kjmHJ4hv3zCbQWxoJGz1iw5U0Jl0nma13xzHXcncMavQ==
 ┊2518┊4093┊
+┊    ┊4094┊tunnel-agent@^0.6.0:
+┊    ┊4095┊  version "0.6.0"
+┊    ┊4096┊  resolved "https://registry.yarnpkg.com/tunnel-agent/-/tunnel-agent-0.6.0.tgz#27a5dea06b36b04a0a9966774b290868f0fc40fd"
+┊    ┊4097┊  integrity sha1-J6XeoGs2sEoKmWZ3SykIaPD8QP0=
+┊    ┊4098┊  dependencies:
+┊    ┊4099┊    safe-buffer "^5.0.1"
+┊    ┊4100┊
+┊    ┊4101┊tweetnacl@^0.14.3, tweetnacl@~0.14.0:
+┊    ┊4102┊  version "0.14.5"
+┊    ┊4103┊  resolved "https://registry.yarnpkg.com/tweetnacl/-/tweetnacl-0.14.5.tgz#5ae68177f192d4456269d108afa93ff8743f4f64"
+┊    ┊4104┊  integrity sha1-WuaBd/GS1EViadEIr6k/+HQ/T2Q=
+┊    ┊4105┊
 ┊2519┊4106┊type-is@^1.6.16, type-is@~1.6.16:
 ┊2520┊4107┊  version "1.6.16"
 ┊2521┊4108┊  resolved "https://registry.yarnpkg.com/type-is/-/type-is-1.6.16.tgz#f89ce341541c672b25ee7ae3c73dee3b2be50194"
```
```diff
@@ -2524,7 +4111,7 @@
 ┊2524┊4111┊    media-typer "0.3.0"
 ┊2525┊4112┊    mime-types "~2.1.18"
 ┊2526┊4113┊
-┊2527┊    ┊typescript@^3.3.3:
+┊    ┊4114┊typescript@^3.2.2, typescript@^3.3.3:
 ┊2528┊4115┊  version "3.3.3"
 ┊2529┊4116┊  resolved "https://registry.yarnpkg.com/typescript/-/typescript-3.3.3.tgz#f1657fc7daa27e1a8930758ace9ae8da31403221"
 ┊2530┊4117┊  integrity sha512-Y21Xqe54TBVp+VDSNbuDYdGw0BpoR/Q6wo/+35M8PAU0vipahnyduJWirxxdxjsAkS7hue53x2zp8gz7F05u0A==
```
```diff
@@ -2571,7 +4158,7 @@
 ┊2571┊4158┊  resolved "https://registry.yarnpkg.com/unzip-response/-/unzip-response-2.0.1.tgz#d2f0f737d16b0615e72a6935ed04214572d56f97"
 ┊2572┊4159┊  integrity sha1-0vD3N9FrBhXnKmk17QQhRXLVb5c=
 ┊2573┊4160┊
-┊2574┊    ┊upath@^1.1.0:
+┊    ┊4161┊upath@^1.0.5, upath@^1.1.0:
 ┊2575┊4162┊  version "1.1.0"
 ┊2576┊4163┊  resolved "https://registry.yarnpkg.com/upath/-/upath-1.1.0.tgz#35256597e46a581db4793d0ce47fa9aebfc9fabd"
 ┊2577┊4164┊  integrity sha512-bzpH/oBhoS/QI/YtbkqCg6VEiPYjSZtrHQM6/QnJS6OL9pKUFLqb3aFh4Scvwm45+7iAgiMkLhSbaZxUqmrprw==
```
```diff
@@ -2592,6 +4179,25 @@
 ┊2592┊4179┊    semver-diff "^2.0.0"
 ┊2593┊4180┊    xdg-basedir "^3.0.0"
 ┊2594┊4181┊
+┊    ┊4182┊upper-case-first@^1.1.0, upper-case-first@^1.1.2:
+┊    ┊4183┊  version "1.1.2"
+┊    ┊4184┊  resolved "https://registry.yarnpkg.com/upper-case-first/-/upper-case-first-1.1.2.tgz#5d79bedcff14419518fd2edb0a0507c9b6859115"
+┊    ┊4185┊  integrity sha1-XXm+3P8UQZUY/S7bCgUHybaFkRU=
+┊    ┊4186┊  dependencies:
+┊    ┊4187┊    upper-case "^1.1.1"
+┊    ┊4188┊
+┊    ┊4189┊upper-case@^1.0.3, upper-case@^1.1.0, upper-case@^1.1.1, upper-case@^1.1.3:
+┊    ┊4190┊  version "1.1.3"
+┊    ┊4191┊  resolved "https://registry.yarnpkg.com/upper-case/-/upper-case-1.1.3.tgz#f6b4501c2ec4cdd26ba78be7222961de77621598"
+┊    ┊4192┊  integrity sha1-9rRQHC7EzdJrp4vnIilh3ndiFZg=
+┊    ┊4193┊
+┊    ┊4194┊uri-js@^4.2.2:
+┊    ┊4195┊  version "4.2.2"
+┊    ┊4196┊  resolved "https://registry.yarnpkg.com/uri-js/-/uri-js-4.2.2.tgz#94c540e1ff772956e2299507c010aea6c8838eb0"
+┊    ┊4197┊  integrity sha512-KY9Frmirql91X2Qgjry0Wd4Y+YTdrdZheS8TFwvkbLWf/G5KNJDCh6pKL5OZctEW4+0Baa5idK2ZQuELRwPznQ==
+┊    ┊4198┊  dependencies:
+┊    ┊4199┊    punycode "^2.1.0"
+┊    ┊4200┊
 ┊2595┊4201┊urix@^0.1.0:
 ┊2596┊4202┊  version "0.1.0"
 ┊2597┊4203┊  resolved "https://registry.yarnpkg.com/urix/-/urix-0.1.0.tgz#da937f7a62e21fec1fd18d49b35c2935067a6c72"
```
```diff
@@ -2609,7 +4215,7 @@
 ┊2609┊4215┊  resolved "https://registry.yarnpkg.com/use/-/use-3.1.1.tgz#d50c8cac79a19fbc20f2911f56eb973f4e10070f"
 ┊2610┊4216┊  integrity sha512-cwESVXlO3url9YWlFW/TA9cshCEhtu7IKJ/p5soJ/gGpj7vbvFrAY/eIioQ6Dw23KjZhYgiIo8HOs1nQ2vr/oQ==
 ┊2611┊4217┊
-┊2612┊    ┊util-deprecate@~1.0.1:
+┊    ┊4218┊util-deprecate@^1.0.1, util-deprecate@~1.0.1:
 ┊2613┊4219┊  version "1.0.2"
 ┊2614┊4220┊  resolved "https://registry.yarnpkg.com/util-deprecate/-/util-deprecate-1.0.2.tgz#450d4dc9fa70de732762fbd2d4a28981419a0ccf"
 ┊2615┊4221┊  integrity sha1-RQ1Nyfpw3nMnYvvS1KKJgUGaDM8=
```
```diff
@@ -2627,16 +4233,48 @@
 ┊2627┊4233┊  resolved "https://registry.yarnpkg.com/utils-merge/-/utils-merge-1.0.1.tgz#9f95710f50a267947b2ccc124741c1028427e713"
 ┊2628┊4234┊  integrity sha1-n5VxD1CiZ5R7LMwSR0HBAoQn5xM=
 ┊2629┊4235┊
-┊2630┊    ┊uuid@^3.1.0:
+┊    ┊4236┊uuid@^3.1.0, uuid@^3.3.2:
 ┊2631┊4237┊  version "3.3.2"
 ┊2632┊4238┊  resolved "https://registry.yarnpkg.com/uuid/-/uuid-3.3.2.tgz#1b4af4955eb3077c501c23872fc6513811587131"
 ┊2633┊4239┊  integrity sha512-yXJmeNaw3DnnKAOKJE51sL/ZaYfWJRl1pK9dr19YFCu0ObS231AB1/LbqTKRAQ5kw8A90rA6fr4riOUpTZvQZA==
 ┊2634┊4240┊
+┊    ┊4241┊valid-url@1.0.9:
+┊    ┊4242┊  version "1.0.9"
+┊    ┊4243┊  resolved "https://registry.yarnpkg.com/valid-url/-/valid-url-1.0.9.tgz#1c14479b40f1397a75782f115e4086447433a200"
+┊    ┊4244┊  integrity sha1-HBRHm0DxOXp1eC8RXkCGRHQzogA=
+┊    ┊4245┊
+┊    ┊4246┊validate-npm-package-license@^3.0.1:
+┊    ┊4247┊  version "3.0.4"
+┊    ┊4248┊  resolved "https://registry.yarnpkg.com/validate-npm-package-license/-/validate-npm-package-license-3.0.4.tgz#fc91f6b9c7ba15c857f4cb2c5defeec39d4f410a"
+┊    ┊4249┊  integrity sha512-DpKm2Ui/xN7/HQKCtpZxoRWBhZ9Z0kqtygG8XCgNQ8ZlDnxuQmWhj566j8fN4Cu3/JmbhsDo7fcAJq4s9h27Ew==
+┊    ┊4250┊  dependencies:
+┊    ┊4251┊    spdx-correct "^3.0.0"
+┊    ┊4252┊    spdx-expression-parse "^3.0.0"
+┊    ┊4253┊
 ┊2635┊4254┊vary@^1, vary@~1.1.2:
 ┊2636┊4255┊  version "1.1.2"
 ┊2637┊4256┊  resolved "https://registry.yarnpkg.com/vary/-/vary-1.1.2.tgz#2299f02c6ded30d4a5961b0b9f74524a18f634fc"
 ┊2638┊4257┊  integrity sha1-IpnwLG3tMNSllhsLn3RSShj2NPw=
 ┊2639┊4258┊
+┊    ┊4259┊verror@1.10.0:
+┊    ┊4260┊  version "1.10.0"
+┊    ┊4261┊  resolved "https://registry.yarnpkg.com/verror/-/verror-1.10.0.tgz#3a105ca17053af55d6e270c1f8288682e18da400"
+┊    ┊4262┊  integrity sha1-OhBcoXBTr1XW4nDB+CiGguGNpAA=
+┊    ┊4263┊  dependencies:
+┊    ┊4264┊    assert-plus "^1.0.0"
+┊    ┊4265┊    core-util-is "1.0.2"
+┊    ┊4266┊    extsprintf "^1.2.0"
+┊    ┊4267┊
+┊    ┊4268┊whatwg-fetch@2.0.4:
+┊    ┊4269┊  version "2.0.4"
+┊    ┊4270┊  resolved "https://registry.yarnpkg.com/whatwg-fetch/-/whatwg-fetch-2.0.4.tgz#dde6a5df315f9d39991aa17621853d720b85566f"
+┊    ┊4271┊  integrity sha512-dcQ1GWpOD/eEQ97k66aiEVpNnapVj90/+R+SXTPYGHpYBBypfKJEQjLrvMZ7YXbKm21gXd4NcuxUTjiv1YtLng==
+┊    ┊4272┊
+┊    ┊4273┊which-module@^2.0.0:
+┊    ┊4274┊  version "2.0.0"
+┊    ┊4275┊  resolved "https://registry.yarnpkg.com/which-module/-/which-module-2.0.0.tgz#d9ef07dce77b9902b8a3a8fa4b31c3e3f7e6e87a"
+┊    ┊4276┊  integrity sha1-2e8H3Od7mQK4o6j6SzHD4/fm6Ho=
+┊    ┊4277┊
 ┊2640┊4278┊which@^1.2.9:
 ┊2641┊4279┊  version "1.3.1"
 ┊2642┊4280┊  resolved "https://registry.yarnpkg.com/which/-/which-1.3.1.tgz#a45043d54f5805316da8d62f9f50918d3da70b0a"
```
```diff
@@ -2658,6 +4296,45 @@
 ┊2658┊4296┊  dependencies:
 ┊2659┊4297┊    string-width "^2.1.1"
 ┊2660┊4298┊
+┊    ┊4299┊winston-transport@^4.3.0:
+┊    ┊4300┊  version "4.3.0"
+┊    ┊4301┊  resolved "https://registry.yarnpkg.com/winston-transport/-/winston-transport-4.3.0.tgz#df68c0c202482c448d9b47313c07304c2d7c2c66"
+┊    ┊4302┊  integrity sha512-B2wPuwUi3vhzn/51Uukcao4dIduEiPOcOt9HJ3QeaXgkJ5Z7UwpBzxS4ZGNHtrxrUvTwemsQiSys0ihOf8Mp1A==
+┊    ┊4303┊  dependencies:
+┊    ┊4304┊    readable-stream "^2.3.6"
+┊    ┊4305┊    triple-beam "^1.2.0"
+┊    ┊4306┊
+┊    ┊4307┊winston@3.2.1:
+┊    ┊4308┊  version "3.2.1"
+┊    ┊4309┊  resolved "https://registry.yarnpkg.com/winston/-/winston-3.2.1.tgz#63061377976c73584028be2490a1846055f77f07"
+┊    ┊4310┊  integrity sha512-zU6vgnS9dAWCEKg/QYigd6cgMVVNwyTzKs81XZtTFuRwJOcDdBg7AU0mXVyNbs7O5RH2zdv+BdNZUlx7mXPuOw==
+┊    ┊4311┊  dependencies:
+┊    ┊4312┊    async "^2.6.1"
+┊    ┊4313┊    diagnostics "^1.1.1"
+┊    ┊4314┊    is-stream "^1.1.0"
+┊    ┊4315┊    logform "^2.1.1"
+┊    ┊4316┊    one-time "0.0.4"
+┊    ┊4317┊    readable-stream "^3.1.1"
+┊    ┊4318┊    stack-trace "0.0.x"
+┊    ┊4319┊    triple-beam "^1.3.0"
+┊    ┊4320┊    winston-transport "^4.3.0"
+┊    ┊4321┊
+┊    ┊4322┊wrap-ansi@^2.0.0:
+┊    ┊4323┊  version "2.1.0"
+┊    ┊4324┊  resolved "https://registry.yarnpkg.com/wrap-ansi/-/wrap-ansi-2.1.0.tgz#d8fc3d284dd05794fe84973caecdd1cf824fdd85"
+┊    ┊4325┊  integrity sha1-2Pw9KE3QV5T+hJc8rs3Rz4JP3YU=
+┊    ┊4326┊  dependencies:
+┊    ┊4327┊    string-width "^1.0.1"
+┊    ┊4328┊    strip-ansi "^3.0.1"
+┊    ┊4329┊
+┊    ┊4330┊wrap-ansi@^3.0.1:
+┊    ┊4331┊  version "3.0.1"
+┊    ┊4332┊  resolved "https://registry.yarnpkg.com/wrap-ansi/-/wrap-ansi-3.0.1.tgz#288a04d87eda5c286e060dfe8f135ce8d007f8ba"
+┊    ┊4333┊  integrity sha1-KIoE2H7aXChuBg3+jxNc6NAH+Lo=
+┊    ┊4334┊  dependencies:
+┊    ┊4335┊    string-width "^2.1.1"
+┊    ┊4336┊    strip-ansi "^4.0.0"
+┊    ┊4337┊
 ┊2661┊4338┊wrappy@1:
 ┊2662┊4339┊  version "1.0.2"
 ┊2663┊4340┊  resolved "https://registry.yarnpkg.com/wrappy/-/wrappy-1.0.2.tgz#b5243d8f3ec1aa35f1364605bc0d1036e30ab69f"
```
```diff
@@ -2691,6 +4368,11 @@
 ┊2691┊4368┊  resolved "https://registry.yarnpkg.com/xdg-basedir/-/xdg-basedir-3.0.0.tgz#496b2cc109eca8dbacfe2dc72b603c17c5870ad4"
 ┊2692┊4369┊  integrity sha1-SWsswQnsqNus/i3HK2A8F8WHCtQ=
 ┊2693┊4370┊
+┊    ┊4371┊"y18n@^3.2.1 || ^4.0.0":
+┊    ┊4372┊  version "4.0.0"
+┊    ┊4373┊  resolved "https://registry.yarnpkg.com/y18n/-/y18n-4.0.0.tgz#95ef94f85ecc81d007c264e190a120f0a3c8566b"
+┊    ┊4374┊  integrity sha512-r9S/ZyXu/Xu9q1tYlpsLIsa3EeLXXk0VwlxqTcFRfg9EhMW+17kbt9G0NrgCmhGb5vT2hyhJZLfDGx+7+5Uj/w==
+┊    ┊4375┊
 ┊2694┊4376┊yallist@^2.1.2:
 ┊2695┊4377┊  version "2.1.2"
 ┊2696┊4378┊  resolved "https://registry.yarnpkg.com/yallist/-/yallist-2.1.2.tgz#1c11f9218f076089a47dd512f93c6699a6a81d52"
```
```diff
@@ -2701,6 +4383,32 @@
 ┊2701┊4383┊  resolved "https://registry.yarnpkg.com/yallist/-/yallist-3.0.3.tgz#b4b049e314be545e3ce802236d6cd22cd91c3de9"
 ┊2702┊4384┊  integrity sha512-S+Zk8DEWE6oKpV+vI3qWkaK+jSbIK86pCwe2IF/xwIpQ8jEuxpw9NyaGjmp9+BoJv5FV2piqCDcoCtStppiq2A==
 ┊2703┊4385┊
+┊    ┊4386┊yargs-parser@^11.1.1:
+┊    ┊4387┊  version "11.1.1"
+┊    ┊4388┊  resolved "https://registry.yarnpkg.com/yargs-parser/-/yargs-parser-11.1.1.tgz#879a0865973bca9f6bab5cbdf3b1c67ec7d3bcf4"
+┊    ┊4389┊  integrity sha512-C6kB/WJDiaxONLJQnF8ccx9SEeoTTLek8RVbaOIsrAUS8VrBEXfmeSnCZxygc+XC2sNMBIwOOnfcxiynjHsVSQ==
+┊    ┊4390┊  dependencies:
+┊    ┊4391┊    camelcase "^5.0.0"
+┊    ┊4392┊    decamelize "^1.2.0"
+┊    ┊4393┊
+┊    ┊4394┊yargs@^12.0.1:
+┊    ┊4395┊  version "12.0.5"
+┊    ┊4396┊  resolved "https://registry.yarnpkg.com/yargs/-/yargs-12.0.5.tgz#05f5997b609647b64f66b81e3b4b10a368e7ad13"
+┊    ┊4397┊  integrity sha512-Lhz8TLaYnxq/2ObqHDql8dX8CJi97oHxrjUcYtzKbbykPtVW9WB+poxI+NM2UIzsMgNCZTIf0AQwsjK5yMAqZw==
+┊    ┊4398┊  dependencies:
+┊    ┊4399┊    cliui "^4.0.0"
+┊    ┊4400┊    decamelize "^1.2.0"
+┊    ┊4401┊    find-up "^3.0.0"
+┊    ┊4402┊    get-caller-file "^1.0.1"
+┊    ┊4403┊    os-locale "^3.0.0"
+┊    ┊4404┊    require-directory "^2.1.1"
+┊    ┊4405┊    require-main-filename "^1.0.1"
+┊    ┊4406┊    set-blocking "^2.0.0"
+┊    ┊4407┊    string-width "^2.0.0"
+┊    ┊4408┊    which-module "^2.0.0"
+┊    ┊4409┊    y18n "^3.2.1 || ^4.0.0"
+┊    ┊4410┊    yargs-parser "^11.1.1"
+┊    ┊4411┊
 ┊2704┊4412┊yn@^3.0.0:
 ┊2705┊4413┊  version "3.0.0"
 ┊2706┊4414┊  resolved "https://registry.yarnpkg.com/yn/-/yn-3.0.0.tgz#0073c6b56e92aed652fbdfd62431f2d6b9a7a091"
```

[}]: #

Now let's run the generator (the server must be running in the background):

    $ npm run generator

Those are the types created with `npm run generator`:

[{]: <helper> (diffStep "2.2")

#### Step 2.2: Create types with generator

##### Added types.d.ts
```diff
@@ -0,0 +1,507 @@
+┊   ┊  1┊export type Maybe<T> = T | undefined | null;
+┊   ┊  2┊
+┊   ┊  3┊export enum MessageType {
+┊   ┊  4┊  Location = "LOCATION",
+┊   ┊  5┊  Text = "TEXT",
+┊   ┊  6┊  Picture = "PICTURE"
+┊   ┊  7┊}
+┊   ┊  8┊
+┊   ┊  9┊export type Date = any;
+┊   ┊ 10┊
+┊   ┊ 11┊// ====================================================
+┊   ┊ 12┊// Scalars
+┊   ┊ 13┊// ====================================================
+┊   ┊ 14┊
+┊   ┊ 15┊// ====================================================
+┊   ┊ 16┊// Types
+┊   ┊ 17┊// ====================================================
+┊   ┊ 18┊
+┊   ┊ 19┊export interface Query {
+┊   ┊ 20┊  me?: Maybe<User>;
+┊   ┊ 21┊
+┊   ┊ 22┊  users?: Maybe<User[]>;
+┊   ┊ 23┊
+┊   ┊ 24┊  chats: Chat[];
+┊   ┊ 25┊
+┊   ┊ 26┊  chat?: Maybe<Chat>;
+┊   ┊ 27┊}
+┊   ┊ 28┊
+┊   ┊ 29┊export interface User {
+┊   ┊ 30┊  id: string;
+┊   ┊ 31┊
+┊   ┊ 32┊  name?: Maybe<string>;
+┊   ┊ 33┊
+┊   ┊ 34┊  picture?: Maybe<string>;
+┊   ┊ 35┊
+┊   ┊ 36┊  phone?: Maybe<string>;
+┊   ┊ 37┊}
+┊   ┊ 38┊
+┊   ┊ 39┊export interface Chat {
+┊   ┊ 40┊  id: string;
+┊   ┊ 41┊
+┊   ┊ 42┊  createdAt: Date;
+┊   ┊ 43┊
+┊   ┊ 44┊  name?: Maybe<string>;
+┊   ┊ 45┊
+┊   ┊ 46┊  picture?: Maybe<string>;
+┊   ┊ 47┊
+┊   ┊ 48┊  allTimeMembers: User[];
+┊   ┊ 49┊
+┊   ┊ 50┊  listingMembers: User[];
+┊   ┊ 51┊
+┊   ┊ 52┊  actualGroupMembers?: Maybe<User[]>;
+┊   ┊ 53┊
+┊   ┊ 54┊  admins?: Maybe<User[]>;
+┊   ┊ 55┊
+┊   ┊ 56┊  owner?: Maybe<User>;
+┊   ┊ 57┊
+┊   ┊ 58┊  isGroup: boolean;
+┊   ┊ 59┊
+┊   ┊ 60┊  messages: (Maybe<Message>)[];
+┊   ┊ 61┊
+┊   ┊ 62┊  lastMessage?: Maybe<Message>;
+┊   ┊ 63┊
+┊   ┊ 64┊  updatedAt: Date;
+┊   ┊ 65┊
+┊   ┊ 66┊  unreadMessages: number;
+┊   ┊ 67┊}
+┊   ┊ 68┊
+┊   ┊ 69┊export interface Message {
+┊   ┊ 70┊  id: string;
+┊   ┊ 71┊
+┊   ┊ 72┊  sender: User;
+┊   ┊ 73┊
+┊   ┊ 74┊  chat: Chat;
+┊   ┊ 75┊
+┊   ┊ 76┊  content: string;
+┊   ┊ 77┊
+┊   ┊ 78┊  createdAt: Date;
+┊   ┊ 79┊
+┊   ┊ 80┊  type: number;
+┊   ┊ 81┊
+┊   ┊ 82┊  holders: User[];
+┊   ┊ 83┊
+┊   ┊ 84┊  ownership: boolean;
+┊   ┊ 85┊
+┊   ┊ 86┊  recipients: Recipient[];
+┊   ┊ 87┊}
+┊   ┊ 88┊
+┊   ┊ 89┊export interface Recipient {
+┊   ┊ 90┊  user: User;
+┊   ┊ 91┊
+┊   ┊ 92┊  message: Message;
+┊   ┊ 93┊
+┊   ┊ 94┊  chat: Chat;
+┊   ┊ 95┊
+┊   ┊ 96┊  receivedAt?: Maybe<Date>;
+┊   ┊ 97┊
+┊   ┊ 98┊  readAt?: Maybe<Date>;
+┊   ┊ 99┊}
+┊   ┊100┊
+┊   ┊101┊// ====================================================
+┊   ┊102┊// Arguments
+┊   ┊103┊// ====================================================
+┊   ┊104┊
+┊   ┊105┊export interface ChatQueryArgs {
+┊   ┊106┊  chatId: string;
+┊   ┊107┊}
+┊   ┊108┊export interface MessagesChatArgs {
+┊   ┊109┊  amount?: Maybe<number>;
+┊   ┊110┊}
+┊   ┊111┊
+┊   ┊112┊import {
+┊   ┊113┊  GraphQLResolveInfo,
+┊   ┊114┊  GraphQLScalarType,
+┊   ┊115┊  GraphQLScalarTypeConfig
+┊   ┊116┊} from "graphql";
+┊   ┊117┊
+┊   ┊118┊import { ChatDb, MessageDb, RecipientDb, UserDb } from "./db";
+┊   ┊119┊
+┊   ┊120┊export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
+┊   ┊121┊  parent: Parent,
+┊   ┊122┊  args: Args,
+┊   ┊123┊  context: Context,
+┊   ┊124┊  info: GraphQLResolveInfo
+┊   ┊125┊) => Promise<Result> | Result;
+┊   ┊126┊
+┊   ┊127┊export interface ISubscriptionResolverObject<Result, Parent, Context, Args> {
+┊   ┊128┊  subscribe<R = Result, P = Parent>(
+┊   ┊129┊    parent: P,
+┊   ┊130┊    args: Args,
+┊   ┊131┊    context: Context,
+┊   ┊132┊    info: GraphQLResolveInfo
+┊   ┊133┊  ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>;
+┊   ┊134┊  resolve?<R = Result, P = Parent>(
+┊   ┊135┊    parent: P,
+┊   ┊136┊    args: Args,
+┊   ┊137┊    context: Context,
+┊   ┊138┊    info: GraphQLResolveInfo
+┊   ┊139┊  ): R | Result | Promise<R | Result>;
+┊   ┊140┊}
+┊   ┊141┊
+┊   ┊142┊export type SubscriptionResolver<
+┊   ┊143┊  Result,
+┊   ┊144┊  Parent = {},
+┊   ┊145┊  Context = {},
+┊   ┊146┊  Args = {}
+┊   ┊147┊> =
+┊   ┊148┊  | ((
+┊   ┊149┊      ...args: any[]
+┊   ┊150┊    ) => ISubscriptionResolverObject<Result, Parent, Context, Args>)
+┊   ┊151┊  | ISubscriptionResolverObject<Result, Parent, Context, Args>;
+┊   ┊152┊
+┊   ┊153┊export type TypeResolveFn<Types, Parent = {}, Context = {}> = (
+┊   ┊154┊  parent: Parent,
+┊   ┊155┊  context: Context,
+┊   ┊156┊  info: GraphQLResolveInfo
+┊   ┊157┊) => Maybe<Types>;
+┊   ┊158┊
+┊   ┊159┊export type NextResolverFn<T> = () => Promise<T>;
+┊   ┊160┊
+┊   ┊161┊export type DirectiveResolverFn<TResult, TArgs = {}, TContext = {}> = (
+┊   ┊162┊  next: NextResolverFn<TResult>,
+┊   ┊163┊  source: any,
+┊   ┊164┊  args: TArgs,
+┊   ┊165┊  context: TContext,
+┊   ┊166┊  info: GraphQLResolveInfo
+┊   ┊167┊) => TResult | Promise<TResult>;
+┊   ┊168┊
+┊   ┊169┊export namespace QueryResolvers {
+┊   ┊170┊  export interface Resolvers<Context = {}, TypeParent = {}> {
+┊   ┊171┊    me?: MeResolver<Maybe<UserDb>, TypeParent, Context>;
+┊   ┊172┊
+┊   ┊173┊    users?: UsersResolver<Maybe<UserDb[]>, TypeParent, Context>;
+┊   ┊174┊
+┊   ┊175┊    chats?: ChatsResolver<ChatDb[], TypeParent, Context>;
+┊   ┊176┊
+┊   ┊177┊    chat?: ChatResolver<Maybe<ChatDb>, TypeParent, Context>;
+┊   ┊178┊  }
+┊   ┊179┊
+┊   ┊180┊  export type MeResolver<
+┊   ┊181┊    R = Maybe<UserDb>,
+┊   ┊182┊    Parent = {},
+┊   ┊183┊    Context = {}
+┊   ┊184┊  > = Resolver<R, Parent, Context>;
+┊   ┊185┊  export type UsersResolver<
+┊   ┊186┊    R = Maybe<UserDb[]>,
+┊   ┊187┊    Parent = {},
+┊   ┊188┊    Context = {}
+┊   ┊189┊  > = Resolver<R, Parent, Context>;
+┊   ┊190┊  export type ChatsResolver<R = ChatDb[], Parent = {}, Context = {}> = Resolver<
+┊   ┊191┊    R,
+┊   ┊192┊    Parent,
+┊   ┊193┊    Context
+┊   ┊194┊  >;
+┊   ┊195┊  export type ChatResolver<
+┊   ┊196┊    R = Maybe<ChatDb>,
+┊   ┊197┊    Parent = {},
+┊   ┊198┊    Context = {}
+┊   ┊199┊  > = Resolver<R, Parent, Context, ChatArgs>;
+┊   ┊200┊  export interface ChatArgs {
+┊   ┊201┊    chatId: string;
+┊   ┊202┊  }
+┊   ┊203┊}
+┊   ┊204┊
+┊   ┊205┊export namespace UserResolvers {
+┊   ┊206┊  export interface Resolvers<Context = {}, TypeParent = UserDb> {
+┊   ┊207┊    id?: IdResolver<string, TypeParent, Context>;
+┊   ┊208┊
+┊   ┊209┊    name?: NameResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊210┊
+┊   ┊211┊    picture?: PictureResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊212┊
+┊   ┊213┊    phone?: PhoneResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊214┊  }
+┊   ┊215┊
+┊   ┊216┊  export type IdResolver<R = string, Parent = UserDb, Context = {}> = Resolver<
+┊   ┊217┊    R,
+┊   ┊218┊    Parent,
+┊   ┊219┊    Context
+┊   ┊220┊  >;
+┊   ┊221┊  export type NameResolver<
+┊   ┊222┊    R = Maybe<string>,
+┊   ┊223┊    Parent = UserDb,
+┊   ┊224┊    Context = {}
+┊   ┊225┊  > = Resolver<R, Parent, Context>;
+┊   ┊226┊  export type PictureResolver<
+┊   ┊227┊    R = Maybe<string>,
+┊   ┊228┊    Parent = UserDb,
+┊   ┊229┊    Context = {}
+┊   ┊230┊  > = Resolver<R, Parent, Context>;
+┊   ┊231┊  export type PhoneResolver<
+┊   ┊232┊    R = Maybe<string>,
+┊   ┊233┊    Parent = UserDb,
+┊   ┊234┊    Context = {}
+┊   ┊235┊  > = Resolver<R, Parent, Context>;
+┊   ┊236┊}
+┊   ┊237┊
+┊   ┊238┊export namespace ChatResolvers {
+┊   ┊239┊  export interface Resolvers<Context = {}, TypeParent = ChatDb> {
+┊   ┊240┊    id?: IdResolver<string, TypeParent, Context>;
+┊   ┊241┊
+┊   ┊242┊    createdAt?: CreatedAtResolver<Date, TypeParent, Context>;
+┊   ┊243┊
+┊   ┊244┊    name?: NameResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊245┊
+┊   ┊246┊    picture?: PictureResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊247┊
+┊   ┊248┊    allTimeMembers?: AllTimeMembersResolver<UserDb[], TypeParent, Context>;
+┊   ┊249┊
+┊   ┊250┊    listingMembers?: ListingMembersResolver<UserDb[], TypeParent, Context>;
+┊   ┊251┊
+┊   ┊252┊    actualGroupMembers?: ActualGroupMembersResolver<
+┊   ┊253┊      Maybe<UserDb[]>,
+┊   ┊254┊      TypeParent,
+┊   ┊255┊      Context
+┊   ┊256┊    >;
+┊   ┊257┊
+┊   ┊258┊    admins?: AdminsResolver<Maybe<UserDb[]>, TypeParent, Context>;
+┊   ┊259┊
+┊   ┊260┊    owner?: OwnerResolver<Maybe<UserDb>, TypeParent, Context>;
+┊   ┊261┊
+┊   ┊262┊    isGroup?: IsGroupResolver<boolean, TypeParent, Context>;
+┊   ┊263┊
+┊   ┊264┊    messages?: MessagesResolver<(Maybe<MessageDb>)[], TypeParent, Context>;
+┊   ┊265┊
+┊   ┊266┊    lastMessage?: LastMessageResolver<Maybe<MessageDb>, TypeParent, Context>;
+┊   ┊267┊
+┊   ┊268┊    updatedAt?: UpdatedAtResolver<Date, TypeParent, Context>;
+┊   ┊269┊
+┊   ┊270┊    unreadMessages?: UnreadMessagesResolver<number, TypeParent, Context>;
+┊   ┊271┊  }
+┊   ┊272┊
+┊   ┊273┊  export type IdResolver<R = string, Parent = ChatDb, Context = {}> = Resolver<
+┊   ┊274┊    R,
+┊   ┊275┊    Parent,
+┊   ┊276┊    Context
+┊   ┊277┊  >;
+┊   ┊278┊  export type CreatedAtResolver<
+┊   ┊279┊    R = Date,
+┊   ┊280┊    Parent = ChatDb,
+┊   ┊281┊    Context = {}
+┊   ┊282┊  > = Resolver<R, Parent, Context>;
+┊   ┊283┊  export type NameResolver<
+┊   ┊284┊    R = Maybe<string>,
+┊   ┊285┊    Parent = ChatDb,
+┊   ┊286┊    Context = {}
+┊   ┊287┊  > = Resolver<R, Parent, Context>;
+┊   ┊288┊  export type PictureResolver<
+┊   ┊289┊    R = Maybe<string>,
+┊   ┊290┊    Parent = ChatDb,
+┊   ┊291┊    Context = {}
+┊   ┊292┊  > = Resolver<R, Parent, Context>;
+┊   ┊293┊  export type AllTimeMembersResolver<
+┊   ┊294┊    R = UserDb[],
+┊   ┊295┊    Parent = ChatDb,
+┊   ┊296┊    Context = {}
+┊   ┊297┊  > = Resolver<R, Parent, Context>;
+┊   ┊298┊  export type ListingMembersResolver<
+┊   ┊299┊    R = UserDb[],
+┊   ┊300┊    Parent = ChatDb,
+┊   ┊301┊    Context = {}
+┊   ┊302┊  > = Resolver<R, Parent, Context>;
+┊   ┊303┊  export type ActualGroupMembersResolver<
+┊   ┊304┊    R = Maybe<UserDb[]>,
+┊   ┊305┊    Parent = ChatDb,
+┊   ┊306┊    Context = {}
+┊   ┊307┊  > = Resolver<R, Parent, Context>;
+┊   ┊308┊  export type AdminsResolver<
+┊   ┊309┊    R = Maybe<UserDb[]>,
+┊   ┊310┊    Parent = ChatDb,
+┊   ┊311┊    Context = {}
+┊   ┊312┊  > = Resolver<R, Parent, Context>;
+┊   ┊313┊  export type OwnerResolver<
+┊   ┊314┊    R = Maybe<UserDb>,
+┊   ┊315┊    Parent = ChatDb,
+┊   ┊316┊    Context = {}
+┊   ┊317┊  > = Resolver<R, Parent, Context>;
+┊   ┊318┊  export type IsGroupResolver<
+┊   ┊319┊    R = boolean,
+┊   ┊320┊    Parent = ChatDb,
+┊   ┊321┊    Context = {}
+┊   ┊322┊  > = Resolver<R, Parent, Context>;
+┊   ┊323┊  export type MessagesResolver<
+┊   ┊324┊    R = (Maybe<MessageDb>)[],
+┊   ┊325┊    Parent = ChatDb,
+┊   ┊326┊    Context = {}
+┊   ┊327┊  > = Resolver<R, Parent, Context, MessagesArgs>;
+┊   ┊328┊  export interface MessagesArgs {
+┊   ┊329┊    amount?: Maybe<number>;
+┊   ┊330┊  }
+┊   ┊331┊
+┊   ┊332┊  export type LastMessageResolver<
+┊   ┊333┊    R = Maybe<MessageDb>,
+┊   ┊334┊    Parent = ChatDb,
+┊   ┊335┊    Context = {}
+┊   ┊336┊  > = Resolver<R, Parent, Context>;
+┊   ┊337┊  export type UpdatedAtResolver<
+┊   ┊338┊    R = Date,
+┊   ┊339┊    Parent = ChatDb,
+┊   ┊340┊    Context = {}
+┊   ┊341┊  > = Resolver<R, Parent, Context>;
+┊   ┊342┊  export type UnreadMessagesResolver<
+┊   ┊343┊    R = number,
+┊   ┊344┊    Parent = ChatDb,
+┊   ┊345┊    Context = {}
+┊   ┊346┊  > = Resolver<R, Parent, Context>;
+┊   ┊347┊}
+┊   ┊348┊
+┊   ┊349┊export namespace MessageResolvers {
+┊   ┊350┊  export interface Resolvers<Context = {}, TypeParent = MessageDb> {
+┊   ┊351┊    id?: IdResolver<string, TypeParent, Context>;
+┊   ┊352┊
+┊   ┊353┊    sender?: SenderResolver<UserDb, TypeParent, Context>;
+┊   ┊354┊
+┊   ┊355┊    chat?: ChatResolver<ChatDb, TypeParent, Context>;
+┊   ┊356┊
+┊   ┊357┊    content?: ContentResolver<string, TypeParent, Context>;
+┊   ┊358┊
+┊   ┊359┊    createdAt?: CreatedAtResolver<Date, TypeParent, Context>;
+┊   ┊360┊
+┊   ┊361┊    type?: TypeResolver<number, TypeParent, Context>;
+┊   ┊362┊
+┊   ┊363┊    holders?: HoldersResolver<UserDb[], TypeParent, Context>;
+┊   ┊364┊
+┊   ┊365┊    ownership?: OwnershipResolver<boolean, TypeParent, Context>;
+┊   ┊366┊
+┊   ┊367┊    recipients?: RecipientsResolver<RecipientDb[], TypeParent, Context>;
+┊   ┊368┊  }
+┊   ┊369┊
+┊   ┊370┊  export type IdResolver<
+┊   ┊371┊    R = string,
+┊   ┊372┊    Parent = MessageDb,
+┊   ┊373┊    Context = {}
+┊   ┊374┊  > = Resolver<R, Parent, Context>;
+┊   ┊375┊  export type SenderResolver<
+┊   ┊376┊    R = UserDb,
+┊   ┊377┊    Parent = MessageDb,
+┊   ┊378┊    Context = {}
+┊   ┊379┊  > = Resolver<R, Parent, Context>;
+┊   ┊380┊  export type ChatResolver<
+┊   ┊381┊    R = ChatDb,
+┊   ┊382┊    Parent = MessageDb,
+┊   ┊383┊    Context = {}
+┊   ┊384┊  > = Resolver<R, Parent, Context>;
+┊   ┊385┊  export type ContentResolver<
+┊   ┊386┊    R = string,
+┊   ┊387┊    Parent = MessageDb,
+┊   ┊388┊    Context = {}
+┊   ┊389┊  > = Resolver<R, Parent, Context>;
+┊   ┊390┊  export type CreatedAtResolver<
+┊   ┊391┊    R = Date,
+┊   ┊392┊    Parent = MessageDb,
+┊   ┊393┊    Context = {}
+┊   ┊394┊  > = Resolver<R, Parent, Context>;
+┊   ┊395┊  export type TypeResolver<
+┊   ┊396┊    R = number,
+┊   ┊397┊    Parent = MessageDb,
+┊   ┊398┊    Context = {}
+┊   ┊399┊  > = Resolver<R, Parent, Context>;
+┊   ┊400┊  export type HoldersResolver<
+┊   ┊401┊    R = UserDb[],
+┊   ┊402┊    Parent = MessageDb,
+┊   ┊403┊    Context = {}
+┊   ┊404┊  > = Resolver<R, Parent, Context>;
+┊   ┊405┊  export type OwnershipResolver<
+┊   ┊406┊    R = boolean,
+┊   ┊407┊    Parent = MessageDb,
+┊   ┊408┊    Context = {}
+┊   ┊409┊  > = Resolver<R, Parent, Context>;
+┊   ┊410┊  export type RecipientsResolver<
+┊   ┊411┊    R = RecipientDb[],
+┊   ┊412┊    Parent = MessageDb,
+┊   ┊413┊    Context = {}
+┊   ┊414┊  > = Resolver<R, Parent, Context>;
+┊   ┊415┊}
+┊   ┊416┊
+┊   ┊417┊export namespace RecipientResolvers {
+┊   ┊418┊  export interface Resolvers<Context = {}, TypeParent = RecipientDb> {
+┊   ┊419┊    user?: UserResolver<UserDb, TypeParent, Context>;
+┊   ┊420┊
+┊   ┊421┊    message?: MessageResolver<MessageDb, TypeParent, Context>;
+┊   ┊422┊
+┊   ┊423┊    chat?: ChatResolver<ChatDb, TypeParent, Context>;
+┊   ┊424┊
+┊   ┊425┊    receivedAt?: ReceivedAtResolver<Maybe<Date>, TypeParent, Context>;
+┊   ┊426┊
+┊   ┊427┊    readAt?: ReadAtResolver<Maybe<Date>, TypeParent, Context>;
+┊   ┊428┊  }
+┊   ┊429┊
+┊   ┊430┊  export type UserResolver<
+┊   ┊431┊    R = UserDb,
+┊   ┊432┊    Parent = RecipientDb,
+┊   ┊433┊    Context = {}
+┊   ┊434┊  > = Resolver<R, Parent, Context>;
+┊   ┊435┊  export type MessageResolver<
+┊   ┊436┊    R = MessageDb,
+┊   ┊437┊    Parent = RecipientDb,
+┊   ┊438┊    Context = {}
+┊   ┊439┊  > = Resolver<R, Parent, Context>;
+┊   ┊440┊  export type ChatResolver<
+┊   ┊441┊    R = ChatDb,
+┊   ┊442┊    Parent = RecipientDb,
+┊   ┊443┊    Context = {}
+┊   ┊444┊  > = Resolver<R, Parent, Context>;
+┊   ┊445┊  export type ReceivedAtResolver<
+┊   ┊446┊    R = Maybe<Date>,
+┊   ┊447┊    Parent = RecipientDb,
+┊   ┊448┊    Context = {}
+┊   ┊449┊  > = Resolver<R, Parent, Context>;
+┊   ┊450┊  export type ReadAtResolver<
+┊   ┊451┊    R = Maybe<Date>,
+┊   ┊452┊    Parent = RecipientDb,
+┊   ┊453┊    Context = {}
+┊   ┊454┊  > = Resolver<R, Parent, Context>;
+┊   ┊455┊}
+┊   ┊456┊
+┊   ┊457┊/** Directs the executor to skip this field or fragment when the `if` argument is true. */
+┊   ┊458┊export type SkipDirectiveResolver<Result> = DirectiveResolverFn<
+┊   ┊459┊  Result,
+┊   ┊460┊  SkipDirectiveArgs,
+┊   ┊461┊  {}
+┊   ┊462┊>;
+┊   ┊463┊export interface SkipDirectiveArgs {
+┊   ┊464┊  /** Skipped when true. */
+┊   ┊465┊  if: boolean;
+┊   ┊466┊}
+┊   ┊467┊
+┊   ┊468┊/** Directs the executor to include this field or fragment only when the `if` argument is true. */
+┊   ┊469┊export type IncludeDirectiveResolver<Result> = DirectiveResolverFn<
+┊   ┊470┊  Result,
+┊   ┊471┊  IncludeDirectiveArgs,
+┊   ┊472┊  {}
+┊   ┊473┊>;
+┊   ┊474┊export interface IncludeDirectiveArgs {
+┊   ┊475┊  /** Included when true. */
+┊   ┊476┊  if: boolean;
+┊   ┊477┊}
+┊   ┊478┊
+┊   ┊479┊/** Marks an element of a GraphQL schema as no longer supported. */
+┊   ┊480┊export type DeprecatedDirectiveResolver<Result> = DirectiveResolverFn<
+┊   ┊481┊  Result,
+┊   ┊482┊  DeprecatedDirectiveArgs,
+┊   ┊483┊  {}
+┊   ┊484┊>;
+┊   ┊485┊export interface DeprecatedDirectiveArgs {
+┊   ┊486┊  /** Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax (as specified by [CommonMark](https://commonmark.org/). */
+┊   ┊487┊  reason?: string;
+┊   ┊488┊}
+┊   ┊489┊
+┊   ┊490┊export interface DateScalarConfig extends GraphQLScalarTypeConfig<Date, any> {
+┊   ┊491┊  name: "Date";
+┊   ┊492┊}
+┊   ┊493┊
+┊   ┊494┊export interface IResolvers<Context = {}> {
+┊   ┊495┊  Query?: QueryResolvers.Resolvers<Context>;
+┊   ┊496┊  User?: UserResolvers.Resolvers<Context>;
+┊   ┊497┊  Chat?: ChatResolvers.Resolvers<Context>;
+┊   ┊498┊  Message?: MessageResolvers.Resolvers<Context>;
+┊   ┊499┊  Recipient?: RecipientResolvers.Resolvers<Context>;
+┊   ┊500┊  Date?: GraphQLScalarType;
+┊   ┊501┊}
+┊   ┊502┊
+┊   ┊503┊export interface IDirectiveResolvers<Result> {
+┊   ┊504┊  skip?: SkipDirectiveResolver<Result>;
+┊   ┊505┊  include?: IncludeDirectiveResolver<Result>;
+┊   ┊506┊  deprecated?: DeprecatedDirectiveResolver<Result>;
+┊   ┊507┊}
```

[}]: #

Now let's use them:

[{]: <helper> (diffStep "2.3")

#### Step 2.3: Use our types

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
@@ -1,6 +1,6 @@
-┊1┊ ┊import { IResolvers } from 'apollo-server-express';
+┊ ┊1┊import { db } from "../db";
 ┊2┊2┊import { GraphQLDateTime } from 'graphql-iso-date';
-┊3┊ ┊import { ChatDb, db, MessageDb, RecipientDb, UserDb } from "../db";
+┊ ┊3┊import { IResolvers } from '../types';
 ┊4┊4┊
 ┊5┊5┊let users = db.users;
 ┊6┊6┊let chats = db.chats;
```
```diff
@@ -9,57 +9,57 @@
 ┊ 9┊ 9┊export const resolvers: IResolvers = {
 ┊10┊10┊  Date: GraphQLDateTime,
 ┊11┊11┊  Query: {
-┊12┊  ┊    me: (): UserDb => currentUser,
-┊13┊  ┊    users: (): UserDb[] => users.filter(user => user.id !== currentUser.id),
-┊14┊  ┊    chats: (): ChatDb[] => chats.filter(chat => chat.listingMemberIds.includes(currentUser.id)),
-┊15┊  ┊    chat: (obj: any, {chatId}): ChatDb | null => chats.find(chat => chat.id === chatId) || null,
+┊  ┊12┊    me: () => currentUser,
+┊  ┊13┊    users: () => users.filter(user => user.id !== currentUser.id),
+┊  ┊14┊    chats: () => chats.filter(chat => chat.listingMemberIds.includes(currentUser.id)),
+┊  ┊15┊    chat: (obj, {chatId}) => chats.find(chat => chat.id === Number(chatId)),
 ┊16┊16┊  },
 ┊17┊17┊  Chat: {
-┊18┊  ┊    name: (chat: ChatDb): string => chat.name ? chat.name : users
+┊  ┊18┊    name: (chat) => chat.name ? chat.name : users
 ┊19┊19┊      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser.id))!.name,
-┊20┊  ┊    picture: (chat: ChatDb) => chat.name ? chat.picture : users
+┊  ┊20┊    picture: (chat) => chat.name ? chat.picture : users
 ┊21┊21┊      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser.id))!.picture,
-┊22┊  ┊    allTimeMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.allTimeMemberIds.includes(user.id)),
-┊23┊  ┊    listingMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.listingMemberIds.includes(user.id)),
-┊24┊  ┊    actualGroupMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)),
-┊25┊  ┊    admins: (chat: ChatDb): UserDb[] => users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
-┊26┊  ┊    owner: (chat: ChatDb): UserDb | null => users.find(user => chat.ownerId === user.id) || null,
-┊27┊  ┊    isGroup: (chat: ChatDb): boolean => !!chat.name,
-┊28┊  ┊    messages: (chat: ChatDb, {amount = 0}: {amount: number}): MessageDb[] => {
+┊  ┊22┊    allTimeMembers: (chat) => users.filter(user => chat.allTimeMemberIds.includes(user.id)),
+┊  ┊23┊    listingMembers: (chat) => users.filter(user => chat.listingMemberIds.includes(user.id)),
+┊  ┊24┊    actualGroupMembers: (chat) => users.filter(user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)),
+┊  ┊25┊    admins: (chat) => users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
+┊  ┊26┊    owner: (chat) => users.find(user => chat.ownerId === user.id) || null,
+┊  ┊27┊    isGroup: (chat) => !!chat.name,
+┊  ┊28┊    messages: (chat, {amount = 0}) => {
 ┊29┊29┊      const messages = chat.messages
 ┊30┊30┊      .filter(message => message.holderIds.includes(currentUser.id))
-┊31┊  ┊      .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf()) || <MessageDb[]>[];
+┊  ┊31┊      .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf()) || [];
 ┊32┊32┊      return (amount ? messages.slice(0, amount) : messages).reverse();
 ┊33┊33┊    },
-┊34┊  ┊    lastMessage: (chat: ChatDb): MessageDb => {
+┊  ┊34┊    lastMessage: (chat) => {
 ┊35┊35┊      return chat.messages
 ┊36┊36┊        .filter(message => message.holderIds.includes(currentUser.id))
 ┊37┊37┊        .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())[0] || null;
 ┊38┊38┊    },
-┊39┊  ┊    updatedAt: (chat: ChatDb): Date => {
+┊  ┊39┊    updatedAt: (chat) => {
 ┊40┊40┊      const lastMessage = chat.messages
 ┊41┊41┊        .filter(message => message.holderIds.includes(currentUser.id))
 ┊42┊42┊        .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())[0];
 ┊43┊43┊
 ┊44┊44┊      return lastMessage ? lastMessage.createdAt : chat.createdAt;
 ┊45┊45┊    },
-┊46┊  ┊    unreadMessages: (chat: ChatDb): number => chat.messages
+┊  ┊46┊    unreadMessages: (chat) => chat.messages
 ┊47┊47┊      .filter(message => message.holderIds.includes(currentUser.id) &&
 ┊48┊48┊        message.recipients.find(recipient => recipient.userId === currentUser.id && !recipient.readAt))
 ┊49┊49┊      .length,
 ┊50┊50┊  },
 ┊51┊51┊  Message: {
-┊52┊  ┊    chat: (message: MessageDb): ChatDb | null => chats.find(chat => message.chatId === chat.id) || null,
-┊53┊  ┊    sender: (message: MessageDb): UserDb | null => users.find(user => user.id === message.senderId) || null,
-┊54┊  ┊    holders: (message: MessageDb): UserDb[] => users.filter(user => message.holderIds.includes(user.id)),
-┊55┊  ┊    ownership: (message: MessageDb): boolean => message.senderId === currentUser.id,
+┊  ┊52┊    chat: (message) => chats.find(chat => message.chatId === chat.id)!,
+┊  ┊53┊    sender: (message) => users.find(user => user.id === message.senderId)!,
+┊  ┊54┊    holders: (message) => users.filter(user => message.holderIds.includes(user.id)),
+┊  ┊55┊    ownership: (message) => message.senderId === currentUser.id,
 ┊56┊56┊  },
 ┊57┊57┊  Recipient: {
-┊58┊  ┊    user: (recipient: RecipientDb): UserDb | null => users.find(user => recipient.userId === user.id) || null,
-┊59┊  ┊    message: (recipient: RecipientDb): MessageDb | null => {
-┊60┊  ┊      const chat = chats.find(chat => recipient.chatId === chat.id);
-┊61┊  ┊      return chat ? chat.messages.find(message => recipient.messageId === message.id) || null : null;
+┊  ┊58┊    user: (recipient) => users.find(user => recipient.userId === user.id)!,
+┊  ┊59┊    message: (recipient) => {
+┊  ┊60┊      const chat = chats.find(chat => recipient.chatId === chat.id)!;
+┊  ┊61┊      return chat.messages.find(message => recipient.messageId === message.id)!;
 ┊62┊62┊    },
-┊63┊  ┊    chat: (recipient: RecipientDb): ChatDb | null => chats.find(chat => recipient.chatId === chat.id) || null,
+┊  ┊63┊    chat: (recipient) => chats.find(chat => recipient.chatId === chat.id)!,
 ┊64┊64┊  },
 ┊65┊65┊};
```

[}]: #

Don't worry, they will be much more useful when we will write our first mutation.

# Chapter 9

Finally we're going to create our mutations in the server:

[{]: <helper> (diffStep "3.1")

#### Step 3.1: Add mutations

##### Changed schema&#x2F;resolvers.ts
```diff
@@ -1,6 +1,7 @@
-┊1┊ ┊import { db } from "../db";
+┊ ┊1┊import { IResolvers } from "../types";
 ┊2┊2┊import { GraphQLDateTime } from 'graphql-iso-date';
-┊3┊ ┊import { IResolvers } from '../types';
+┊ ┊3┊import { ChatDb, db, MessageDb, MessageType, RecipientDb } from "../db";
+┊ ┊4┊import moment from "moment";
 ┊4┊5┊
 ┊5┊6┊let users = db.users;
 ┊6┊7┊let chats = db.chats;
```
```diff
@@ -14,6 +15,298 @@
 ┊ 14┊ 15┊    chats: () => chats.filter(chat => chat.listingMemberIds.includes(currentUser.id)),
 ┊ 15┊ 16┊    chat: (obj, {chatId}) => chats.find(chat => chat.id === Number(chatId)),
 ┊ 16┊ 17┊  },
+┊   ┊ 18┊  Mutation: {
+┊   ┊ 19┊    updateUser: (obj, {name, picture}) => {
+┊   ┊ 20┊      currentUser.name = name || currentUser.name;
+┊   ┊ 21┊      currentUser.picture = picture || currentUser.picture;
+┊   ┊ 22┊
+┊   ┊ 23┊      return currentUser;
+┊   ┊ 24┊    },
+┊   ┊ 25┊    addChat: (obj, {userId}) => {
+┊   ┊ 26┊      if (!users.find(user => user.id === Number(userId))) {
+┊   ┊ 27┊        throw new Error(`User ${userId} doesn't exist.`);
+┊   ┊ 28┊      }
+┊   ┊ 29┊
+┊   ┊ 30┊      const chat = chats.find(chat => !chat.name && chat.allTimeMemberIds.includes(currentUser.id) && chat.allTimeMemberIds.includes(Number(userId)));
+┊   ┊ 31┊      if (chat) {
+┊   ┊ 32┊        // Chat already exists. Both users are already in the allTimeMemberIds array
+┊   ┊ 33┊        const chatId = chat.id;
+┊   ┊ 34┊        if (!chat.listingMemberIds.includes(currentUser.id)) {
+┊   ┊ 35┊          // The chat isn't listed for the current user. Add him to the memberIds
+┊   ┊ 36┊          chat.listingMemberIds.push(currentUser.id);
+┊   ┊ 37┊          chats.find(chat => chat.id === chatId)!.listingMemberIds.push(currentUser.id);
+┊   ┊ 38┊          return chat;
+┊   ┊ 39┊        } else {
+┊   ┊ 40┊          throw new Error(`Chat already exists.`);
+┊   ┊ 41┊        }
+┊   ┊ 42┊      } else {
+┊   ┊ 43┊        // Create the chat
+┊   ┊ 44┊        const id = (chats.length && chats[chats.length - 1].id + 1) || 1;
+┊   ┊ 45┊        const chat: ChatDb = {
+┊   ┊ 46┊          id,
+┊   ┊ 47┊          createdAt: moment().toDate(),
+┊   ┊ 48┊          name: null,
+┊   ┊ 49┊          picture: null,
+┊   ┊ 50┊          adminIds: null,
+┊   ┊ 51┊          ownerId: null,
+┊   ┊ 52┊          allTimeMemberIds: [currentUser.id, Number(userId)],
+┊   ┊ 53┊          // Chat will not be listed to the other user until the first message gets written
+┊   ┊ 54┊          listingMemberIds: [currentUser.id],
+┊   ┊ 55┊          actualGroupMemberIds: null,
+┊   ┊ 56┊          messages: [],
+┊   ┊ 57┊        };
+┊   ┊ 58┊        chats.push(chat);
+┊   ┊ 59┊        return chat;
+┊   ┊ 60┊      }
+┊   ┊ 61┊    },
+┊   ┊ 62┊    addGroup: (obj, {userIds, groupName, groupPicture}) => {
+┊   ┊ 63┊      userIds.forEach(userId => {
+┊   ┊ 64┊        if (!users.find(user => user.id === Number(userId))) {
+┊   ┊ 65┊          throw new Error(`User ${userId} doesn't exist.`);
+┊   ┊ 66┊        }
+┊   ┊ 67┊      });
+┊   ┊ 68┊
+┊   ┊ 69┊      const id = (chats.length && chats[chats.length - 1].id + 1) || 1;
+┊   ┊ 70┊      const chat: ChatDb = {
+┊   ┊ 71┊        id,
+┊   ┊ 72┊        createdAt: moment().toDate(),
+┊   ┊ 73┊        name: groupName,
+┊   ┊ 74┊        picture: groupPicture || null,
+┊   ┊ 75┊        adminIds: [currentUser.id],
+┊   ┊ 76┊        ownerId: currentUser.id,
+┊   ┊ 77┊        allTimeMemberIds: [currentUser.id, ...userIds.map(id => Number(id))],
+┊   ┊ 78┊        listingMemberIds: [currentUser.id, ...userIds.map(id => Number(id))],
+┊   ┊ 79┊        actualGroupMemberIds: [currentUser.id, ...userIds.map(id => Number(id))],
+┊   ┊ 80┊        messages: [],
+┊   ┊ 81┊      };
+┊   ┊ 82┊      chats.push(chat);
+┊   ┊ 83┊      return chat;
+┊   ┊ 84┊    },
+┊   ┊ 85┊    updateGroup: (obj, {chatId, groupName, groupPicture}) => {
+┊   ┊ 86┊      const chat = chats.find(chat => chat.id === Number(chatId));
+┊   ┊ 87┊
+┊   ┊ 88┊      if (!chat) {
+┊   ┊ 89┊        throw new Error(`The chat ${chatId} doesn't exist.`);
+┊   ┊ 90┊      }
+┊   ┊ 91┊
+┊   ┊ 92┊      if (!chat.name) {
+┊   ┊ 93┊        throw new Error(`The chat ${chatId} is not a group.`);
+┊   ┊ 94┊      }
+┊   ┊ 95┊
+┊   ┊ 96┊      chat.name = groupName || chat.name;
+┊   ┊ 97┊      chat.picture = groupPicture || chat.picture;
+┊   ┊ 98┊
+┊   ┊ 99┊      return chat;
+┊   ┊100┊    },
+┊   ┊101┊    removeChat: (obj, {chatId}) => {
+┊   ┊102┊      const chat = chats.find(chat => chat.id === Number(chatId));
+┊   ┊103┊
+┊   ┊104┊      if (!chat) {
+┊   ┊105┊        throw new Error(`The chat ${chatId} doesn't exist.`);
+┊   ┊106┊      }
+┊   ┊107┊
+┊   ┊108┊      if (!chat.name) {
+┊   ┊109┊        // Chat
+┊   ┊110┊        if (!chat.listingMemberIds.includes(currentUser.id)) {
+┊   ┊111┊          throw new Error(`The user is not a member of the chat ${chatId}.`);
+┊   ┊112┊        }
+┊   ┊113┊
+┊   ┊114┊        // Instead of chaining map and filter we can loop once using reduce
+┊   ┊115┊        const messages = chat.messages.reduce<MessageDb[]>((filtered, message) => {
+┊   ┊116┊          // Remove the current user from the message holders
+┊   ┊117┊          message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser.id);
+┊   ┊118┊
+┊   ┊119┊          if (message.holderIds.length !== 0) {
+┊   ┊120┊            filtered.push(message);
+┊   ┊121┊          } // else discard the message
+┊   ┊122┊
+┊   ┊123┊          return filtered;
+┊   ┊124┊        }, []);
+┊   ┊125┊
+┊   ┊126┊        // Remove the current user from who gets the chat listed. The chat will no longer appear in his list
+┊   ┊127┊        const listingMemberIds = chat.listingMemberIds.filter(listingId => listingId !== currentUser.id);
+┊   ┊128┊
+┊   ┊129┊        // Check how many members are left
+┊   ┊130┊        if (listingMemberIds.length === 0) {
+┊   ┊131┊          // Delete the chat
+┊   ┊132┊          chats = chats.filter(chat => chat.id !== Number(chatId));
+┊   ┊133┊        } else {
+┊   ┊134┊          // Update the chat
+┊   ┊135┊          chats = chats.map(chat => {
+┊   ┊136┊            if (chat.id === Number(chatId)) {
+┊   ┊137┊              chat = {...chat, listingMemberIds, messages};
+┊   ┊138┊            }
+┊   ┊139┊            return chat;
+┊   ┊140┊          });
+┊   ┊141┊        }
+┊   ┊142┊        return chatId;
+┊   ┊143┊      } else {
+┊   ┊144┊        // Group
+┊   ┊145┊        if (chat.ownerId !== currentUser.id) {
+┊   ┊146┊          throw new Error(`Group ${chatId} is not owned by the user.`);
+┊   ┊147┊        }
+┊   ┊148┊
+┊   ┊149┊        // Instead of chaining map and filter we can loop once using reduce
+┊   ┊150┊        const messages = chat.messages.reduce<MessageDb[]>((filtered, message) => {
+┊   ┊151┊          // Remove the current user from the message holders
+┊   ┊152┊          message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser.id);
+┊   ┊153┊
+┊   ┊154┊          if (message.holderIds.length !== 0) {
+┊   ┊155┊            filtered.push(message);
+┊   ┊156┊          } // else discard the message
+┊   ┊157┊
+┊   ┊158┊          return filtered;
+┊   ┊159┊        }, []);
+┊   ┊160┊
+┊   ┊161┊        // Remove the current user from who gets the group listed. The group will no longer appear in his list
+┊   ┊162┊        const listingMemberIds = chat.listingMemberIds.filter(listingId => listingId !== currentUser.id);
+┊   ┊163┊
+┊   ┊164┊        // Check how many members (including previous ones who can still access old messages) are left
+┊   ┊165┊        if (listingMemberIds.length === 0) {
+┊   ┊166┊          // Remove the group
+┊   ┊167┊          chats = chats.filter(chat => chat.id !== Number(chatId));
+┊   ┊168┊        } else {
+┊   ┊169┊          // Update the group
+┊   ┊170┊
+┊   ┊171┊          // Remove the current user from the chat members. He is no longer a member of the group
+┊   ┊172┊          const actualGroupMemberIds = chat.actualGroupMemberIds!.filter(memberId => memberId !== currentUser.id);
+┊   ┊173┊          // Remove the current user from the chat admins
+┊   ┊174┊          const adminIds = chat.adminIds!.filter(memberId => memberId !== currentUser.id);
+┊   ┊175┊          // Set the owner id to be null. A null owner means the group is read-only
+┊   ┊176┊          let ownerId: number | null = null;
+┊   ┊177┊
+┊   ┊178┊          // Check if there is any admin left
+┊   ┊179┊          if (adminIds!.length) {
+┊   ┊180┊            // Pick an admin as the new owner. The group is no longer read-only
+┊   ┊181┊            ownerId = chat.adminIds![0];
+┊   ┊182┊          }
+┊   ┊183┊
+┊   ┊184┊          chats = chats.map(chat => {
+┊   ┊185┊            if (chat.id === Number(chatId)) {
+┊   ┊186┊              chat = {...chat, messages, listingMemberIds, actualGroupMemberIds, adminIds, ownerId};
+┊   ┊187┊            }
+┊   ┊188┊            return chat;
+┊   ┊189┊          });
+┊   ┊190┊        }
+┊   ┊191┊        return chatId;
+┊   ┊192┊      }
+┊   ┊193┊    },
+┊   ┊194┊    addMessage: (obj, {chatId, content}) => {
+┊   ┊195┊      if (content === null || content === '') {
+┊   ┊196┊        throw new Error(`Cannot add empty or null messages.`);
+┊   ┊197┊      }
+┊   ┊198┊
+┊   ┊199┊      let chat = chats.find(chat => chat.id === Number(chatId));
+┊   ┊200┊
+┊   ┊201┊      if (!chat) {
+┊   ┊202┊        throw new Error(`Cannot find chat ${chatId}.`);
+┊   ┊203┊      }
+┊   ┊204┊
+┊   ┊205┊      let holderIds = chat.listingMemberIds;
+┊   ┊206┊
+┊   ┊207┊      if (!chat.name) {
+┊   ┊208┊        // Chat
+┊   ┊209┊        if (!chat.listingMemberIds.find(listingId => listingId === currentUser.id)) {
+┊   ┊210┊          throw new Error(`The chat ${chatId} must be listed for the current user before adding a message.`);
+┊   ┊211┊        }
+┊   ┊212┊
+┊   ┊213┊        // Receiver's user
+┊   ┊214┊        const receiverId = chat.allTimeMemberIds.find(userId => userId !== currentUser.id);
+┊   ┊215┊
+┊   ┊216┊        if (!receiverId) {
+┊   ┊217┊          throw new Error(`Cannot find receiver's user.`);
+┊   ┊218┊        }
+┊   ┊219┊
+┊   ┊220┊        if (!chat.listingMemberIds.find(listingId => listingId === receiverId)) {
+┊   ┊221┊          // Chat is not listed for the receiver user. Add him to the listingMemberIds
+┊   ┊222┊          chat.listingMemberIds = chat.listingMemberIds.concat(receiverId);
+┊   ┊223┊
+┊   ┊224┊          holderIds = chat.listingMemberIds;
+┊   ┊225┊        }
+┊   ┊226┊      } else {
+┊   ┊227┊        // Group
+┊   ┊228┊        if (!chat.actualGroupMemberIds!.find(memberId => memberId === currentUser.id)) {
+┊   ┊229┊          throw new Error(`The user is not a member of the group ${chatId}. Cannot add message.`);
+┊   ┊230┊        }
+┊   ┊231┊
+┊   ┊232┊        holderIds = chat.actualGroupMemberIds!;
+┊   ┊233┊      }
+┊   ┊234┊
+┊   ┊235┊      const id = (chat.messages.length && chat.messages[chat.messages.length - 1].id + 1) || 1;
+┊   ┊236┊
+┊   ┊237┊      let recipients: RecipientDb[] = [];
+┊   ┊238┊
+┊   ┊239┊      holderIds.forEach(holderId => {
+┊   ┊240┊        if (holderId !== currentUser.id) {
+┊   ┊241┊          recipients.push({
+┊   ┊242┊            userId: holderId,
+┊   ┊243┊            messageId: id,
+┊   ┊244┊            chatId: Number(chatId),
+┊   ┊245┊            receivedAt: null,
+┊   ┊246┊            readAt: null,
+┊   ┊247┊          });
+┊   ┊248┊        }
+┊   ┊249┊      });
+┊   ┊250┊
+┊   ┊251┊      const message: MessageDb = {
+┊   ┊252┊        id,
+┊   ┊253┊        chatId: Number(chatId),
+┊   ┊254┊        senderId: currentUser.id,
+┊   ┊255┊        content,
+┊   ┊256┊        createdAt: moment().toDate(),
+┊   ┊257┊        type: MessageType.TEXT,
+┊   ┊258┊        recipients,
+┊   ┊259┊        holderIds,
+┊   ┊260┊      };
+┊   ┊261┊
+┊   ┊262┊      chats = chats.map(chat => {
+┊   ┊263┊        if (chat.id === Number(chatId)) {
+┊   ┊264┊          chat = {...chat, messages: chat.messages.concat(message)}
+┊   ┊265┊        }
+┊   ┊266┊        return chat;
+┊   ┊267┊      });
+┊   ┊268┊
+┊   ┊269┊      return message;
+┊   ┊270┊    },
+┊   ┊271┊    removeMessages: (obj, {chatId, messageIds, all}) => {
+┊   ┊272┊      const chat = chats.find(chat => chat.id === Number(chatId));
+┊   ┊273┊
+┊   ┊274┊      if (!chat) {
+┊   ┊275┊        throw new Error(`Cannot find chat ${chatId}.`);
+┊   ┊276┊      }
+┊   ┊277┊
+┊   ┊278┊      if (!chat.listingMemberIds.find(listingId => listingId === currentUser.id)) {
+┊   ┊279┊        throw new Error(`The chat/group ${chatId} is not listed for the current user, so there is nothing to delete.`);
+┊   ┊280┊      }
+┊   ┊281┊
+┊   ┊282┊      if (all && messageIds) {
+┊   ┊283┊        throw new Error(`Cannot specify both 'all' and 'messageIds'.`);
+┊   ┊284┊      }
+┊   ┊285┊
+┊   ┊286┊      let deletedIds: string[] = [];
+┊   ┊287┊      chats = chats.map(chat => {
+┊   ┊288┊        if (chat.id === Number(chatId)) {
+┊   ┊289┊          // Instead of chaining map and filter we can loop once using reduce
+┊   ┊290┊          const messages = chat.messages.reduce<MessageDb[]>((filtered, message) => {
+┊   ┊291┊            if (all || messageIds!.map(Number).includes(message.id)) {
+┊   ┊292┊              deletedIds.push(String(message.id));
+┊   ┊293┊              // Remove the current user from the message holders
+┊   ┊294┊              message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser.id);
+┊   ┊295┊            }
+┊   ┊296┊
+┊   ┊297┊            if (message.holderIds.length !== 0) {
+┊   ┊298┊              filtered.push(message);
+┊   ┊299┊            } // else discard the message
+┊   ┊300┊
+┊   ┊301┊            return filtered;
+┊   ┊302┊          }, []);
+┊   ┊303┊          chat = {...chat, messages};
+┊   ┊304┊        }
+┊   ┊305┊        return chat;
+┊   ┊306┊      });
+┊   ┊307┊      return deletedIds;
+┊   ┊308┊    },
+┊   ┊309┊  },
 ┊ 17┊310┊  Chat: {
 ┊ 18┊311┊    name: (chat) => chat.name ? chat.name : users
 ┊ 19┊312┊      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser.id))!.name,
```

##### Changed schema&#x2F;typeDefs.ts
```diff
@@ -73,4 +73,22 @@
 ┊73┊73┊    picture: String
 ┊74┊74┊    phone: String
 ┊75┊75┊  }
+┊  ┊76┊
+┊  ┊77┊  type Mutation {
+┊  ┊78┊    updateUser(name: String, picture: String): User!
+┊  ┊79┊    addChat(userId: ID!): Chat
+┊  ┊80┊    addGroup(userIds: [ID!]!, groupName: String!, groupPicture: String): Chat
+┊  ┊81┊    updateGroup(chatId: ID!, groupName: String, groupPicture: String): Chat
+┊  ┊82┊    removeChat(chatId: ID!): ID
+┊  ┊83┊    addMessage(chatId: ID!, content: String!): Message
+┊  ┊84┊    removeMessages(chatId: ID!, messageIds: [ID], all: Boolean): [ID]
+┊  ┊85┊    addMembers(groupId: ID!, userIds: [ID!]!): [ID]
+┊  ┊86┊    removeMembers(groupId: ID!, userIds: [ID!]!): [ID]
+┊  ┊87┊    addAdmins(groupId: ID!, userIds: [ID!]!): [ID]
+┊  ┊88┊    removeAdmins(groupId: ID!, userIds: [ID!]!): [ID]
+┊  ┊89┊    setGroupName(groupId: ID!): String
+┊  ┊90┊    setGroupPicture(groupId: ID!): String
+┊  ┊91┊    markAsReceived(chatId: ID!): Boolean
+┊  ┊92┊    markAsRead(chatId: ID!): Boolean
+┊  ┊93┊  }
 ┊76┊94┊`;
```

##### Changed types.d.ts
```diff
@@ -98,6 +98,38 @@
 ┊ 98┊ 98┊  readAt?: Maybe<Date>;
 ┊ 99┊ 99┊}
 ┊100┊100┊
+┊   ┊101┊export interface Mutation {
+┊   ┊102┊  updateUser: User;
+┊   ┊103┊
+┊   ┊104┊  addChat?: Maybe<Chat>;
+┊   ┊105┊
+┊   ┊106┊  addGroup?: Maybe<Chat>;
+┊   ┊107┊
+┊   ┊108┊  updateGroup?: Maybe<Chat>;
+┊   ┊109┊
+┊   ┊110┊  removeChat?: Maybe<string>;
+┊   ┊111┊
+┊   ┊112┊  addMessage?: Maybe<Message>;
+┊   ┊113┊
+┊   ┊114┊  removeMessages?: Maybe<(Maybe<string>)[]>;
+┊   ┊115┊
+┊   ┊116┊  addMembers?: Maybe<(Maybe<string>)[]>;
+┊   ┊117┊
+┊   ┊118┊  removeMembers?: Maybe<(Maybe<string>)[]>;
+┊   ┊119┊
+┊   ┊120┊  addAdmins?: Maybe<(Maybe<string>)[]>;
+┊   ┊121┊
+┊   ┊122┊  removeAdmins?: Maybe<(Maybe<string>)[]>;
+┊   ┊123┊
+┊   ┊124┊  setGroupName?: Maybe<string>;
+┊   ┊125┊
+┊   ┊126┊  setGroupPicture?: Maybe<string>;
+┊   ┊127┊
+┊   ┊128┊  markAsReceived?: Maybe<boolean>;
+┊   ┊129┊
+┊   ┊130┊  markAsRead?: Maybe<boolean>;
+┊   ┊131┊}
+┊   ┊132┊
 ┊101┊133┊// ====================================================
 ┊102┊134┊// Arguments
 ┊103┊135┊// ====================================================
```
```diff
@@ -108,6 +140,75 @@
 ┊108┊140┊export interface MessagesChatArgs {
 ┊109┊141┊  amount?: Maybe<number>;
 ┊110┊142┊}
+┊   ┊143┊export interface UpdateUserMutationArgs {
+┊   ┊144┊  name?: Maybe<string>;
+┊   ┊145┊
+┊   ┊146┊  picture?: Maybe<string>;
+┊   ┊147┊}
+┊   ┊148┊export interface AddChatMutationArgs {
+┊   ┊149┊  userId: string;
+┊   ┊150┊}
+┊   ┊151┊export interface AddGroupMutationArgs {
+┊   ┊152┊  userIds: string[];
+┊   ┊153┊
+┊   ┊154┊  groupName: string;
+┊   ┊155┊
+┊   ┊156┊  groupPicture?: Maybe<string>;
+┊   ┊157┊}
+┊   ┊158┊export interface UpdateGroupMutationArgs {
+┊   ┊159┊  chatId: string;
+┊   ┊160┊
+┊   ┊161┊  groupName?: Maybe<string>;
+┊   ┊162┊
+┊   ┊163┊  groupPicture?: Maybe<string>;
+┊   ┊164┊}
+┊   ┊165┊export interface RemoveChatMutationArgs {
+┊   ┊166┊  chatId: string;
+┊   ┊167┊}
+┊   ┊168┊export interface AddMessageMutationArgs {
+┊   ┊169┊  chatId: string;
+┊   ┊170┊
+┊   ┊171┊  content: string;
+┊   ┊172┊}
+┊   ┊173┊export interface RemoveMessagesMutationArgs {
+┊   ┊174┊  chatId: string;
+┊   ┊175┊
+┊   ┊176┊  messageIds?: Maybe<(Maybe<string>)[]>;
+┊   ┊177┊
+┊   ┊178┊  all?: Maybe<boolean>;
+┊   ┊179┊}
+┊   ┊180┊export interface AddMembersMutationArgs {
+┊   ┊181┊  groupId: string;
+┊   ┊182┊
+┊   ┊183┊  userIds: string[];
+┊   ┊184┊}
+┊   ┊185┊export interface RemoveMembersMutationArgs {
+┊   ┊186┊  groupId: string;
+┊   ┊187┊
+┊   ┊188┊  userIds: string[];
+┊   ┊189┊}
+┊   ┊190┊export interface AddAdminsMutationArgs {
+┊   ┊191┊  groupId: string;
+┊   ┊192┊
+┊   ┊193┊  userIds: string[];
+┊   ┊194┊}
+┊   ┊195┊export interface RemoveAdminsMutationArgs {
+┊   ┊196┊  groupId: string;
+┊   ┊197┊
+┊   ┊198┊  userIds: string[];
+┊   ┊199┊}
+┊   ┊200┊export interface SetGroupNameMutationArgs {
+┊   ┊201┊  groupId: string;
+┊   ┊202┊}
+┊   ┊203┊export interface SetGroupPictureMutationArgs {
+┊   ┊204┊  groupId: string;
+┊   ┊205┊}
+┊   ┊206┊export interface MarkAsReceivedMutationArgs {
+┊   ┊207┊  chatId: string;
+┊   ┊208┊}
+┊   ┊209┊export interface MarkAsReadMutationArgs {
+┊   ┊210┊  chatId: string;
+┊   ┊211┊}
 ┊111┊212┊
 ┊112┊213┊import {
 ┊113┊214┊  GraphQLResolveInfo,
```
```diff
@@ -454,6 +555,227 @@
 ┊454┊555┊  > = Resolver<R, Parent, Context>;
 ┊455┊556┊}
 ┊456┊557┊
+┊   ┊558┊export namespace MutationResolvers {
+┊   ┊559┊  export interface Resolvers<Context = {}, TypeParent = {}> {
+┊   ┊560┊    updateUser?: UpdateUserResolver<UserDb, TypeParent, Context>;
+┊   ┊561┊
+┊   ┊562┊    addChat?: AddChatResolver<Maybe<ChatDb>, TypeParent, Context>;
+┊   ┊563┊
+┊   ┊564┊    addGroup?: AddGroupResolver<Maybe<ChatDb>, TypeParent, Context>;
+┊   ┊565┊
+┊   ┊566┊    updateGroup?: UpdateGroupResolver<Maybe<ChatDb>, TypeParent, Context>;
+┊   ┊567┊
+┊   ┊568┊    removeChat?: RemoveChatResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊569┊
+┊   ┊570┊    addMessage?: AddMessageResolver<Maybe<MessageDb>, TypeParent, Context>;
+┊   ┊571┊
+┊   ┊572┊    removeMessages?: RemoveMessagesResolver<
+┊   ┊573┊      Maybe<(Maybe<string>)[]>,
+┊   ┊574┊      TypeParent,
+┊   ┊575┊      Context
+┊   ┊576┊    >;
+┊   ┊577┊
+┊   ┊578┊    addMembers?: AddMembersResolver<
+┊   ┊579┊      Maybe<(Maybe<string>)[]>,
+┊   ┊580┊      TypeParent,
+┊   ┊581┊      Context
+┊   ┊582┊    >;
+┊   ┊583┊
+┊   ┊584┊    removeMembers?: RemoveMembersResolver<
+┊   ┊585┊      Maybe<(Maybe<string>)[]>,
+┊   ┊586┊      TypeParent,
+┊   ┊587┊      Context
+┊   ┊588┊    >;
+┊   ┊589┊
+┊   ┊590┊    addAdmins?: AddAdminsResolver<
+┊   ┊591┊      Maybe<(Maybe<string>)[]>,
+┊   ┊592┊      TypeParent,
+┊   ┊593┊      Context
+┊   ┊594┊    >;
+┊   ┊595┊
+┊   ┊596┊    removeAdmins?: RemoveAdminsResolver<
+┊   ┊597┊      Maybe<(Maybe<string>)[]>,
+┊   ┊598┊      TypeParent,
+┊   ┊599┊      Context
+┊   ┊600┊    >;
+┊   ┊601┊
+┊   ┊602┊    setGroupName?: SetGroupNameResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊603┊
+┊   ┊604┊    setGroupPicture?: SetGroupPictureResolver<
+┊   ┊605┊      Maybe<string>,
+┊   ┊606┊      TypeParent,
+┊   ┊607┊      Context
+┊   ┊608┊    >;
+┊   ┊609┊
+┊   ┊610┊    markAsReceived?: MarkAsReceivedResolver<
+┊   ┊611┊      Maybe<boolean>,
+┊   ┊612┊      TypeParent,
+┊   ┊613┊      Context
+┊   ┊614┊    >;
+┊   ┊615┊
+┊   ┊616┊    markAsRead?: MarkAsReadResolver<Maybe<boolean>, TypeParent, Context>;
+┊   ┊617┊  }
+┊   ┊618┊
+┊   ┊619┊  export type UpdateUserResolver<
+┊   ┊620┊    R = UserDb,
+┊   ┊621┊    Parent = {},
+┊   ┊622┊    Context = {}
+┊   ┊623┊  > = Resolver<R, Parent, Context, UpdateUserArgs>;
+┊   ┊624┊  export interface UpdateUserArgs {
+┊   ┊625┊    name?: Maybe<string>;
+┊   ┊626┊
+┊   ┊627┊    picture?: Maybe<string>;
+┊   ┊628┊  }
+┊   ┊629┊
+┊   ┊630┊  export type AddChatResolver<
+┊   ┊631┊    R = Maybe<ChatDb>,
+┊   ┊632┊    Parent = {},
+┊   ┊633┊    Context = {}
+┊   ┊634┊  > = Resolver<R, Parent, Context, AddChatArgs>;
+┊   ┊635┊  export interface AddChatArgs {
+┊   ┊636┊    userId: string;
+┊   ┊637┊  }
+┊   ┊638┊
+┊   ┊639┊  export type AddGroupResolver<
+┊   ┊640┊    R = Maybe<ChatDb>,
+┊   ┊641┊    Parent = {},
+┊   ┊642┊    Context = {}
+┊   ┊643┊  > = Resolver<R, Parent, Context, AddGroupArgs>;
+┊   ┊644┊  export interface AddGroupArgs {
+┊   ┊645┊    userIds: string[];
+┊   ┊646┊
+┊   ┊647┊    groupName: string;
+┊   ┊648┊
+┊   ┊649┊    groupPicture?: Maybe<string>;
+┊   ┊650┊  }
+┊   ┊651┊
+┊   ┊652┊  export type UpdateGroupResolver<
+┊   ┊653┊    R = Maybe<ChatDb>,
+┊   ┊654┊    Parent = {},
+┊   ┊655┊    Context = {}
+┊   ┊656┊  > = Resolver<R, Parent, Context, UpdateGroupArgs>;
+┊   ┊657┊  export interface UpdateGroupArgs {
+┊   ┊658┊    chatId: string;
+┊   ┊659┊
+┊   ┊660┊    groupName?: Maybe<string>;
+┊   ┊661┊
+┊   ┊662┊    groupPicture?: Maybe<string>;
+┊   ┊663┊  }
+┊   ┊664┊
+┊   ┊665┊  export type RemoveChatResolver<
+┊   ┊666┊    R = Maybe<string>,
+┊   ┊667┊    Parent = {},
+┊   ┊668┊    Context = {}
+┊   ┊669┊  > = Resolver<R, Parent, Context, RemoveChatArgs>;
+┊   ┊670┊  export interface RemoveChatArgs {
+┊   ┊671┊    chatId: string;
+┊   ┊672┊  }
+┊   ┊673┊
+┊   ┊674┊  export type AddMessageResolver<
+┊   ┊675┊    R = Maybe<MessageDb>,
+┊   ┊676┊    Parent = {},
+┊   ┊677┊    Context = {}
+┊   ┊678┊  > = Resolver<R, Parent, Context, AddMessageArgs>;
+┊   ┊679┊  export interface AddMessageArgs {
+┊   ┊680┊    chatId: string;
+┊   ┊681┊
+┊   ┊682┊    content: string;
+┊   ┊683┊  }
+┊   ┊684┊
+┊   ┊685┊  export type RemoveMessagesResolver<
+┊   ┊686┊    R = Maybe<(Maybe<string>)[]>,
+┊   ┊687┊    Parent = {},
+┊   ┊688┊    Context = {}
+┊   ┊689┊  > = Resolver<R, Parent, Context, RemoveMessagesArgs>;
+┊   ┊690┊  export interface RemoveMessagesArgs {
+┊   ┊691┊    chatId: string;
+┊   ┊692┊
+┊   ┊693┊    messageIds?: Maybe<(Maybe<string>)[]>;
+┊   ┊694┊
+┊   ┊695┊    all?: Maybe<boolean>;
+┊   ┊696┊  }
+┊   ┊697┊
+┊   ┊698┊  export type AddMembersResolver<
+┊   ┊699┊    R = Maybe<(Maybe<string>)[]>,
+┊   ┊700┊    Parent = {},
+┊   ┊701┊    Context = {}
+┊   ┊702┊  > = Resolver<R, Parent, Context, AddMembersArgs>;
+┊   ┊703┊  export interface AddMembersArgs {
+┊   ┊704┊    groupId: string;
+┊   ┊705┊
+┊   ┊706┊    userIds: string[];
+┊   ┊707┊  }
+┊   ┊708┊
+┊   ┊709┊  export type RemoveMembersResolver<
+┊   ┊710┊    R = Maybe<(Maybe<string>)[]>,
+┊   ┊711┊    Parent = {},
+┊   ┊712┊    Context = {}
+┊   ┊713┊  > = Resolver<R, Parent, Context, RemoveMembersArgs>;
+┊   ┊714┊  export interface RemoveMembersArgs {
+┊   ┊715┊    groupId: string;
+┊   ┊716┊
+┊   ┊717┊    userIds: string[];
+┊   ┊718┊  }
+┊   ┊719┊
+┊   ┊720┊  export type AddAdminsResolver<
+┊   ┊721┊    R = Maybe<(Maybe<string>)[]>,
+┊   ┊722┊    Parent = {},
+┊   ┊723┊    Context = {}
+┊   ┊724┊  > = Resolver<R, Parent, Context, AddAdminsArgs>;
+┊   ┊725┊  export interface AddAdminsArgs {
+┊   ┊726┊    groupId: string;
+┊   ┊727┊
+┊   ┊728┊    userIds: string[];
+┊   ┊729┊  }
+┊   ┊730┊
+┊   ┊731┊  export type RemoveAdminsResolver<
+┊   ┊732┊    R = Maybe<(Maybe<string>)[]>,
+┊   ┊733┊    Parent = {},
+┊   ┊734┊    Context = {}
+┊   ┊735┊  > = Resolver<R, Parent, Context, RemoveAdminsArgs>;
+┊   ┊736┊  export interface RemoveAdminsArgs {
+┊   ┊737┊    groupId: string;
+┊   ┊738┊
+┊   ┊739┊    userIds: string[];
+┊   ┊740┊  }
+┊   ┊741┊
+┊   ┊742┊  export type SetGroupNameResolver<
+┊   ┊743┊    R = Maybe<string>,
+┊   ┊744┊    Parent = {},
+┊   ┊745┊    Context = {}
+┊   ┊746┊  > = Resolver<R, Parent, Context, SetGroupNameArgs>;
+┊   ┊747┊  export interface SetGroupNameArgs {
+┊   ┊748┊    groupId: string;
+┊   ┊749┊  }
+┊   ┊750┊
+┊   ┊751┊  export type SetGroupPictureResolver<
+┊   ┊752┊    R = Maybe<string>,
+┊   ┊753┊    Parent = {},
+┊   ┊754┊    Context = {}
+┊   ┊755┊  > = Resolver<R, Parent, Context, SetGroupPictureArgs>;
+┊   ┊756┊  export interface SetGroupPictureArgs {
+┊   ┊757┊    groupId: string;
+┊   ┊758┊  }
+┊   ┊759┊
+┊   ┊760┊  export type MarkAsReceivedResolver<
+┊   ┊761┊    R = Maybe<boolean>,
+┊   ┊762┊    Parent = {},
+┊   ┊763┊    Context = {}
+┊   ┊764┊  > = Resolver<R, Parent, Context, MarkAsReceivedArgs>;
+┊   ┊765┊  export interface MarkAsReceivedArgs {
+┊   ┊766┊    chatId: string;
+┊   ┊767┊  }
+┊   ┊768┊
+┊   ┊769┊  export type MarkAsReadResolver<
+┊   ┊770┊    R = Maybe<boolean>,
+┊   ┊771┊    Parent = {},
+┊   ┊772┊    Context = {}
+┊   ┊773┊  > = Resolver<R, Parent, Context, MarkAsReadArgs>;
+┊   ┊774┊  export interface MarkAsReadArgs {
+┊   ┊775┊    chatId: string;
+┊   ┊776┊  }
+┊   ┊777┊}
+┊   ┊778┊
 ┊457┊779┊/** Directs the executor to skip this field or fragment when the `if` argument is true. */
 ┊458┊780┊export type SkipDirectiveResolver<Result> = DirectiveResolverFn<
 ┊459┊781┊  Result,
```
```diff
@@ -497,6 +819,7 @@
 ┊497┊819┊  Chat?: ChatResolvers.Resolvers<Context>;
 ┊498┊820┊  Message?: MessageResolvers.Resolvers<Context>;
 ┊499┊821┊  Recipient?: RecipientResolvers.Resolvers<Context>;
+┊   ┊822┊  Mutation?: MutationResolvers.Resolvers<Context>;
 ┊500┊823┊  Date?: GraphQLScalarType;
 ┊501┊824┊}
```

[}]: #

    $ npm run generator

[{]: <helper> (diffStep "3.3")

#### Step 3.3: NOT FOUND!

[}]: #



[//]: # (foot-start)

[{]: <helper> (navStep)

| [< Previous Step](step2.md) | [Next Step >](step4.md) |
|:--------------------------------|--------------------------------:|

[}]: #

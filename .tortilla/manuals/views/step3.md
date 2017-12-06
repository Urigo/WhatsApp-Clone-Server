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
+┊   ┊ 30┊  messages: MessageDb[],
+┊   ┊ 31┊}
+┊   ┊ 32┊
+┊   ┊ 33┊export interface MessageDb {
+┊   ┊ 34┊  id: number,
+┊   ┊ 35┊  chatId: number,
+┊   ┊ 36┊  senderId: number,
+┊   ┊ 37┊  content: string,
+┊   ┊ 38┊  createdAt: number,
+┊   ┊ 39┊  type: MessageType,
+┊   ┊ 40┊  recipients: RecipientDb[],
+┊   ┊ 41┊  holderIds: number[],
+┊   ┊ 42┊}
+┊   ┊ 43┊
+┊   ┊ 44┊export interface RecipientDb {
+┊   ┊ 45┊  userId: number,
+┊   ┊ 46┊  messageId: number,
+┊   ┊ 47┊  chatId: number,
+┊   ┊ 48┊  receivedAt: number | null,
+┊   ┊ 49┊  readAt: number | null,
+┊   ┊ 50┊}
+┊   ┊ 51┊
+┊   ┊ 52┊const users: UserDb[] = [
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
+┊   ┊111┊const chats: ChatDb[] = [
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

##### Changed db.ts
```diff
@@ -1,4 +1,4 @@
-┊1┊ ┊import * as moment from 'moment';
+┊ ┊1┊import moment from 'moment';
 ┊2┊2┊
 ┊3┊3┊export enum MessageType {
 ┊4┊4┊  PICTURE,
```

##### Changed index.ts
```diff
@@ -1,7 +1,7 @@
 ┊1┊1┊import { schema } from "./schema";
-┊2┊ ┊import * as bodyParser from "body-parser";
-┊3┊ ┊import * as cors from 'cors';
-┊4┊ ┊import * as express from 'express';
+┊ ┊2┊import bodyParser from "body-parser";
+┊ ┊3┊import cors from 'cors';
+┊ ┊4┊import express from 'express';
 ┊5┊5┊import { ApolloServer } from "apollo-server-express";
 ┊6┊6┊
 ┊7┊7┊const PORT = 3000;
```

##### Changed schema&#x2F;resolvers.ts
```diff
@@ -1,5 +1,51 @@
 ┊ 1┊ 1┊import { IResolvers } from 'apollo-server-express';
+┊  ┊ 2┊import { ChatDb, db, MessageDb, RecipientDb, UserDb } from "../db";
+┊  ┊ 3┊
+┊  ┊ 4┊let users = db.users;
+┊  ┊ 5┊let chats = db.chats;
+┊  ┊ 6┊const currentUser = 1;
 ┊ 2┊ 7┊
 ┊ 3┊ 8┊export const resolvers: IResolvers = {
-┊ 4┊  ┊  Query: {},
+┊  ┊ 9┊  Query: {
+┊  ┊10┊    // Show all users for the moment.
+┊  ┊11┊    users: (): UserDb[] => users.filter(user => user.id !== currentUser),
+┊  ┊12┊    chats: (): ChatDb[] => chats.filter(chat => chat.listingMemberIds.includes(currentUser)),
+┊  ┊13┊    chat: (obj: any, {chatId}): ChatDb | null => chats.find(chat => chat.id === chatId) || null,
+┊  ┊14┊  },
+┊  ┊15┊  Chat: {
+┊  ┊16┊    name: (chat: ChatDb): string => chat.name ? chat.name : users
+┊  ┊17┊      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.name,
+┊  ┊18┊    picture: (chat: ChatDb) => chat.name ? chat.picture : users
+┊  ┊19┊      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.picture,
+┊  ┊20┊    allTimeMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.allTimeMemberIds.includes(user.id)),
+┊  ┊21┊    listingMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.listingMemberIds.includes(user.id)),
+┊  ┊22┊    actualGroupMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)),
+┊  ┊23┊    admins: (chat: ChatDb): UserDb[] => users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
+┊  ┊24┊    owner: (chat: ChatDb): UserDb | null => users.find(user => chat.ownerId === user.id) || null,
+┊  ┊25┊    messages: (chat: ChatDb, {amount = 0}: {amount: number}): MessageDb[] => {
+┊  ┊26┊      const messages = chat.messages
+┊  ┊27┊      .filter(message => message.holderIds.includes(currentUser))
+┊  ┊28┊      .sort((a, b) => b.createdAt - a.createdAt) || <MessageDb[]>[];
+┊  ┊29┊      return (amount ? messages.slice(0, amount) : messages).reverse();
+┊  ┊30┊    },
+┊  ┊31┊    unreadMessages: (chat: ChatDb): number => chat.messages
+┊  ┊32┊      .filter(message => message.holderIds.includes(currentUser) &&
+┊  ┊33┊        message.recipients.find(recipient => recipient.userId === currentUser && !recipient.readAt))
+┊  ┊34┊      .length,
+┊  ┊35┊    isGroup: (chat: ChatDb): boolean => !!chat.name,
+┊  ┊36┊  },
+┊  ┊37┊  Message: {
+┊  ┊38┊    chat: (message: MessageDb): ChatDb | null => chats.find(chat => message.chatId === chat.id) || null,
+┊  ┊39┊    sender: (message: MessageDb): UserDb | null => users.find(user => user.id === message.senderId) || null,
+┊  ┊40┊    holders: (message: MessageDb): UserDb[] => users.filter(user => message.holderIds.includes(user.id)),
+┊  ┊41┊    ownership: (message: MessageDb): boolean => message.senderId === currentUser,
+┊  ┊42┊  },
+┊  ┊43┊  Recipient: {
+┊  ┊44┊    user: (recipient: RecipientDb): UserDb | null => users.find(user => recipient.userId === user.id) || null,
+┊  ┊45┊    message: (recipient: RecipientDb): MessageDb | null => {
+┊  ┊46┊      const chat = chats.find(chat => recipient.chatId === chat.id);
+┊  ┊47┊      return chat ? chat.messages.find(message => recipient.messageId === message.id) || null : null;
+┊  ┊48┊    },
+┊  ┊49┊    chat: (recipient: RecipientDb): ChatDb | null => chats.find(chat => recipient.chatId === chat.id) || null,
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
@@ -4,7 +4,8 @@
 ┊ 4┊ 4┊  "private": true,
 ┊ 5┊ 5┊  "scripts": {
 ┊ 6┊ 6┊    "start": "npm run build:live",
-┊ 7┊  ┊    "build:live": "nodemon --exec ./node_modules/.bin/ts-node -- ./index.ts"
+┊  ┊ 7┊    "build:live": "nodemon --exec ./node_modules/.bin/ts-node -- ./index.ts",
+┊  ┊ 8┊    "generator": "gql-gen --config codegen.yml"
 ┊ 8┊ 9┊  },
 ┊ 9┊10┊  "devDependencies": {
 ┊10┊11┊    "@types/body-parser": "^1.17.0",
```
```diff
@@ -12,6 +13,9 @@
 ┊12┊13┊    "@types/express": "^4.16.0",
 ┊13┊14┊    "@types/graphql": "^14.0.4",
 ┊14┊15┊    "@types/node": "^10.12.18",
+┊  ┊16┊    "graphql-codegen-typescript-common": "^0.15.2",
+┊  ┊17┊    "graphql-codegen-typescript-resolvers": "^0.15.2",
+┊  ┊18┊    "graphql-codegen-typescript-server": "^0.15.2",
 ┊15┊19┊    "nodemon": "^1.18.9",
 ┊16┊20┊    "ts-node": "^7.0.1",
 ┊17┊21┊    "typescript": "^3.2.2"
```
```diff
@@ -22,6 +26,7 @@
 ┊22┊26┊    "cors": "^2.8.5",
 ┊23┊27┊    "express": "^4.16.4",
 ┊24┊28┊    "graphql": "^14.0.2",
+┊  ┊29┊    "graphql-code-generator": "^0.15.2",
 ┊25┊30┊    "moment": "^2.23.0"
 ┊26┊31┊  }
 ┊27┊32┊}
```

##### Changed yarn.lock
```diff
@@ -14,6 +14,103 @@
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
+┊   ┊ 25┊  version "7.2.2"
+┊   ┊ 26┊  resolved "https://registry.yarnpkg.com/@babel/generator/-/generator-7.2.2.tgz#18c816c70962640eab42fe8cae5f3947a5c65ccc"
+┊   ┊ 27┊  integrity sha512-I4o675J/iS8k+P38dvJ3IBGqObLXyQLTxtrR4u9cSUJOURvafeEWb/pFMOTwtNrmq73mJzyF6ueTbO1BtN0Zeg==
+┊   ┊ 28┊  dependencies:
+┊   ┊ 29┊    "@babel/types" "^7.2.2"
+┊   ┊ 30┊    jsesc "^2.5.1"
+┊   ┊ 31┊    lodash "^4.17.10"
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
+┊   ┊ 68┊  version "7.2.3"
+┊   ┊ 69┊  resolved "https://registry.yarnpkg.com/@babel/parser/-/parser-7.2.3.tgz#32f5df65744b70888d17872ec106b02434ba1489"
+┊   ┊ 70┊  integrity sha512-0LyEcVlfCoFmci8mXx8A5oIkpkOgyo8dRHtxBnK9RRBwxO2+JZPNsqtVEZQ7mJFPxnXF9lfmU24mHOPI0qnlkA==
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
+┊   ┊ 96┊"@babel/types@^7.0.0", "@babel/types@^7.2.0", "@babel/types@^7.2.2":
+┊   ┊ 97┊  version "7.2.2"
+┊   ┊ 98┊  resolved "https://registry.yarnpkg.com/@babel/types/-/types-7.2.2.tgz#44e10fc24e33af524488b716cdaee5360ea8ed1e"
+┊   ┊ 99┊  integrity sha512-fKCuD6UFUMkR541eDWL+2ih/xFZBXPOg/7EQFeTluMDebfqR4jrpaCjLhkWlQS4hT6nRa2PMEgXKbRB5/H2fpg==
+┊   ┊100┊  dependencies:
+┊   ┊101┊    esutils "^2.0.2"
+┊   ┊102┊    lodash "^4.17.10"
+┊   ┊103┊    to-fast-properties "^2.0.0"
+┊   ┊104┊
+┊   ┊105┊"@graphql-modules/epoxy@0.2.18":
+┊   ┊106┊  version "0.2.18"
+┊   ┊107┊  resolved "https://registry.yarnpkg.com/@graphql-modules/epoxy/-/epoxy-0.2.18.tgz#58ea584e57e0573d804ee39e34ee2fad604ba63a"
+┊   ┊108┊  integrity sha512-I5h45JKZXABJgKPnMIS7EwLDCIqvC53V/I1f35+uzo5a7Np4ItXvwYZXxNlTg+sbcSIhizA5q9XwwaMrOhOzqg==
+┊   ┊109┊  dependencies:
+┊   ┊110┊    deepmerge "3.0.0"
+┊   ┊111┊    graphql-tools "4.0.3"
+┊   ┊112┊    tslib "1.9.3"
+┊   ┊113┊
 ┊ 17┊114┊"@protobufjs/aspromise@^1.1.1", "@protobufjs/aspromise@^1.1.2":
 ┊ 18┊115┊  version "1.1.2"
 ┊ 19┊116┊  resolved "https://registry.yarnpkg.com/@protobufjs/aspromise/-/aspromise-1.1.2.tgz#9b8b0cc663d669a7d8f6f5d0893a14d348f30fbf"
```
```diff
@@ -67,6 +164,13 @@
 ┊ 67┊164┊  resolved "https://registry.yarnpkg.com/@protobufjs/utf8/-/utf8-1.1.0.tgz#a777360b5b39a1a2e5106f8e858f2fd2d060c570"
 ┊ 68┊165┊  integrity sha1-p3c2C1s5oaLlEG+OhY8v0tBgxXA=
 ┊ 69┊166┊
+┊   ┊167┊"@samverschueren/stream-to-observable@^0.3.0":
+┊   ┊168┊  version "0.3.0"
+┊   ┊169┊  resolved "https://registry.yarnpkg.com/@samverschueren/stream-to-observable/-/stream-to-observable-0.3.0.tgz#ecdf48d532c58ea477acfcab80348424f8d0662f"
+┊   ┊170┊  integrity sha512-MI4Xx6LHs4Webyvi6EbspgyAb4D2Q2VtnCQ1blOJcoLS6mVa8lNN2rkIy1CVxfTUpoyIbCTkXES1rLXztFD1lg==
+┊   ┊171┊  dependencies:
+┊   ┊172┊    any-observable "^0.3.0"
+┊   ┊173┊
 ┊ 70┊174┊"@types/accepts@^1.3.5":
 ┊ 71┊175┊  version "1.3.5"
 ┊ 72┊176┊  resolved "https://registry.yarnpkg.com/@types/accepts/-/accepts-1.3.5.tgz#c34bec115cfc746e04fe5a059df4ce7e7b391575"
```
```diff
@@ -74,6 +178,18 @@
 ┊ 74┊178┊  dependencies:
 ┊ 75┊179┊    "@types/node" "*"
 ┊ 76┊180┊
+┊   ┊181┊"@types/babel-types@*":
+┊   ┊182┊  version "7.0.4"
+┊   ┊183┊  resolved "https://registry.yarnpkg.com/@types/babel-types/-/babel-types-7.0.4.tgz#bfd5b0d0d1ba13e351dff65b6e52783b816826c8"
+┊   ┊184┊  integrity sha512-WiZhq3SVJHFRgRYLXvpf65XnV6ipVHhnNaNvE8yCimejrGglkg38kEj0JcizqwSHxmPSjcTlig/6JouxLGEhGw==
+┊   ┊185┊
+┊   ┊186┊"@types/babylon@6.16.4":
+┊   ┊187┊  version "6.16.4"
+┊   ┊188┊  resolved "https://registry.yarnpkg.com/@types/babylon/-/babylon-6.16.4.tgz#d3df72518b34a6a015d0dc58745cd238b5bb8ad2"
+┊   ┊189┊  integrity sha512-8dZMcGPno3g7pJ/d0AyJERo+lXh9i1JhDuCUs+4lNIN9eUe5Yh6UCLrpgSEi05Ve2JMLauL2aozdvKwNL0px1Q==
+┊   ┊190┊  dependencies:
+┊   ┊191┊    "@types/babel-types" "*"
+┊   ┊192┊
 ┊ 77┊193┊"@types/body-parser@*", "@types/body-parser@1.17.0", "@types/body-parser@^1.17.0":
 ┊ 78┊194┊  version "1.17.0"
 ┊ 79┊195┊  resolved "https://registry.yarnpkg.com/@types/body-parser/-/body-parser-1.17.0.tgz#9f5c9d9bd04bb54be32d5eb9fc0d8c974e6cf58c"
```
```diff
@@ -124,6 +240,11 @@
 ┊124┊240┊  resolved "https://registry.yarnpkg.com/@types/graphql/-/graphql-14.0.4.tgz#d71a75967cd93c33eaea32b626b362ce0f2b2ae9"
 ┊125┊241┊  integrity sha512-gI98ANelzzpq7lZzuYCUJg8LZDjQc7ekj7cxoWt8RezOKaVaAyK27U6AHa9LEqikP1NUhyi8blQQkHYHVRZ7Tg==
 ┊126┊242┊
+┊   ┊243┊"@types/is-glob@4.0.0":
+┊   ┊244┊  version "4.0.0"
+┊   ┊245┊  resolved "https://registry.yarnpkg.com/@types/is-glob/-/is-glob-4.0.0.tgz#fb8a2bff539025d4dcd6d5efe7689e03341b876d"
+┊   ┊246┊  integrity sha512-zC/2EmD8scdsGIeE+Xg7kP7oi9VP90zgMQtm9Cr25av4V+a+k8slQyiT60qSw8KORYrOKlPXfHwoa1bQbRzskQ==
+┊   ┊247┊
 ┊127┊248┊"@types/long@^4.0.0":
 ┊128┊249┊  version "4.0.0"
 ┊129┊250┊  resolved "https://registry.yarnpkg.com/@types/long/-/long-4.0.0.tgz#719551d2352d301ac8b81db732acb6bdc28dbdef"
```
```diff
@@ -139,6 +260,11 @@
 ┊139┊260┊  resolved "https://registry.yarnpkg.com/@types/node/-/node-10.12.18.tgz#1d3ca764718915584fcd9f6344621b7672665c67"
 ┊140┊261┊  integrity sha512-fh+pAqt4xRzPfqA6eh3Z2y6fyZavRIumvjhaCL753+TVkGKGhpPeyrJG2JftD0T9q4GF00KjefsQ+PQNDdWQaQ==
 ┊141┊262┊
+┊   ┊263┊"@types/prettier@1.15.2":
+┊   ┊264┊  version "1.15.2"
+┊   ┊265┊  resolved "https://registry.yarnpkg.com/@types/prettier/-/prettier-1.15.2.tgz#91594ea7cb6f3b1f7ea69f32621246654c7cc231"
+┊   ┊266┊  integrity sha512-XIB0ZCaFZmWUHAa9dBqP5UKXXHwuukmVlP+XcyU94dui2k+l2lG+CHAbt2ffenHPUqoIs5Beh8Pdf2YEq/CZ7A==
+┊   ┊267┊
 ┊142┊268┊"@types/range-parser@*":
 ┊143┊269┊  version "1.2.3"
 ┊144┊270┊  resolved "https://registry.yarnpkg.com/@types/range-parser/-/range-parser-1.2.3.tgz#7ee330ba7caafb98090bece86a5ee44115904c2c"
```
```diff
@@ -152,6 +278,11 @@
 ┊152┊278┊    "@types/express-serve-static-core" "*"
 ┊153┊279┊    "@types/mime" "*"
 ┊154┊280┊
+┊   ┊281┊"@types/valid-url@1.0.2":
+┊   ┊282┊  version "1.0.2"
+┊   ┊283┊  resolved "https://registry.yarnpkg.com/@types/valid-url/-/valid-url-1.0.2.tgz#60fa435ce24bfd5ba107b8d2a80796aeaf3a8f45"
+┊   ┊284┊  integrity sha1-YPpDXOJL/VuhB7jSqAeWrq86j0U=
+┊   ┊285┊
 ┊155┊286┊"@types/ws@^6.0.0":
 ┊156┊287┊  version "6.0.1"
 ┊157┊288┊  resolved "https://registry.yarnpkg.com/@types/ws/-/ws-6.0.1.tgz#ca7a3f3756aa12f62a0a62145ed14c6db25d5a28"
```
```diff
@@ -173,6 +304,16 @@
 ┊173┊304┊    mime-types "~2.1.18"
 ┊174┊305┊    negotiator "0.6.1"
 ┊175┊306┊
+┊   ┊307┊ajv@^6.5.5:
+┊   ┊308┊  version "6.6.2"
+┊   ┊309┊  resolved "https://registry.yarnpkg.com/ajv/-/ajv-6.6.2.tgz#caceccf474bf3fc3ce3b147443711a24063cc30d"
+┊   ┊310┊  integrity sha512-FBHEW6Jf5TB9MGBgUUA9XHkTbjXYfAUjY43ACMfmdMRHniyoMHjHjzD50OK8LGDWQwp4rWEsIq5kEqq7rvIM1g==
+┊   ┊311┊  dependencies:
+┊   ┊312┊    fast-deep-equal "^2.0.1"
+┊   ┊313┊    fast-json-stable-stringify "^2.0.0"
+┊   ┊314┊    json-schema-traverse "^0.4.1"
+┊   ┊315┊    uri-js "^4.2.2"
+┊   ┊316┊
 ┊176┊317┊ansi-align@^2.0.0:
 ┊177┊318┊  version "2.0.0"
 ┊178┊319┊  resolved "https://registry.yarnpkg.com/ansi-align/-/ansi-align-2.0.0.tgz#c36aeccba563b89ceb556f3690f0b1d9e3547f7f"
```
```diff
@@ -180,6 +321,11 @@
 ┊180┊321┊  dependencies:
 ┊181┊322┊    string-width "^2.0.0"
 ┊182┊323┊
+┊   ┊324┊ansi-escapes@^3.0.0:
+┊   ┊325┊  version "3.1.0"
+┊   ┊326┊  resolved "https://registry.yarnpkg.com/ansi-escapes/-/ansi-escapes-3.1.0.tgz#f73207bb81207d75fd6c83f125af26eea378ca30"
+┊   ┊327┊  integrity sha512-UgAb8H9D41AQnu/PbWlCofQVcnV4Gs2bBJi9eZPxfU/hgglFh3SMDMENRIqdr7H6XFnXdoknctFByVsCOotTVw==
+┊   ┊328┊
 ┊183┊329┊ansi-regex@^2.0.0:
 ┊184┊330┊  version "2.1.1"
 ┊185┊331┊  resolved "https://registry.yarnpkg.com/ansi-regex/-/ansi-regex-2.1.1.tgz#c3b33ab5ee360d86e0e628f0468ae7ef27d654df"
```
```diff
@@ -190,6 +336,16 @@
 ┊190┊336┊  resolved "https://registry.yarnpkg.com/ansi-regex/-/ansi-regex-3.0.0.tgz#ed0317c322064f79466c02966bddb605ab37d998"
 ┊191┊337┊  integrity sha1-7QMXwyIGT3lGbAKWa922Bas32Zg=
 ┊192┊338┊
+┊   ┊339┊ansi-regex@^4.0.0:
+┊   ┊340┊  version "4.0.0"
+┊   ┊341┊  resolved "https://registry.yarnpkg.com/ansi-regex/-/ansi-regex-4.0.0.tgz#70de791edf021404c3fd615aa89118ae0432e5a9"
+┊   ┊342┊  integrity sha512-iB5Dda8t/UqpPI/IjsejXu5jOGDrzn41wJyljwPH65VCIbk6+1BzFIMJGFwTNrYXT1CrD+B4l19U7awiQ8rk7w==
+┊   ┊343┊
+┊   ┊344┊ansi-styles@^2.2.1:
+┊   ┊345┊  version "2.2.1"
+┊   ┊346┊  resolved "https://registry.yarnpkg.com/ansi-styles/-/ansi-styles-2.2.1.tgz#b432dd3358b634cf75e1e4664368240533c1ddbe"
+┊   ┊347┊  integrity sha1-tDLdM1i2NM914eRmQ2gkBTPB3b4=
+┊   ┊348┊
 ┊193┊349┊ansi-styles@^3.2.1:
 ┊194┊350┊  version "3.2.1"
 ┊195┊351┊  resolved "https://registry.yarnpkg.com/ansi-styles/-/ansi-styles-3.2.1.tgz#41fbb20243e50b12be0f04b8dedbf07520ce841d"
```
```diff
@@ -197,6 +353,11 @@
 ┊197┊353┊  dependencies:
 ┊198┊354┊    color-convert "^1.9.0"
 ┊199┊355┊
+┊   ┊356┊any-observable@^0.3.0:
+┊   ┊357┊  version "0.3.0"
+┊   ┊358┊  resolved "https://registry.yarnpkg.com/any-observable/-/any-observable-0.3.0.tgz#af933475e5806a67d0d7df090dd5e8bef65d119b"
+┊   ┊359┊  integrity sha512-/FQM1EDkTsf63Ub2C6O7GuYFDsSXUwsaZDurV0np41ocwq0jthUAYCmhBX9f+KwlaCgIuWyr/4WlUQUBfKfZog==
+┊   ┊360┊
 ┊200┊361┊anymatch@^2.0.0:
 ┊201┊362┊  version "2.0.0"
 ┊202┊363┊  resolved "https://registry.yarnpkg.com/anymatch/-/anymatch-2.0.0.tgz#bcb24b4f37934d9aa7ac17b4adaf89e7c76ef2eb"
```
```diff
@@ -352,6 +513,13 @@
 ┊352┊513┊    delegates "^1.0.0"
 ┊353┊514┊    readable-stream "^2.0.6"
 ┊354┊515┊
+┊   ┊516┊argparse@^1.0.7:
+┊   ┊517┊  version "1.0.10"
+┊   ┊518┊  resolved "https://registry.yarnpkg.com/argparse/-/argparse-1.0.10.tgz#bcd6791ea5ae09725e17e5ad988134cd40b3d911"
+┊   ┊519┊  integrity sha512-o5Roy6tNG4SL/FOkCAN6RzjiakZS25RLYFrcMttJqbdd8BWrnA+fGz57iN5Pb06pvBGvl5gQ0B48dJlslXvoTg==
+┊   ┊520┊  dependencies:
+┊   ┊521┊    sprintf-js "~1.0.2"
+┊   ┊522┊
 ┊355┊523┊arr-diff@^4.0.0:
 ┊356┊524┊  version "4.0.0"
 ┊357┊525┊  resolved "https://registry.yarnpkg.com/arr-diff/-/arr-diff-4.0.0.tgz#d6461074febfec71e7e15235761a329a5dc7c520"
```
```diff
@@ -382,6 +550,18 @@
 ┊382┊550┊  resolved "https://registry.yarnpkg.com/arrify/-/arrify-1.0.1.tgz#898508da2226f380df904728456849c1501a4b0d"
 ┊383┊551┊  integrity sha1-iYUI2iIm84DfkEcoRWhJwVAaSw0=
 ┊384┊552┊
+┊   ┊553┊asn1@~0.2.3:
+┊   ┊554┊  version "0.2.4"
+┊   ┊555┊  resolved "https://registry.yarnpkg.com/asn1/-/asn1-0.2.4.tgz#8d2475dfab553bb33e77b54e59e880bb8ce23136"
+┊   ┊556┊  integrity sha512-jxwzQpLQjSmWXgwaCZE9Nz+glAG01yF1QnWgbhGwHI5A6FRIEY6IVqtHhIepHqI7/kyEyQEagBC5mBEFlIYvdg==
+┊   ┊557┊  dependencies:
+┊   ┊558┊    safer-buffer "~2.1.0"
+┊   ┊559┊
+┊   ┊560┊assert-plus@1.0.0, assert-plus@^1.0.0:
+┊   ┊561┊  version "1.0.0"
+┊   ┊562┊  resolved "https://registry.yarnpkg.com/assert-plus/-/assert-plus-1.0.0.tgz#f12e0f3c5d77b0b1cdd9146942e4e96c1e4dd525"
+┊   ┊563┊  integrity sha1-8S4PPF13sLHN2RRpQuTpbB5N1SU=
+┊   ┊564┊
 ┊385┊565┊assign-symbols@^1.0.0:
 ┊386┊566┊  version "1.0.0"
 ┊387┊567┊  resolved "https://registry.yarnpkg.com/assign-symbols/-/assign-symbols-1.0.0.tgz#59667f41fadd4f20ccbc2bb96b8d4f7f78ec0367"
```
```diff
@@ -404,11 +584,47 @@
 ┊404┊584┊  dependencies:
 ┊405┊585┊    retry "0.12.0"
 ┊406┊586┊
+┊   ┊587┊async@^2.6.0:
+┊   ┊588┊  version "2.6.1"
+┊   ┊589┊  resolved "https://registry.yarnpkg.com/async/-/async-2.6.1.tgz#b245a23ca71930044ec53fa46aa00a3e87c6a610"
+┊   ┊590┊  integrity sha512-fNEiL2+AZt6AlAw/29Cr0UDe4sRAHCpEHh54WMz+Bb7QfNcFw4h3loofyJpLeQs4Yx7yuqu/2dLgM5hKOs6HlQ==
+┊   ┊591┊  dependencies:
+┊   ┊592┊    lodash "^4.17.10"
+┊   ┊593┊
+┊   ┊594┊asynckit@^0.4.0:
+┊   ┊595┊  version "0.4.0"
+┊   ┊596┊  resolved "https://registry.yarnpkg.com/asynckit/-/asynckit-0.4.0.tgz#c79ed97f7f34cb8f2ba1bc9790bcc366474b4b79"
+┊   ┊597┊  integrity sha1-x57Zf380y48robyXkLzDZkdLS3k=
+┊   ┊598┊
 ┊407┊599┊atob@^2.1.1:
 ┊408┊600┊  version "2.1.2"
 ┊409┊601┊  resolved "https://registry.yarnpkg.com/atob/-/atob-2.1.2.tgz#6d9517eb9e030d2436666651e86bd9f6f13533c9"
 ┊410┊602┊  integrity sha512-Wm6ukoaOGJi/73p/cl2GvLjTI5JM1k/O14isD73YML8StrH/7/lRFgmg8nICZgD3bZZvjwCGxtMOD3wWNAu8cg==
 ┊411┊603┊
+┊   ┊604┊aws-sign2@~0.7.0:
+┊   ┊605┊  version "0.7.0"
+┊   ┊606┊  resolved "https://registry.yarnpkg.com/aws-sign2/-/aws-sign2-0.7.0.tgz#b46e890934a9591f2d2f6f86d7e6a9f1b3fe76a8"
+┊   ┊607┊  integrity sha1-tG6JCTSpWR8tL2+G1+ap8bP+dqg=
+┊   ┊608┊
+┊   ┊609┊aws4@^1.8.0:
+┊   ┊610┊  version "1.8.0"
+┊   ┊611┊  resolved "https://registry.yarnpkg.com/aws4/-/aws4-1.8.0.tgz#f0e003d9ca9e7f59c7a508945d7b2ef9a04a542f"
+┊   ┊612┊  integrity sha512-ReZxvNHIOv88FlT7rxcXIIC0fPt4KZqZbOlivyWtXLt8ESx84zd3kMC6iK5jVeS2qt+g7ftS7ye4fi06X5rtRQ==
+┊   ┊613┊
+┊   ┊614┊babel-types@7.0.0-beta.3:
+┊   ┊615┊  version "7.0.0-beta.3"
+┊   ┊616┊  resolved "https://registry.yarnpkg.com/babel-types/-/babel-types-7.0.0-beta.3.tgz#cd927ca70e0ae8ab05f4aab83778cfb3e6eb20b4"
+┊   ┊617┊  integrity sha512-36k8J+byAe181OmCMawGhw+DtKO7AwexPVtsPXoMfAkjtZgoCX3bEuHWfdE5sYxRM8dojvtG/+O08M0Z/YDC6w==
+┊   ┊618┊  dependencies:
+┊   ┊619┊    esutils "^2.0.2"
+┊   ┊620┊    lodash "^4.2.0"
+┊   ┊621┊    to-fast-properties "^2.0.0"
+┊   ┊622┊
+┊   ┊623┊babylon@7.0.0-beta.47:
+┊   ┊624┊  version "7.0.0-beta.47"
+┊   ┊625┊  resolved "https://registry.yarnpkg.com/babylon/-/babylon-7.0.0-beta.47.tgz#6d1fa44f0abec41ab7c780481e62fd9aafbdea80"
+┊   ┊626┊  integrity sha512-+rq2cr4GDhtToEzKFD6KZZMDBXhjFAr9JjPw9pAppZACeEWqNM294j+NdBzkSHYXwzzBmVjZ3nEVJlOhbR2gOQ==
+┊   ┊627┊
 ┊412┊628┊backo2@^1.0.2:
 ┊413┊629┊  version "1.0.2"
 ┊414┊630┊  resolved "https://registry.yarnpkg.com/backo2/-/backo2-1.0.2.tgz#31ab1ac8b129363463e35b3ebb69f4dfcfba7947"
```
```diff
@@ -432,6 +648,13 @@
 ┊432┊648┊    mixin-deep "^1.2.0"
 ┊433┊649┊    pascalcase "^0.1.1"
 ┊434┊650┊
+┊   ┊651┊bcrypt-pbkdf@^1.0.0:
+┊   ┊652┊  version "1.0.2"
+┊   ┊653┊  resolved "https://registry.yarnpkg.com/bcrypt-pbkdf/-/bcrypt-pbkdf-1.0.2.tgz#a4301d389b6a43f9b67ff3ca11a3f6637e360e9e"
+┊   ┊654┊  integrity sha1-pDAdOJtqQ/m2f/PKEaP2Y342Dp4=
+┊   ┊655┊  dependencies:
+┊   ┊656┊    tweetnacl "^0.14.3"
+┊   ┊657┊
 ┊435┊658┊binary-extensions@^1.0.0:
 ┊436┊659┊  version "1.12.0"
 ┊437┊660┊  resolved "https://registry.yarnpkg.com/binary-extensions/-/binary-extensions-1.12.0.tgz#c2d780f53d45bba8317a8902d4ceeaf3a6385b14"
```
```diff
@@ -522,6 +745,14 @@
 ┊522┊745┊    union-value "^1.0.0"
 ┊523┊746┊    unset-value "^1.0.0"
 ┊524┊747┊
+┊   ┊748┊camel-case@^3.0.0:
+┊   ┊749┊  version "3.0.0"
+┊   ┊750┊  resolved "https://registry.yarnpkg.com/camel-case/-/camel-case-3.0.0.tgz#ca3c3688a4e9cf3a4cda777dc4dcbc713249cf73"
+┊   ┊751┊  integrity sha1-yjw2iKTpzzpM2nd9xNy8cTJJz3M=
+┊   ┊752┊  dependencies:
+┊   ┊753┊    no-case "^2.2.0"
+┊   ┊754┊    upper-case "^1.1.1"
+┊   ┊755┊
 ┊525┊756┊camelcase@^4.0.0:
 ┊526┊757┊  version "4.1.0"
 ┊527┊758┊  resolved "https://registry.yarnpkg.com/camelcase/-/camelcase-4.1.0.tgz#d545635be1e33c542649c69173e5de6acfae34dd"
```
```diff
@@ -532,7 +763,32 @@
 ┊532┊763┊  resolved "https://registry.yarnpkg.com/capture-stack-trace/-/capture-stack-trace-1.0.1.tgz#a6c0bbe1f38f3aa0b92238ecb6ff42c344d4135d"
 ┊533┊764┊  integrity sha512-mYQLZnx5Qt1JgB1WEiMCf2647plpGeQ2NMR/5L0HNZzGQo4fuSPnK+wjfPnKZV0aiJDgzmWqqkV/g7JD+DW0qw==
 ┊534┊765┊
-┊535┊   ┊chalk@^2.0.1:
+┊   ┊766┊caseless@~0.12.0:
+┊   ┊767┊  version "0.12.0"
+┊   ┊768┊  resolved "https://registry.yarnpkg.com/caseless/-/caseless-0.12.0.tgz#1b681c21ff84033c826543090689420d187151dc"
+┊   ┊769┊  integrity sha1-G2gcIf+EAzyCZUMJBolCDRhxUdw=
+┊   ┊770┊
+┊   ┊771┊chalk@2.4.1:
+┊   ┊772┊  version "2.4.1"
+┊   ┊773┊  resolved "https://registry.yarnpkg.com/chalk/-/chalk-2.4.1.tgz#18c49ab16a037b6eb0152cc83e3471338215b66e"
+┊   ┊774┊  integrity sha512-ObN6h1v2fTJSmUXoS3nMQ92LbDK9be4TV+6G+omQlGJFdcUX5heKi1LZ1YnRMIgwTLEj3E24bT6tYni50rlCfQ==
+┊   ┊775┊  dependencies:
+┊   ┊776┊    ansi-styles "^3.2.1"
+┊   ┊777┊    escape-string-regexp "^1.0.5"
+┊   ┊778┊    supports-color "^5.3.0"
+┊   ┊779┊
+┊   ┊780┊chalk@^1.0.0, chalk@^1.1.3:
+┊   ┊781┊  version "1.1.3"
+┊   ┊782┊  resolved "https://registry.yarnpkg.com/chalk/-/chalk-1.1.3.tgz#a8115c55e4a702fe4d150abd3872822a7e09fc98"
+┊   ┊783┊  integrity sha1-qBFcVeSnAv5NFQq9OHKCKn4J/Jg=
+┊   ┊784┊  dependencies:
+┊   ┊785┊    ansi-styles "^2.2.1"
+┊   ┊786┊    escape-string-regexp "^1.0.2"
+┊   ┊787┊    has-ansi "^2.0.0"
+┊   ┊788┊    strip-ansi "^3.0.0"
+┊   ┊789┊    supports-color "^2.0.0"
+┊   ┊790┊
+┊   ┊791┊chalk@^2.0.0, chalk@^2.0.1, chalk@^2.4.1:
 ┊536┊792┊  version "2.4.2"
 ┊537┊793┊  resolved "https://registry.yarnpkg.com/chalk/-/chalk-2.4.2.tgz#cd42541677a54333cf541a49108c1432b44c9424"
 ┊538┊794┊  integrity sha512-Mti+f9lpJNcwF4tWV8/OrTTtF1gZi+f8FqlyAdouralcFWFQWF2+NgCHShjkCb+IFBLq9buZwE1xckQU4peSuQ==
```
```diff
@@ -541,7 +797,36 @@
 ┊541┊797┊    escape-string-regexp "^1.0.5"
 ┊542┊798┊    supports-color "^5.3.0"
 ┊543┊799┊
-┊544┊   ┊chokidar@^2.0.4:
+┊   ┊800┊change-case@3.0.2:
+┊   ┊801┊  version "3.0.2"
+┊   ┊802┊  resolved "https://registry.yarnpkg.com/change-case/-/change-case-3.0.2.tgz#fd48746cce02f03f0a672577d1d3a8dc2eceb037"
+┊   ┊803┊  integrity sha512-Mww+SLF6MZ0U6kdg11algyKd5BARbyM4TbFBepwowYSR5ClfQGCGtxNXgykpN0uF/bstWeaGDT4JWaDh8zWAHA==
+┊   ┊804┊  dependencies:
+┊   ┊805┊    camel-case "^3.0.0"
+┊   ┊806┊    constant-case "^2.0.0"
+┊   ┊807┊    dot-case "^2.1.0"
+┊   ┊808┊    header-case "^1.0.0"
+┊   ┊809┊    is-lower-case "^1.1.0"
+┊   ┊810┊    is-upper-case "^1.1.0"
+┊   ┊811┊    lower-case "^1.1.1"
+┊   ┊812┊    lower-case-first "^1.0.0"
+┊   ┊813┊    no-case "^2.3.2"
+┊   ┊814┊    param-case "^2.1.0"
+┊   ┊815┊    pascal-case "^2.0.0"
+┊   ┊816┊    path-case "^2.1.0"
+┊   ┊817┊    sentence-case "^2.1.0"
+┊   ┊818┊    snake-case "^2.1.0"
+┊   ┊819┊    swap-case "^1.1.0"
+┊   ┊820┊    title-case "^2.1.0"
+┊   ┊821┊    upper-case "^1.1.1"
+┊   ┊822┊    upper-case-first "^1.1.0"
+┊   ┊823┊
+┊   ┊824┊chardet@^0.7.0:
+┊   ┊825┊  version "0.7.0"
+┊   ┊826┊  resolved "https://registry.yarnpkg.com/chardet/-/chardet-0.7.0.tgz#90094849f0937f2eedc2425d0d28a9e5f0cbad9e"
+┊   ┊827┊  integrity sha512-mT8iDcrh03qDGRRmoA2hmBJnxpllMR+0/0qlzjqZES6NdiWDcZkCNAk4rPFZ9Q85r27unkiNNg8ZOiwZXBHwcA==
+┊   ┊828┊
+┊   ┊829┊chokidar@2.0.4, chokidar@^2.0.4:
 ┊545┊830┊  version "2.0.4"
 ┊546┊831┊  resolved "https://registry.yarnpkg.com/chokidar/-/chokidar-2.0.4.tgz#356ff4e2b0e8e43e322d18a372460bbcf3accd26"
 ┊547┊832┊  integrity sha512-z9n7yt9rOvIJrMhvDtDictKrkFHeihkNl6uWMmZlmL6tJtX9Cs+87oK+teBx+JIgzvbX3yZHT3eF8vpbDxHJXQ==
```
```diff
@@ -586,6 +871,26 @@
 ┊586┊871┊  resolved "https://registry.yarnpkg.com/cli-boxes/-/cli-boxes-1.0.0.tgz#4fa917c3e59c94a004cd61f8ee509da651687143"
 ┊587┊872┊  integrity sha1-T6kXw+WclKAEzWH47lCdplFocUM=
 ┊588┊873┊
+┊   ┊874┊cli-cursor@^2.0.0, cli-cursor@^2.1.0:
+┊   ┊875┊  version "2.1.0"
+┊   ┊876┊  resolved "https://registry.yarnpkg.com/cli-cursor/-/cli-cursor-2.1.0.tgz#b35dac376479facc3e94747d41d0d0f5238ffcb5"
+┊   ┊877┊  integrity sha1-s12sN2R5+sw+lHR9QdDQ9SOP/LU=
+┊   ┊878┊  dependencies:
+┊   ┊879┊    restore-cursor "^2.0.0"
+┊   ┊880┊
+┊   ┊881┊cli-truncate@^0.2.1:
+┊   ┊882┊  version "0.2.1"
+┊   ┊883┊  resolved "https://registry.yarnpkg.com/cli-truncate/-/cli-truncate-0.2.1.tgz#9f15cfbb0705005369216c626ac7d05ab90dd574"
+┊   ┊884┊  integrity sha1-nxXPuwcFAFNpIWxiasfQWrkN1XQ=
+┊   ┊885┊  dependencies:
+┊   ┊886┊    slice-ansi "0.0.4"
+┊   ┊887┊    string-width "^1.0.1"
+┊   ┊888┊
+┊   ┊889┊cli-width@^2.0.0:
+┊   ┊890┊  version "2.2.0"
+┊   ┊891┊  resolved "https://registry.yarnpkg.com/cli-width/-/cli-width-2.2.0.tgz#ff19ede8a9a5e579324147b0c11f0fbcbabed639"
+┊   ┊892┊  integrity sha1-/xnt6Kml5XkyQUewwR8PvLq+1jk=
+┊   ┊893┊
 ┊589┊894┊code-point-at@^1.0.0:
 ┊590┊895┊  version "1.1.0"
 ┊591┊896┊  resolved "https://registry.yarnpkg.com/code-point-at/-/code-point-at-1.1.0.tgz#0d070b4d043a5bea33a2f1a40e2edb3d9a4ccf77"
```
```diff
@@ -599,7 +904,7 @@
 ┊599┊904┊    map-visit "^1.0.0"
 ┊600┊905┊    object-visit "^1.0.0"
 ┊601┊906┊
-┊602┊   ┊color-convert@^1.9.0:
+┊   ┊907┊color-convert@^1.9.0, color-convert@^1.9.1:
 ┊603┊908┊  version "1.9.3"
 ┊604┊909┊  resolved "https://registry.yarnpkg.com/color-convert/-/color-convert-1.9.3.tgz#bb71850690e1f136567de629d2d5471deda4c1e8"
 ┊605┊910┊  integrity sha512-QfAUtd+vFdAtFQcC8CCyYt1fYWxSqAiK2cSD6zDB8N3cpsEBAvRxp9zOGg6G/SHHJYAT88/az/IuDGALsNVbGg==
```
```diff
@@ -611,6 +916,62 @@
 ┊611┊916┊  resolved "https://registry.yarnpkg.com/color-name/-/color-name-1.1.3.tgz#a7d0558bd89c42f795dd42328f740831ca53bc25"
 ┊612┊917┊  integrity sha1-p9BVi9icQveV3UIyj3QIMcpTvCU=
 ┊613┊918┊
+┊   ┊919┊color-name@^1.0.0:
+┊   ┊920┊  version "1.1.4"
+┊   ┊921┊  resolved "https://registry.yarnpkg.com/color-name/-/color-name-1.1.4.tgz#c2a09a87acbde69543de6f63fa3995c826c536a2"
+┊   ┊922┊  integrity sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==
+┊   ┊923┊
+┊   ┊924┊color-string@^1.5.2:
+┊   ┊925┊  version "1.5.3"
+┊   ┊926┊  resolved "https://registry.yarnpkg.com/color-string/-/color-string-1.5.3.tgz#c9bbc5f01b58b5492f3d6857459cb6590ce204cc"
+┊   ┊927┊  integrity sha512-dC2C5qeWoYkxki5UAXapdjqO672AM4vZuPGRQfO8b5HKuKGBbKWpITyDYN7TOFKvRW7kOgAn3746clDBMDJyQw==
+┊   ┊928┊  dependencies:
+┊   ┊929┊    color-name "^1.0.0"
+┊   ┊930┊    simple-swizzle "^0.2.2"
+┊   ┊931┊
+┊   ┊932┊color@3.0.x:
+┊   ┊933┊  version "3.0.0"
+┊   ┊934┊  resolved "https://registry.yarnpkg.com/color/-/color-3.0.0.tgz#d920b4328d534a3ac8295d68f7bd4ba6c427be9a"
+┊   ┊935┊  integrity sha512-jCpd5+s0s0t7p3pHQKpnJ0TpQKKdleP71LWcA0aqiljpiuAkOSUFN/dyH8ZwF0hRmFlrIuRhufds1QyEP9EB+w==
+┊   ┊936┊  dependencies:
+┊   ┊937┊    color-convert "^1.9.1"
+┊   ┊938┊    color-string "^1.5.2"
+┊   ┊939┊
+┊   ┊940┊colornames@^1.1.1:
+┊   ┊941┊  version "1.1.1"
+┊   ┊942┊  resolved "https://registry.yarnpkg.com/colornames/-/colornames-1.1.1.tgz#f8889030685c7c4ff9e2a559f5077eb76a816f96"
+┊   ┊943┊  integrity sha1-+IiQMGhcfE/54qVZ9Qd+t2qBb5Y=
+┊   ┊944┊
+┊   ┊945┊colors@^1.2.1:
+┊   ┊946┊  version "1.3.3"
+┊   ┊947┊  resolved "https://registry.yarnpkg.com/colors/-/colors-1.3.3.tgz#39e005d546afe01e01f9c4ca8fa50f686a01205d"
+┊   ┊948┊  integrity sha512-mmGt/1pZqYRjMxB1axhTo16/snVZ5krrKkcmMeVKxzECMMXoCgnvTPp10QgHfcbQZw8Dq2jMNG6je4JlWU0gWg==
+┊   ┊949┊
+┊   ┊950┊colorspace@1.1.x:
+┊   ┊951┊  version "1.1.1"
+┊   ┊952┊  resolved "https://registry.yarnpkg.com/colorspace/-/colorspace-1.1.1.tgz#9ac2491e1bc6f8fb690e2176814f8d091636d972"
+┊   ┊953┊  integrity sha512-pI3btWyiuz7Ken0BWh9Elzsmv2bM9AhA7psXib4anUXy/orfZ/E0MbQwhSOG/9L8hLlalqrU0UhOuqxW1YjmVw==
+┊   ┊954┊  dependencies:
+┊   ┊955┊    color "3.0.x"
+┊   ┊956┊    text-hex "1.0.x"
+┊   ┊957┊
+┊   ┊958┊combined-stream@^1.0.6, combined-stream@~1.0.6:
+┊   ┊959┊  version "1.0.7"
+┊   ┊960┊  resolved "https://registry.yarnpkg.com/combined-stream/-/combined-stream-1.0.7.tgz#2d1d24317afb8abe95d6d2c0b07b57813539d828"
+┊   ┊961┊  integrity sha512-brWl9y6vOB1xYPZcpZde3N9zDByXTosAeMDo4p1wzo6UMOX4vumB+TP1RZ76sfE6Md68Q0NJSrE/gbezd4Ul+w==
+┊   ┊962┊  dependencies:
+┊   ┊963┊    delayed-stream "~1.0.0"
+┊   ┊964┊
+┊   ┊965┊commander@2.19.0:
+┊   ┊966┊  version "2.19.0"
+┊   ┊967┊  resolved "https://registry.yarnpkg.com/commander/-/commander-2.19.0.tgz#f6198aa84e5b83c46054b94ddedbfed5ee9ff12a"
+┊   ┊968┊  integrity sha512-6tvAOO+D6OENvRAh524Dh9jcfKTYDQAqvqezbCW82xj5X0pSrcpxtvRKHLG0yBY6SD7PSDrJaj+0AiOcKVd1Xg==
+┊   ┊969┊
+┊   ┊970┊common-tags@1.8.0:
+┊   ┊971┊  version "1.8.0"
+┊   ┊972┊  resolved "https://registry.yarnpkg.com/common-tags/-/common-tags-1.8.0.tgz#8e3153e542d4a39e9b10554434afaaf98956a937"
+┊   ┊973┊  integrity sha512-6P6g0uetGpW/sdyUy/iQQCbFF0kWVMSIVSyYz7Zgjcgh8mgw8PQzDNZeyZ5DQ2gM7LBoZPHmnjz8rUthkBG5tw==
+┊   ┊974┊
 ┊614┊975┊component-emitter@^1.2.1:
 ┊615┊976┊  version "1.2.1"
 ┊616┊977┊  resolved "https://registry.yarnpkg.com/component-emitter/-/component-emitter-1.2.1.tgz#137918d6d78283f7df7a6b7c5a63e140e69425e6"
```
```diff
@@ -638,6 +999,14 @@
 ┊ 638┊ 999┊  resolved "https://registry.yarnpkg.com/console-control-strings/-/console-control-strings-1.1.0.tgz#3d7cf4464db6446ea644bf4b39507f9851008e8e"
 ┊ 639┊1000┊  integrity sha1-PXz0Rk22RG6mRL9LOVB/mFEAjo4=
 ┊ 640┊1001┊
+┊    ┊1002┊constant-case@^2.0.0:
+┊    ┊1003┊  version "2.0.0"
+┊    ┊1004┊  resolved "https://registry.yarnpkg.com/constant-case/-/constant-case-2.0.0.tgz#4175764d389d3fa9c8ecd29186ed6005243b6a46"
+┊    ┊1005┊  integrity sha1-QXV2TTidP6nI7NKRhu1gBSQ7akY=
+┊    ┊1006┊  dependencies:
+┊    ┊1007┊    snake-case "^2.1.0"
+┊    ┊1008┊    upper-case "^1.1.1"
+┊    ┊1009┊
 ┊ 641┊1010┊content-disposition@0.5.2:
 ┊ 642┊1011┊  version "0.5.2"
 ┊ 643┊1012┊  resolved "https://registry.yarnpkg.com/content-disposition/-/content-disposition-0.5.2.tgz#0cf68bb9ddf5f2be7961c3a85178cb85dba78cb4"
```
```diff
@@ -668,7 +1037,7 @@
 ┊ 668┊1037┊  resolved "https://registry.yarnpkg.com/core-js/-/core-js-3.0.0-beta.8.tgz#2b0b5a26e01cb176c9197d84d1f05911bcd66f53"
 ┊ 669┊1038┊  integrity sha512-ex9wpitprNDuK6bPRljFW0z0IBatqtmqeuZ1HpcFcSkdOQSGNu3XdZSTshEuAIeYgLarHpw55P3SQlKAnXmpuQ==
 ┊ 670┊1039┊
-┊ 671┊    ┊core-util-is@~1.0.0:
+┊    ┊1040┊core-util-is@1.0.2, core-util-is@~1.0.0:
 ┊ 672┊1041┊  version "1.0.2"
 ┊ 673┊1042┊  resolved "https://registry.yarnpkg.com/core-util-is/-/core-util-is-1.0.2.tgz#b5fd54220aa2bc5ab57aab7140c940754503c1a7"
 ┊ 674┊1043┊  integrity sha1-tf1UIgqivFq1eqtxQMlAdUUDwac=
```
```diff
@@ -688,6 +1057,14 @@
 ┊ 688┊1057┊  dependencies:
 ┊ 689┊1058┊    capture-stack-trace "^1.0.0"
 ┊ 690┊1059┊
+┊    ┊1060┊cross-fetch@2.2.2:
+┊    ┊1061┊  version "2.2.2"
+┊    ┊1062┊  resolved "https://registry.yarnpkg.com/cross-fetch/-/cross-fetch-2.2.2.tgz#a47ff4f7fc712daba8f6a695a11c948440d45723"
+┊    ┊1063┊  integrity sha1-pH/09/xxLauo9qaVoRyUhEDUVyM=
+┊    ┊1064┊  dependencies:
+┊    ┊1065┊    node-fetch "2.1.2"
+┊    ┊1066┊    whatwg-fetch "2.0.4"
+┊    ┊1067┊
 ┊ 691┊1068┊cross-spawn@^5.0.1:
 ┊ 692┊1069┊  version "5.1.0"
 ┊ 693┊1070┊  resolved "https://registry.yarnpkg.com/cross-spawn/-/cross-spawn-5.1.0.tgz#e8bd0efee58fcff6f8f94510a0a554bbfa235449"
```
```diff
@@ -702,6 +1079,18 @@
 ┊ 702┊1079┊  resolved "https://registry.yarnpkg.com/crypto-random-string/-/crypto-random-string-1.0.0.tgz#a230f64f568310e1498009940790ec99545bca7e"
 ┊ 703┊1080┊  integrity sha1-ojD2T1aDEOFJgAmUB5DsmVRbyn4=
 ┊ 704┊1081┊
+┊    ┊1082┊dashdash@^1.12.0:
+┊    ┊1083┊  version "1.14.1"
+┊    ┊1084┊  resolved "https://registry.yarnpkg.com/dashdash/-/dashdash-1.14.1.tgz#853cfa0f7cbe2fed5de20326b8dd581035f6e2f0"
+┊    ┊1085┊  integrity sha1-hTz6D3y+L+1d4gMmuN1YEDX24vA=
+┊    ┊1086┊  dependencies:
+┊    ┊1087┊    assert-plus "^1.0.0"
+┊    ┊1088┊
+┊    ┊1089┊date-fns@^1.27.2:
+┊    ┊1090┊  version "1.30.1"
+┊    ┊1091┊  resolved "https://registry.yarnpkg.com/date-fns/-/date-fns-1.30.1.tgz#2e71bf0b119153dbb4cc4e88d9ea5acfb50dc05c"
+┊    ┊1092┊  integrity sha512-hBSVCvSmWC+QypYObzwGOd9wqdDpOt+0wl0KbU+R+uuZBS1jN8VsD1ss3irQDknRj5NvxiTF6oj/nDRnN/UQNw==
+┊    ┊1093┊
 ┊ 705┊1094┊debug@2.6.9, debug@^2.1.2, debug@^2.2.0, debug@^2.3.3:
 ┊ 706┊1095┊  version "2.6.9"
 ┊ 707┊1096┊  resolved "https://registry.yarnpkg.com/debug/-/debug-2.6.9.tgz#5d128515df134ff327e90a4c93f4e077a536341f"
```
```diff
@@ -716,6 +1105,13 @@
 ┊ 716┊1105┊  dependencies:
 ┊ 717┊1106┊    ms "^2.1.1"
 ┊ 718┊1107┊
+┊    ┊1108┊debug@^4.1.0:
+┊    ┊1109┊  version "4.1.1"
+┊    ┊1110┊  resolved "https://registry.yarnpkg.com/debug/-/debug-4.1.1.tgz#3b72260255109c6b589cee050f1d516139664791"
+┊    ┊1111┊  integrity sha512-pYAIzeRo8J6KPEaJ0VWOh5Pzkbw/RetuzehGM7QRRX5he4fPHx2rdKMB256ehJCkX+XRQm16eZLqLNS8RSZXZw==
+┊    ┊1112┊  dependencies:
+┊    ┊1113┊    ms "^2.1.1"
+┊    ┊1114┊
 ┊ 719┊1115┊decode-uri-component@^0.2.0:
 ┊ 720┊1116┊  version "0.2.0"
 ┊ 721┊1117┊  resolved "https://registry.yarnpkg.com/decode-uri-component/-/decode-uri-component-0.2.0.tgz#eb3913333458775cb84cd1a1fae062106bb87545"
```
```diff
@@ -726,6 +1122,11 @@
 ┊ 726┊1122┊  resolved "https://registry.yarnpkg.com/deep-extend/-/deep-extend-0.6.0.tgz#c4fa7c95404a17a9c3e8ca7e1537312b736330ac"
 ┊ 727┊1123┊  integrity sha512-LOHxIOaPYdHlJRtCQfDIVZtfw/ufM8+rVj649RIHzcm/vGwQRXFt6OPqIFWsm2XEMrNIEtWR64sY1LEKD2vAOA==
 ┊ 728┊1124┊
+┊    ┊1125┊deepmerge@3.0.0:
+┊    ┊1126┊  version "3.0.0"
+┊    ┊1127┊  resolved "https://registry.yarnpkg.com/deepmerge/-/deepmerge-3.0.0.tgz#ca7903b34bfa1f8c2eab6779280775a411bfc6ba"
+┊    ┊1128┊  integrity sha512-a8z8bkgHsAML+uHLqmMS83HHlpy3PvZOOuiTQqaa3wu8ZVg3h0hqHk6aCsGdOnZV2XMM/FRimNGjUh0KCcmHBw==
+┊    ┊1129┊
 ┊ 729┊1130┊define-properties@^1.1.2:
 ┊ 730┊1131┊  version "1.1.3"
 ┊ 731┊1132┊  resolved "https://registry.yarnpkg.com/define-properties/-/define-properties-1.1.3.tgz#cf88da6cbee26fe6db7094f61d870cbd84cee9f1"
```
```diff
@@ -755,6 +1156,11 @@
 ┊ 755┊1156┊    is-descriptor "^1.0.2"
 ┊ 756┊1157┊    isobject "^3.0.1"
 ┊ 757┊1158┊
+┊    ┊1159┊delayed-stream@~1.0.0:
+┊    ┊1160┊  version "1.0.0"
+┊    ┊1161┊  resolved "https://registry.yarnpkg.com/delayed-stream/-/delayed-stream-1.0.0.tgz#df3ae199acadfb7d440aaae0b29e2272b24ec619"
+┊    ┊1162┊  integrity sha1-3zrhmayt+31ECqrgsp4icrJOxhk=
+┊    ┊1163┊
 ┊ 758┊1164┊delegates@^1.0.0:
 ┊ 759┊1165┊  version "1.0.0"
 ┊ 760┊1166┊  resolved "https://registry.yarnpkg.com/delegates/-/delegates-1.0.0.tgz#84c6e159b81904fdca59a0ef44cd870d31250f9a"
```
```diff
@@ -775,11 +1181,25 @@
 ┊ 775┊1181┊  resolved "https://registry.yarnpkg.com/destroy/-/destroy-1.0.4.tgz#978857442c44749e4206613e37946205826abd80"
 ┊ 776┊1182┊  integrity sha1-l4hXRCxEdJ5CBmE+N5RiBYJqvYA=
 ┊ 777┊1183┊
+┊    ┊1184┊detect-indent@5.0.0:
+┊    ┊1185┊  version "5.0.0"
+┊    ┊1186┊  resolved "https://registry.yarnpkg.com/detect-indent/-/detect-indent-5.0.0.tgz#3871cc0a6a002e8c3e5b3cf7f336264675f06b9d"
+┊    ┊1187┊  integrity sha1-OHHMCmoALow+Wzz38zYmRnXwa50=
+┊    ┊1188┊
 ┊ 778┊1189┊detect-libc@^1.0.2:
 ┊ 779┊1190┊  version "1.0.3"
 ┊ 780┊1191┊  resolved "https://registry.yarnpkg.com/detect-libc/-/detect-libc-1.0.3.tgz#fa137c4bd698edf55cd5cd02ac559f91a4c4ba9b"
 ┊ 781┊1192┊  integrity sha1-+hN8S9aY7fVc1c0CrFWfkaTEups=
 ┊ 782┊1193┊
+┊    ┊1194┊diagnostics@^1.1.1:
+┊    ┊1195┊  version "1.1.1"
+┊    ┊1196┊  resolved "https://registry.yarnpkg.com/diagnostics/-/diagnostics-1.1.1.tgz#cab6ac33df70c9d9a727490ae43ac995a769b22a"
+┊    ┊1197┊  integrity sha512-8wn1PmdunLJ9Tqbx+Fx/ZEuHfJf4NKSN2ZBj7SJC/OWRWha843+WsTjqMe1B5E3p28jqBlp+mJ2fPVxPyNgYKQ==
+┊    ┊1198┊  dependencies:
+┊    ┊1199┊    colorspace "1.1.x"
+┊    ┊1200┊    enabled "1.0.x"
+┊    ┊1201┊    kuler "1.0.x"
+┊    ┊1202┊
 ┊ 783┊1203┊dicer@0.3.0:
 ┊ 784┊1204┊  version "0.3.0"
 ┊ 785┊1205┊  resolved "https://registry.yarnpkg.com/dicer/-/dicer-0.3.0.tgz#eacd98b3bfbf92e8ab5c2fdb71aaac44bb06b872"
```
```diff
@@ -792,6 +1212,13 @@
 ┊ 792┊1212┊  resolved "https://registry.yarnpkg.com/diff/-/diff-3.5.0.tgz#800c0dd1e0a8bfbc95835c202ad220fe317e5a12"
 ┊ 793┊1213┊  integrity sha512-A46qtFgd+g7pDZinpnwiRJtxbC1hpgf0uzP3iG89scHk0AUC7A1TGxf5OiiOUv/JMZR8GOt8hL900hV0bOy5xA==
 ┊ 794┊1214┊
+┊    ┊1215┊dot-case@^2.1.0:
+┊    ┊1216┊  version "2.1.1"
+┊    ┊1217┊  resolved "https://registry.yarnpkg.com/dot-case/-/dot-case-2.1.1.tgz#34dcf37f50a8e93c2b3bca8bb7fb9155c7da3bee"
+┊    ┊1218┊  integrity sha1-NNzzf1Co6TwrO8qLt/uRVcfaO+4=
+┊    ┊1219┊  dependencies:
+┊    ┊1220┊    no-case "^2.2.0"
+┊    ┊1221┊
 ┊ 795┊1222┊dot-prop@^4.1.0:
 ┊ 796┊1223┊  version "4.2.0"
 ┊ 797┊1224┊  resolved "https://registry.yarnpkg.com/dot-prop/-/dot-prop-4.2.0.tgz#1f19e0c2e1aa0e32797c49799f2837ac6af69c57"
```
```diff
@@ -804,16 +1231,41 @@
 ┊ 804┊1231┊  resolved "https://registry.yarnpkg.com/duplexer3/-/duplexer3-0.1.4.tgz#ee01dd1cac0ed3cbc7fdbea37dc0a8f1ce002ce2"
 ┊ 805┊1232┊  integrity sha1-7gHdHKwO08vH/b6jfcCo8c4ALOI=
 ┊ 806┊1233┊
+┊    ┊1234┊ecc-jsbn@~0.1.1:
+┊    ┊1235┊  version "0.1.2"
+┊    ┊1236┊  resolved "https://registry.yarnpkg.com/ecc-jsbn/-/ecc-jsbn-0.1.2.tgz#3a83a904e54353287874c564b7549386849a98c9"
+┊    ┊1237┊  integrity sha1-OoOpBOVDUyh4dMVkt1SThoSamMk=
+┊    ┊1238┊  dependencies:
+┊    ┊1239┊    jsbn "~0.1.0"
+┊    ┊1240┊    safer-buffer "^2.1.0"
+┊    ┊1241┊
 ┊ 807┊1242┊ee-first@1.1.1:
 ┊ 808┊1243┊  version "1.1.1"
 ┊ 809┊1244┊  resolved "https://registry.yarnpkg.com/ee-first/-/ee-first-1.1.1.tgz#590c61156b0ae2f4f0255732a158b266bc56b21d"
 ┊ 810┊1245┊  integrity sha1-WQxhFWsK4vTwJVcyoViyZrxWsh0=
 ┊ 811┊1246┊
+┊    ┊1247┊elegant-spinner@^1.0.1:
+┊    ┊1248┊  version "1.0.1"
+┊    ┊1249┊  resolved "https://registry.yarnpkg.com/elegant-spinner/-/elegant-spinner-1.0.1.tgz#db043521c95d7e303fd8f345bedc3349cfb0729e"
+┊    ┊1250┊  integrity sha1-2wQ1IcldfjA/2PNFvtwzSc+wcp4=
+┊    ┊1251┊
+┊    ┊1252┊enabled@1.0.x:
+┊    ┊1253┊  version "1.0.2"
+┊    ┊1254┊  resolved "https://registry.yarnpkg.com/enabled/-/enabled-1.0.2.tgz#965f6513d2c2d1c5f4652b64a2e3396467fc2f93"
+┊    ┊1255┊  integrity sha1-ll9lE9LC0cX0ZStkouM5ZGf8L5M=
+┊    ┊1256┊  dependencies:
+┊    ┊1257┊    env-variable "0.0.x"
+┊    ┊1258┊
 ┊ 812┊1259┊encodeurl@~1.0.2:
 ┊ 813┊1260┊  version "1.0.2"
 ┊ 814┊1261┊  resolved "https://registry.yarnpkg.com/encodeurl/-/encodeurl-1.0.2.tgz#ad3ff4c86ec2d029322f5a02c3a9a606c95b3f59"
 ┊ 815┊1262┊  integrity sha1-rT/0yG7C0CkyL1oCw6mmBslbP1k=
 ┊ 816┊1263┊
+┊    ┊1264┊env-variable@0.0.x:
+┊    ┊1265┊  version "0.0.5"
+┊    ┊1266┊  resolved "https://registry.yarnpkg.com/env-variable/-/env-variable-0.0.5.tgz#913dd830bef11e96a039c038d4130604eba37f88"
+┊    ┊1267┊  integrity sha512-zoB603vQReOFvTg5xMl9I1P2PnHsHQQKTEowsKKD7nseUfJq6UWzK+4YtlWUO1nhiQUxe6XMkk+JleSZD1NZFA==
+┊    ┊1268┊
 ┊ 817┊1269┊es-abstract@^1.5.1:
 ┊ 818┊1270┊  version "1.13.0"
 ┊ 819┊1271┊  resolved "https://registry.yarnpkg.com/es-abstract/-/es-abstract-1.13.0.tgz#ac86145fdd5099d8dd49558ccba2eaf9b88e24e9"
```
```diff
@@ -840,11 +1292,21 @@
 ┊ 840┊1292┊  resolved "https://registry.yarnpkg.com/escape-html/-/escape-html-1.0.3.tgz#0258eae4d3d0c0974de1c169188ef0051d1d1988"
 ┊ 841┊1293┊  integrity sha1-Aljq5NPQwJdN4cFpGI7wBR0dGYg=
 ┊ 842┊1294┊
-┊ 843┊    ┊escape-string-regexp@^1.0.5:
+┊    ┊1295┊escape-string-regexp@^1.0.2, escape-string-regexp@^1.0.5:
 ┊ 844┊1296┊  version "1.0.5"
 ┊ 845┊1297┊  resolved "https://registry.yarnpkg.com/escape-string-regexp/-/escape-string-regexp-1.0.5.tgz#1b61c0562190a8dff6ae3bb2cf0200ca130b86d4"
 ┊ 846┊1298┊  integrity sha1-G2HAViGQqN/2rjuyzwIAyhMLhtQ=
 ┊ 847┊1299┊
+┊    ┊1300┊esprima@^4.0.0:
+┊    ┊1301┊  version "4.0.1"
+┊    ┊1302┊  resolved "https://registry.yarnpkg.com/esprima/-/esprima-4.0.1.tgz#13b04cdb3e6c5d19df91ab6987a8695619b0aa71"
+┊    ┊1303┊  integrity sha512-eGuFFw7Upda+g4p+QHvnW0RyTX/SVeJBDM/gCtMARO0cLuT2HcEKnTPvhjV6aGeqrCB/sbNop0Kszm0jsaWU4A==
+┊    ┊1304┊
+┊    ┊1305┊esutils@^2.0.2:
+┊    ┊1306┊  version "2.0.2"
+┊    ┊1307┊  resolved "https://registry.yarnpkg.com/esutils/-/esutils-2.0.2.tgz#0abf4f1caa5bcb1f7a9d8acc6dea4faaa04bac9b"
+┊    ┊1308┊  integrity sha1-Cr9PHKpbyx96nYrMbepPqqBLrJs=
+┊    ┊1309┊
 ┊ 848┊1310┊etag@~1.8.1:
 ┊ 849┊1311┊  version "1.8.1"
 ┊ 850┊1312┊  resolved "https://registry.yarnpkg.com/etag/-/etag-1.8.1.tgz#41ae2eeb65efa62268aebfea83ac7d79299b0887"
```
```diff
@@ -932,6 +1394,20 @@
 ┊ 932┊1394┊    assign-symbols "^1.0.0"
 ┊ 933┊1395┊    is-extendable "^1.0.1"
 ┊ 934┊1396┊
+┊    ┊1397┊extend@~3.0.2:
+┊    ┊1398┊  version "3.0.2"
+┊    ┊1399┊  resolved "https://registry.yarnpkg.com/extend/-/extend-3.0.2.tgz#f8b1136b4071fbd8eb140aff858b1019ec2915fa"
+┊    ┊1400┊  integrity sha512-fjquC59cD7CyW6urNXK0FBufkZcoiGG80wTuPujX590cB5Ttln20E2UB4S/WARVqhXffZl2LNgS+gQdPIIim/g==
+┊    ┊1401┊
+┊    ┊1402┊external-editor@^3.0.0:
+┊    ┊1403┊  version "3.0.3"
+┊    ┊1404┊  resolved "https://registry.yarnpkg.com/external-editor/-/external-editor-3.0.3.tgz#5866db29a97826dbe4bf3afd24070ead9ea43a27"
+┊    ┊1405┊  integrity sha512-bn71H9+qWoOQKyZDo25mOMVpSmXROAsTJVVVYzrrtol3d4y+AsKjf4Iwl2Q+IuT0kFSQ1qo166UuIwqYq7mGnA==
+┊    ┊1406┊  dependencies:
+┊    ┊1407┊    chardet "^0.7.0"
+┊    ┊1408┊    iconv-lite "^0.4.24"
+┊    ┊1409┊    tmp "^0.0.33"
+┊    ┊1410┊
 ┊ 935┊1411┊extglob@^2.0.4:
 ┊ 936┊1412┊  version "2.0.4"
 ┊ 937┊1413┊  resolved "https://registry.yarnpkg.com/extglob/-/extglob-2.0.4.tgz#ad00fe4dc612a9232e8718711dc5cb5ab0285543"
```
```diff
@@ -946,11 +1422,51 @@
 ┊ 946┊1422┊    snapdragon "^0.8.1"
 ┊ 947┊1423┊    to-regex "^3.0.1"
 ┊ 948┊1424┊
+┊    ┊1425┊extsprintf@1.3.0:
+┊    ┊1426┊  version "1.3.0"
+┊    ┊1427┊  resolved "https://registry.yarnpkg.com/extsprintf/-/extsprintf-1.3.0.tgz#96918440e3041a7a414f8c52e3c574eb3c3e1e05"
+┊    ┊1428┊  integrity sha1-lpGEQOMEGnpBT4xS48V06zw+HgU=
+┊    ┊1429┊
+┊    ┊1430┊extsprintf@^1.2.0:
+┊    ┊1431┊  version "1.4.0"
+┊    ┊1432┊  resolved "https://registry.yarnpkg.com/extsprintf/-/extsprintf-1.4.0.tgz#e2689f8f356fad62cca65a3a91c5df5f9551692f"
+┊    ┊1433┊  integrity sha1-4mifjzVvrWLMplo6kcXfX5VRaS8=
+┊    ┊1434┊
+┊    ┊1435┊fast-deep-equal@^2.0.1:
+┊    ┊1436┊  version "2.0.1"
+┊    ┊1437┊  resolved "https://registry.yarnpkg.com/fast-deep-equal/-/fast-deep-equal-2.0.1.tgz#7b05218ddf9667bf7f370bf7fdb2cb15fdd0aa49"
+┊    ┊1438┊  integrity sha1-ewUhjd+WZ79/Nwv3/bLLFf3Qqkk=
+┊    ┊1439┊
 ┊ 949┊1440┊fast-json-stable-stringify@^2.0.0:
 ┊ 950┊1441┊  version "2.0.0"
 ┊ 951┊1442┊  resolved "https://registry.yarnpkg.com/fast-json-stable-stringify/-/fast-json-stable-stringify-2.0.0.tgz#d5142c0caee6b1189f87d3a76111064f86c8bbf2"
 ┊ 952┊1443┊  integrity sha1-1RQsDK7msRifh9OnYREGT4bIu/I=
 ┊ 953┊1444┊
+┊    ┊1445┊fast-safe-stringify@^2.0.4:
+┊    ┊1446┊  version "2.0.6"
+┊    ┊1447┊  resolved "https://registry.yarnpkg.com/fast-safe-stringify/-/fast-safe-stringify-2.0.6.tgz#04b26106cc56681f51a044cfc0d76cf0008ac2c2"
+┊    ┊1448┊  integrity sha512-q8BZ89jjc+mz08rSxROs8VsrBBcn1SIw1kq9NjolL509tkABRk9io01RAjSaEv1Xb2uFLt8VtRiZbGp5H8iDtg==
+┊    ┊1449┊
+┊    ┊1450┊fecha@^2.3.3:
+┊    ┊1451┊  version "2.3.3"
+┊    ┊1452┊  resolved "https://registry.yarnpkg.com/fecha/-/fecha-2.3.3.tgz#948e74157df1a32fd1b12c3a3c3cdcb6ec9d96cd"
+┊    ┊1453┊  integrity sha512-lUGBnIamTAwk4znq5BcqsDaxSmZ9nDVJaij6NvRt/Tg4R69gERA+otPKbS86ROw9nxVMw2/mp1fnaiWqbs6Sdg==
+┊    ┊1454┊
+┊    ┊1455┊figures@^1.7.0:
+┊    ┊1456┊  version "1.7.0"
+┊    ┊1457┊  resolved "https://registry.yarnpkg.com/figures/-/figures-1.7.0.tgz#cbe1e3affcf1cd44b80cadfed28dc793a9701d2e"
+┊    ┊1458┊  integrity sha1-y+Hjr/zxzUS4DK3+0o3Hk6lwHS4=
+┊    ┊1459┊  dependencies:
+┊    ┊1460┊    escape-string-regexp "^1.0.5"
+┊    ┊1461┊    object-assign "^4.1.0"
+┊    ┊1462┊
+┊    ┊1463┊figures@^2.0.0:
+┊    ┊1464┊  version "2.0.0"
+┊    ┊1465┊  resolved "https://registry.yarnpkg.com/figures/-/figures-2.0.0.tgz#3ab1a2d2a62c8bfb431a0c94cb797a2fce27c962"
+┊    ┊1466┊  integrity sha1-OrGi0qYsi/tDGgyUy3l6L84nyWI=
+┊    ┊1467┊  dependencies:
+┊    ┊1468┊    escape-string-regexp "^1.0.5"
+┊    ┊1469┊
 ┊ 954┊1470┊fill-range@^4.0.0:
 ┊ 955┊1471┊  version "4.0.0"
 ┊ 956┊1472┊  resolved "https://registry.yarnpkg.com/fill-range/-/fill-range-4.0.0.tgz#d544811d428f98eb06a63dc402d2403c328c38f7"
```
```diff
@@ -979,6 +1495,20 @@
 ┊ 979┊1495┊  resolved "https://registry.yarnpkg.com/for-in/-/for-in-1.0.2.tgz#81068d295a8142ec0ac726c6e2200c30fb6d5e80"
 ┊ 980┊1496┊  integrity sha1-gQaNKVqBQuwKxybG4iAMMPttXoA=
 ┊ 981┊1497┊
+┊    ┊1498┊forever-agent@~0.6.1:
+┊    ┊1499┊  version "0.6.1"
+┊    ┊1500┊  resolved "https://registry.yarnpkg.com/forever-agent/-/forever-agent-0.6.1.tgz#fbc71f0c41adeb37f96c577ad1ed42d8fdacca91"
+┊    ┊1501┊  integrity sha1-+8cfDEGt6zf5bFd60e1C2P2sypE=
+┊    ┊1502┊
+┊    ┊1503┊form-data@~2.3.2:
+┊    ┊1504┊  version "2.3.3"
+┊    ┊1505┊  resolved "https://registry.yarnpkg.com/form-data/-/form-data-2.3.3.tgz#dcce52c05f644f298c6a7ab936bd724ceffbf3a6"
+┊    ┊1506┊  integrity sha512-1lLKB2Mu3aGP1Q/2eCOx0fNbRMe7XdwktwOruhfqqd0rIJWwN4Dh+E3hrPSlDCXnSR7UtZ1N38rVXm+6+MEhJQ==
+┊    ┊1507┊  dependencies:
+┊    ┊1508┊    asynckit "^0.4.0"
+┊    ┊1509┊    combined-stream "^1.0.6"
+┊    ┊1510┊    mime-types "^2.1.12"
+┊    ┊1511┊
 ┊ 982┊1512┊forwarded@~0.1.2:
 ┊ 983┊1513┊  version "0.1.2"
 ┊ 984┊1514┊  resolved "https://registry.yarnpkg.com/forwarded/-/forwarded-0.1.2.tgz#98c23dab1175657b8c0573e8ceccd91b0ff18c84"
```
```diff
@@ -1050,6 +1580,13 @@
 ┊1050┊1580┊  resolved "https://registry.yarnpkg.com/get-value/-/get-value-2.0.6.tgz#dc15ca1c672387ca76bd37ac0a395ba2042a2c28"
 ┊1051┊1581┊  integrity sha1-3BXKHGcjh8p2vTesCjlbogQqLCg=
 ┊1052┊1582┊
+┊    ┊1583┊getpass@^0.1.1:
+┊    ┊1584┊  version "0.1.7"
+┊    ┊1585┊  resolved "https://registry.yarnpkg.com/getpass/-/getpass-0.1.7.tgz#5eff8e3e684d569ae4cb2b1282604e8ba62149fa"
+┊    ┊1586┊  integrity sha1-Xv+OPmhNVprkyysSgmBOi6YhSfo=
+┊    ┊1587┊  dependencies:
+┊    ┊1588┊    assert-plus "^1.0.0"
+┊    ┊1589┊
 ┊1053┊1590┊glob-parent@^3.1.0:
 ┊1054┊1591┊  version "3.1.0"
 ┊1055┊1592┊  resolved "https://registry.yarnpkg.com/glob-parent/-/glob-parent-3.1.0.tgz#9e6af6299d8d3bd2bd40430832bd113df906c5ae"
```
```diff
@@ -1058,7 +1595,7 @@
 ┊1058┊1595┊    is-glob "^3.1.0"
 ┊1059┊1596┊    path-dirname "^1.0.0"
 ┊1060┊1597┊
-┊1061┊    ┊glob@^7.1.3:
+┊    ┊1598┊glob@7.1.3, glob@^7.1.3:
 ┊1062┊1599┊  version "7.1.3"
 ┊1063┊1600┊  resolved "https://registry.yarnpkg.com/glob/-/glob-7.1.3.tgz#3960832d3f1574108342dafd3a67b332c0969df1"
 ┊1064┊1601┊  integrity sha512-vcfuiIxogLV4DlGBHIUOwI0IbrJ8HWPc4MU7HzviGeNho/UJDfi6B5p3sHeWIQ0KGIU0Jpxi5ZHxemQfLkkAwQ==
```
```diff
@@ -1077,6 +1614,11 @@
 ┊1077┊1614┊  dependencies:
 ┊1078┊1615┊    ini "^1.3.4"
 ┊1079┊1616┊
+┊    ┊1617┊globals@^11.1.0:
+┊    ┊1618┊  version "11.10.0"
+┊    ┊1619┊  resolved "https://registry.yarnpkg.com/globals/-/globals-11.10.0.tgz#1e09776dffda5e01816b3bb4077c8b59c24eaa50"
+┊    ┊1620┊  integrity sha512-0GZF1RiPKU97IHUO5TORo9w1PwrH/NBPl+fS7oMLdaTRiYmYbwK4NWoZWrAdd0/abG9R2BU+OiwyQpTpE6pdfQ==
+┊    ┊1621┊
 ┊1080┊1622┊got@^6.7.1:
 ┊1081┊1623┊  version "6.7.1"
 ┊1082┊1624┊  resolved "https://registry.yarnpkg.com/got/-/got-6.7.1.tgz#240cd05785a9a18e561dc1b44b41c763ef1e8db0"
```
```diff
@@ -1099,6 +1641,98 @@
 ┊1099┊1641┊  resolved "https://registry.yarnpkg.com/graceful-fs/-/graceful-fs-4.1.15.tgz#ffb703e1066e8a0eeaa4c8b80ba9253eeefbfb00"
 ┊1100┊1642┊  integrity sha512-6uHUhOPEBgQ24HM+r6b/QwWfZq+yiFcipKFrOFiBEnWdy5sdzYoi+pJeQaPI5qOLRFqWmAXUPQNsielzdLoecA==
 ┊1101┊1643┊
+┊    ┊1644┊graphql-code-generator@^0.15.2:
+┊    ┊1645┊  version "0.15.2"
+┊    ┊1646┊  resolved "https://registry.yarnpkg.com/graphql-code-generator/-/graphql-code-generator-0.15.2.tgz#7ffe5b70e8f442c9dffe608f1e013984813783db"
+┊    ┊1647┊  integrity sha512-u8oLoCl3aFXV110sWFi7d9YJT4xLqS/3Xl7pEuowmCtHm7KnpfKmTXvnXs9OEjo3Ci6oA8x/4MDChs0RzjNHzw==
+┊    ┊1648┊  dependencies:
+┊    ┊1649┊    "@graphql-modules/epoxy" "0.2.18"
+┊    ┊1650┊    "@types/babylon" "6.16.4"
+┊    ┊1651┊    "@types/is-glob" "4.0.0"
+┊    ┊1652┊    "@types/prettier" "1.15.2"
+┊    ┊1653┊    "@types/valid-url" "1.0.2"
+┊    ┊1654┊    babel-types "7.0.0-beta.3"
+┊    ┊1655┊    babylon "7.0.0-beta.47"
+┊    ┊1656┊    chalk "2.4.1"
+┊    ┊1657┊    chokidar "2.0.4"
+┊    ┊1658┊    commander "2.19.0"
+┊    ┊1659┊    detect-indent "5.0.0"
+┊    ┊1660┊    glob "7.1.3"
+┊    ┊1661┊    graphql-codegen-core "0.15.2"
+┊    ┊1662┊    graphql-config "2.2.1"
+┊    ┊1663┊    graphql-import "0.7.1"
+┊    ┊1664┊    graphql-tag-pluck "0.4.4"
+┊    ┊1665┊    indent-string "3.2.0"
+┊    ┊1666┊    inquirer "6.2.1"
+┊    ┊1667┊    is-glob "4.0.0"
+┊    ┊1668┊    is-valid-path "0.1.1"
+┊    ┊1669┊    js-yaml "3.12.0"
+┊    ┊1670┊    json-to-pretty-yaml "1.2.2"
+┊    ┊1671┊    listr "0.14.3"
+┊    ┊1672┊    log-symbols "2.2.0"
+┊    ┊1673┊    log-update "2.3.0"
+┊    ┊1674┊    mkdirp "0.5.1"
+┊    ┊1675┊    prettier "1.15.3"
+┊    ┊1676┊    request "2.88.0"
+┊    ┊1677┊    valid-url "1.0.9"
+┊    ┊1678┊
+┊    ┊1679┊graphql-codegen-core@0.15.2:
+┊    ┊1680┊  version "0.15.2"
+┊    ┊1681┊  resolved "https://registry.yarnpkg.com/graphql-codegen-core/-/graphql-codegen-core-0.15.2.tgz#f97ff2bcedddf8ce0623e21afef586f7249c453b"
+┊    ┊1682┊  integrity sha512-kMzeu4TSLVeYqhwBP1cRqHHpNhszC1jG00oKN2qmQ0jWpjiR8LymXrYHI7sYY+/+q2ASGRQhok9um8OgD2DsLw==
+┊    ┊1683┊  dependencies:
+┊    ┊1684┊    chalk "2.4.1"
+┊    ┊1685┊    change-case "3.0.2"
+┊    ┊1686┊    common-tags "1.8.0"
+┊    ┊1687┊    graphql-tag "2.10.0"
+┊    ┊1688┊    graphql-tools "4.0.3"
+┊    ┊1689┊    ts-log "2.1.4"
+┊    ┊1690┊    winston "3.1.0"
+┊    ┊1691┊
+┊    ┊1692┊graphql-codegen-plugin-helpers@0.15.2:
+┊    ┊1693┊  version "0.15.2"
+┊    ┊1694┊  resolved "https://registry.yarnpkg.com/graphql-codegen-plugin-helpers/-/graphql-codegen-plugin-helpers-0.15.2.tgz#824e9003950412f12ccbc436577d11edb5f51fae"
+┊    ┊1695┊  integrity sha512-xGeLIwr3O+SK0VKgqh+Bjd3vLHpN8g/l2DPf/271Glf+TEaYzLvlm6sgd+wlwwIt28frQb9oXFUABM6sgTXv8Q==
+┊    ┊1696┊  dependencies:
+┊    ┊1697┊    graphql-codegen-core "0.15.2"
+┊    ┊1698┊    import-from "2.1.0"
+┊    ┊1699┊
+┊    ┊1700┊graphql-codegen-typescript-common@0.15.2, graphql-codegen-typescript-common@^0.15.2:
+┊    ┊1701┊  version "0.15.2"
+┊    ┊1702┊  resolved "https://registry.yarnpkg.com/graphql-codegen-typescript-common/-/graphql-codegen-typescript-common-0.15.2.tgz#9368ca0d9a4f2938823d3dc80b364cd337c686df"
+┊    ┊1703┊  integrity sha512-y4LVrSpqGFiXv1SxeVjZZtoTpo/Y9JXxWtu7h5xHQquao6cp4K1wtkwUxzJwR86Me6InLjK+dBvNtrBnnet2Rw==
+┊    ┊1704┊  dependencies:
+┊    ┊1705┊    change-case "3.0.2"
+┊    ┊1706┊    common-tags "1.8.0"
+┊    ┊1707┊    graphql-codegen-core "0.15.2"
+┊    ┊1708┊    graphql-codegen-plugin-helpers "0.15.2"
+┊    ┊1709┊
+┊    ┊1710┊graphql-codegen-typescript-resolvers@^0.15.2:
+┊    ┊1711┊  version "0.15.2"
+┊    ┊1712┊  resolved "https://registry.yarnpkg.com/graphql-codegen-typescript-resolvers/-/graphql-codegen-typescript-resolvers-0.15.2.tgz#bdf22a5f98388e41b918e68a568aca1a92a9dd79"
+┊    ┊1713┊  integrity sha512-XJG8Uzv70Ib1o9xWK0QF4hoHe/VpqbNI9TROXU/dKhbVAs+SMB0DYtG/zJRnYMz3He0ea/f1L1Bxopnx1VxDMg==
+┊    ┊1714┊  dependencies:
+┊    ┊1715┊    graphql-codegen-plugin-helpers "0.15.2"
+┊    ┊1716┊    graphql-codegen-typescript-common "0.15.2"
+┊    ┊1717┊
+┊    ┊1718┊graphql-codegen-typescript-server@^0.15.2:
+┊    ┊1719┊  version "0.15.2"
+┊    ┊1720┊  resolved "https://registry.yarnpkg.com/graphql-codegen-typescript-server/-/graphql-codegen-typescript-server-0.15.2.tgz#dcf6000f22d1f66c7f2d9991fd37372efc61d74b"
+┊    ┊1721┊  integrity sha512-12rKf7+zAiPtDttb58uiq8WF0HmYCI6UN/+8UMdYSZbqHwVyY+D+aNRQLGq+wkw8oyN/mBtqEKuj89tQd/wt/w==
+┊    ┊1722┊  dependencies:
+┊    ┊1723┊    graphql-codegen-typescript-common "0.15.2"
+┊    ┊1724┊
+┊    ┊1725┊graphql-config@2.2.1:
+┊    ┊1726┊  version "2.2.1"
+┊    ┊1727┊  resolved "https://registry.yarnpkg.com/graphql-config/-/graphql-config-2.2.1.tgz#5fd0ec77ac7428ca5fb2026cf131be10151a0cb2"
+┊    ┊1728┊  integrity sha512-U8+1IAhw9m6WkZRRcyj8ZarK96R6lQBQ0an4lp76Ps9FyhOXENC5YQOxOFGm5CxPrX2rD0g3Je4zG5xdNJjwzQ==
+┊    ┊1729┊  dependencies:
+┊    ┊1730┊    graphql-import "^0.7.1"
+┊    ┊1731┊    graphql-request "^1.5.0"
+┊    ┊1732┊    js-yaml "^3.10.0"
+┊    ┊1733┊    lodash "^4.17.4"
+┊    ┊1734┊    minimatch "^3.0.4"
+┊    ┊1735┊
 ┊1102┊1736┊graphql-extensions@0.4.0:
 ┊1103┊1737┊  version "0.4.0"
 ┊1104┊1738┊  resolved "https://registry.yarnpkg.com/graphql-extensions/-/graphql-extensions-0.4.0.tgz#5857c7b7b9f20dbccbfd88730fffa5963b3c61ee"
```
```diff
@@ -1113,6 +1747,21 @@
 ┊1113┊1747┊  dependencies:
 ┊1114┊1748┊    "@apollographql/apollo-tools" "^0.2.6"
 ┊1115┊1749┊
+┊    ┊1750┊graphql-import@0.7.1, graphql-import@^0.7.1:
+┊    ┊1751┊  version "0.7.1"
+┊    ┊1752┊  resolved "https://registry.yarnpkg.com/graphql-import/-/graphql-import-0.7.1.tgz#4add8d91a5f752d764b0a4a7a461fcd93136f223"
+┊    ┊1753┊  integrity sha512-YpwpaPjRUVlw2SN3OPljpWbVRWAhMAyfSba5U47qGMOSsPLi2gYeJtngGpymjm9nk57RFWEpjqwh4+dpYuFAPw==
+┊    ┊1754┊  dependencies:
+┊    ┊1755┊    lodash "^4.17.4"
+┊    ┊1756┊    resolve-from "^4.0.0"
+┊    ┊1757┊
+┊    ┊1758┊graphql-request@^1.5.0:
+┊    ┊1759┊  version "1.8.2"
+┊    ┊1760┊  resolved "https://registry.yarnpkg.com/graphql-request/-/graphql-request-1.8.2.tgz#398d10ae15c585676741bde3fc01d5ca948f8fbe"
+┊    ┊1761┊  integrity sha512-dDX2M+VMsxXFCmUX0Vo0TopIZIX4ggzOtiCsThgtrKR4niiaagsGTDIHj3fsOMFETpa064vzovI+4YV4QnMbcg==
+┊    ┊1762┊  dependencies:
+┊    ┊1763┊    cross-fetch "2.2.2"
+┊    ┊1764┊
 ┊1116┊1765┊graphql-subscriptions@^1.0.0:
 ┊1117┊1766┊  version "1.0.0"
 ┊1118┊1767┊  resolved "https://registry.yarnpkg.com/graphql-subscriptions/-/graphql-subscriptions-1.0.0.tgz#475267694b3bd465af6477dbab4263a3f62702b8"
```
```diff
@@ -1120,12 +1769,23 @@
 ┊1120┊1769┊  dependencies:
 ┊1121┊1770┊    iterall "^1.2.1"
 ┊1122┊1771┊
-┊1123┊    ┊graphql-tag@^2.9.2:
+┊    ┊1772┊graphql-tag-pluck@0.4.4:
+┊    ┊1773┊  version "0.4.4"
+┊    ┊1774┊  resolved "https://registry.yarnpkg.com/graphql-tag-pluck/-/graphql-tag-pluck-0.4.4.tgz#4494c0e13d10aa9a36cea2704218940a1af47170"
+┊    ┊1775┊  integrity sha512-dvfRQ3aMxUYUYG+L+Z35npQ/OSNyitypYZ6wI908SqNQ6DQOWRX1WYcv590FOf2TrPOAY39dQEtq5u7mWMUGMw==
+┊    ┊1776┊  dependencies:
+┊    ┊1777┊    "@babel/parser" "^7.2.0"
+┊    ┊1778┊    "@babel/traverse" "^7.1.6"
+┊    ┊1779┊    "@babel/types" "^7.2.0"
+┊    ┊1780┊    source-map-support "^0.5.9"
+┊    ┊1781┊    typescript "^3.2.2"
+┊    ┊1782┊
+┊    ┊1783┊graphql-tag@2.10.0, graphql-tag@^2.9.2:
 ┊1124┊1784┊  version "2.10.0"
 ┊1125┊1785┊  resolved "https://registry.yarnpkg.com/graphql-tag/-/graphql-tag-2.10.0.tgz#87da024be863e357551b2b8700e496ee2d4353ae"
 ┊1126┊1786┊  integrity sha512-9FD6cw976TLLf9WYIUPCaaTpniawIjHWZSwIRZSjrfufJamcXbVVYfN2TWvJYbw0Xf2JjYbl1/f2+wDnBVw3/w==
 ┊1127┊1787┊
-┊1128┊    ┊graphql-tools@^4.0.0:
+┊    ┊1788┊graphql-tools@4.0.3, graphql-tools@^4.0.0:
 ┊1129┊1789┊  version "4.0.3"
 ┊1130┊1790┊  resolved "https://registry.yarnpkg.com/graphql-tools/-/graphql-tools-4.0.3.tgz#23b5cb52c519212b1b2e4630a361464396ad264b"
 ┊1131┊1791┊  integrity sha512-NNZM0WSnVLX1zIMUxu7SjzLZ4prCp15N5L2T2ro02OVyydZ0fuCnZYRnx/yK9xjGWbZA0Q58yEO//Bv/psJWrg==
```
```diff
@@ -1153,6 +1813,26 @@
 ┊1153┊1813┊  dependencies:
 ┊1154┊1814┊    iterall "^1.2.2"
 ┊1155┊1815┊
+┊    ┊1816┊har-schema@^2.0.0:
+┊    ┊1817┊  version "2.0.0"
+┊    ┊1818┊  resolved "https://registry.yarnpkg.com/har-schema/-/har-schema-2.0.0.tgz#a94c2224ebcac04782a0d9035521f24735b7ec92"
+┊    ┊1819┊  integrity sha1-qUwiJOvKwEeCoNkDVSHyRzW37JI=
+┊    ┊1820┊
+┊    ┊1821┊har-validator@~5.1.0:
+┊    ┊1822┊  version "5.1.3"
+┊    ┊1823┊  resolved "https://registry.yarnpkg.com/har-validator/-/har-validator-5.1.3.tgz#1ef89ebd3e4996557675eed9893110dc350fa080"
+┊    ┊1824┊  integrity sha512-sNvOCzEQNr/qrvJgc3UG/kD4QtlHycrzwS+6mfTrrSq97BvaYcPZZI1ZSqGSPR73Cxn4LKTD4PttRwfU7jWq5g==
+┊    ┊1825┊  dependencies:
+┊    ┊1826┊    ajv "^6.5.5"
+┊    ┊1827┊    har-schema "^2.0.0"
+┊    ┊1828┊
+┊    ┊1829┊has-ansi@^2.0.0:
+┊    ┊1830┊  version "2.0.0"
+┊    ┊1831┊  resolved "https://registry.yarnpkg.com/has-ansi/-/has-ansi-2.0.0.tgz#34f5049ce1ecdf2b0649af3ef24e45ed35416d91"
+┊    ┊1832┊  integrity sha1-NPUEnOHs3ysGSa8+8k5F7TVBbZE=
+┊    ┊1833┊  dependencies:
+┊    ┊1834┊    ansi-regex "^2.0.0"
+┊    ┊1835┊
 ┊1156┊1836┊has-flag@^3.0.0:
 ┊1157┊1837┊  version "3.0.0"
 ┊1158┊1838┊  resolved "https://registry.yarnpkg.com/has-flag/-/has-flag-3.0.0.tgz#b5d454dc2199ae225699f3467e5a07f3b955bafd"
```
```diff
@@ -1206,6 +1886,14 @@
 ┊1206┊1886┊  dependencies:
 ┊1207┊1887┊    function-bind "^1.1.1"
 ┊1208┊1888┊
+┊    ┊1889┊header-case@^1.0.0:
+┊    ┊1890┊  version "1.0.1"
+┊    ┊1891┊  resolved "https://registry.yarnpkg.com/header-case/-/header-case-1.0.1.tgz#9535973197c144b09613cd65d317ef19963bd02d"
+┊    ┊1892┊  integrity sha1-lTWXMZfBRLCWE81l0xfvGZY70C0=
+┊    ┊1893┊  dependencies:
+┊    ┊1894┊    no-case "^2.2.0"
+┊    ┊1895┊    upper-case "^1.1.3"
+┊    ┊1896┊
 ┊1209┊1897┊http-errors@1.6.3, http-errors@~1.6.2, http-errors@~1.6.3:
 ┊1210┊1898┊  version "1.6.3"
 ┊1211┊1899┊  resolved "https://registry.yarnpkg.com/http-errors/-/http-errors-1.6.3.tgz#8b55680bb4be283a0b5bf4ea2e38580be1d9320d"
```
```diff
@@ -1227,6 +1915,15 @@
 ┊1227┊1915┊    statuses ">= 1.5.0 < 2"
 ┊1228┊1916┊    toidentifier "1.0.0"
 ┊1229┊1917┊
+┊    ┊1918┊http-signature@~1.2.0:
+┊    ┊1919┊  version "1.2.0"
+┊    ┊1920┊  resolved "https://registry.yarnpkg.com/http-signature/-/http-signature-1.2.0.tgz#9aecd925114772f3d95b65a60abb8f7c18fbace1"
+┊    ┊1921┊  integrity sha1-muzZJRFHcvPZW2WmCruPfBj7rOE=
+┊    ┊1922┊  dependencies:
+┊    ┊1923┊    assert-plus "^1.0.0"
+┊    ┊1924┊    jsprim "^1.2.2"
+┊    ┊1925┊    sshpk "^1.7.0"
+┊    ┊1926┊
 ┊1230┊1927┊iconv-lite@0.4.23:
 ┊1231┊1928┊  version "0.4.23"
 ┊1232┊1929┊  resolved "https://registry.yarnpkg.com/iconv-lite/-/iconv-lite-0.4.23.tgz#297871f63be507adcfbfca715d0cd0eed84e9a63"
```
```diff
@@ -1234,7 +1931,7 @@
 ┊1234┊1931┊  dependencies:
 ┊1235┊1932┊    safer-buffer ">= 2.1.2 < 3"
 ┊1236┊1933┊
-┊1237┊    ┊iconv-lite@^0.4.4:
+┊    ┊1934┊iconv-lite@^0.4.24, iconv-lite@^0.4.4:
 ┊1238┊1935┊  version "0.4.24"
 ┊1239┊1936┊  resolved "https://registry.yarnpkg.com/iconv-lite/-/iconv-lite-0.4.24.tgz#2022b4b25fbddc21d2f524974a474aafe733908b"
 ┊1240┊1937┊  integrity sha512-v3MXnZAcvnywkTUEZomIActle7RXXeedOR31wwl7VlyoXO4Qi9arvSenNQWne1TcRwhCL1HwLI21bEqdpj8/rA==
```
```diff
@@ -1253,6 +1950,13 @@
 ┊1253┊1950┊  dependencies:
 ┊1254┊1951┊    minimatch "^3.0.4"
 ┊1255┊1952┊
+┊    ┊1953┊import-from@2.1.0:
+┊    ┊1954┊  version "2.1.0"
+┊    ┊1955┊  resolved "https://registry.yarnpkg.com/import-from/-/import-from-2.1.0.tgz#335db7f2a7affd53aaa471d4b8021dee36b7f3b1"
+┊    ┊1956┊  integrity sha1-M1238qev/VOqpHHUuAId7ja387E=
+┊    ┊1957┊  dependencies:
+┊    ┊1958┊    resolve-from "^3.0.0"
+┊    ┊1959┊
 ┊1256┊1960┊import-lazy@^2.1.0:
 ┊1257┊1961┊  version "2.1.0"
 ┊1258┊1962┊  resolved "https://registry.yarnpkg.com/import-lazy/-/import-lazy-2.1.0.tgz#05698e3d45c88e8d7e9d92cb0584e77f096f3e43"
```
```diff
@@ -1263,6 +1967,11 @@
 ┊1263┊1967┊  resolved "https://registry.yarnpkg.com/imurmurhash/-/imurmurhash-0.1.4.tgz#9218b9b2b928a238b13dc4fb6b6d576f231453ea"
 ┊1264┊1968┊  integrity sha1-khi5srkoojixPcT7a21XbyMUU+o=
 ┊1265┊1969┊
+┊    ┊1970┊indent-string@3.2.0, indent-string@^3.0.0:
+┊    ┊1971┊  version "3.2.0"
+┊    ┊1972┊  resolved "https://registry.yarnpkg.com/indent-string/-/indent-string-3.2.0.tgz#4a5fd6d27cc332f37e5419a504dbb837105c9289"
+┊    ┊1973┊  integrity sha1-Sl/W0nzDMvN+VBmlBNu4NxBckok=
+┊    ┊1974┊
 ┊1266┊1975┊inflight@^1.0.4:
 ┊1267┊1976┊  version "1.0.6"
 ┊1268┊1977┊  resolved "https://registry.yarnpkg.com/inflight/-/inflight-1.0.6.tgz#49bd6331d7d02d0c09bc910a1075ba8165b56df9"
```
```diff
@@ -1281,6 +1990,25 @@
 ┊1281┊1990┊  resolved "https://registry.yarnpkg.com/ini/-/ini-1.3.5.tgz#eee25f56db1c9ec6085e0c22778083f596abf927"
 ┊1282┊1991┊  integrity sha512-RZY5huIKCMRWDUqZlEi72f/lmXKMvuszcMBduliQ3nnWbx9X/ZBQO7DijMEYS9EhHBb2qacRUMtC7svLwe0lcw==
 ┊1283┊1992┊
+┊    ┊1993┊inquirer@6.2.1:
+┊    ┊1994┊  version "6.2.1"
+┊    ┊1995┊  resolved "https://registry.yarnpkg.com/inquirer/-/inquirer-6.2.1.tgz#9943fc4882161bdb0b0c9276769c75b32dbfcd52"
+┊    ┊1996┊  integrity sha512-088kl3DRT2dLU5riVMKKr1DlImd6X7smDhpXUCkJDCKvTEJeRiXh0G132HG9u5a+6Ylw9plFRY7RuTnwohYSpg==
+┊    ┊1997┊  dependencies:
+┊    ┊1998┊    ansi-escapes "^3.0.0"
+┊    ┊1999┊    chalk "^2.0.0"
+┊    ┊2000┊    cli-cursor "^2.1.0"
+┊    ┊2001┊    cli-width "^2.0.0"
+┊    ┊2002┊    external-editor "^3.0.0"
+┊    ┊2003┊    figures "^2.0.0"
+┊    ┊2004┊    lodash "^4.17.10"
+┊    ┊2005┊    mute-stream "0.0.7"
+┊    ┊2006┊    run-async "^2.2.0"
+┊    ┊2007┊    rxjs "^6.1.0"
+┊    ┊2008┊    string-width "^2.1.0"
+┊    ┊2009┊    strip-ansi "^5.0.0"
+┊    ┊2010┊    through "^2.3.6"
+┊    ┊2011┊
 ┊1284┊2012┊ipaddr.js@1.8.0:
 ┊1285┊2013┊  version "1.8.0"
 ┊1286┊2014┊  resolved "https://registry.yarnpkg.com/ipaddr.js/-/ipaddr.js-1.8.0.tgz#eaa33d6ddd7ace8f7f6fe0c9ca0440e706738b1e"
```
```diff
@@ -1300,6 +2028,11 @@
 ┊1300┊2028┊  dependencies:
 ┊1301┊2029┊    kind-of "^6.0.0"
 ┊1302┊2030┊
+┊    ┊2031┊is-arrayish@^0.3.1:
+┊    ┊2032┊  version "0.3.2"
+┊    ┊2033┊  resolved "https://registry.yarnpkg.com/is-arrayish/-/is-arrayish-0.3.2.tgz#4574a2ae56f7ab206896fb431eaeed066fdf8f03"
+┊    ┊2034┊  integrity sha512-eVRqCvVlZbuw3GrM63ovNSNAeA1K16kaR/LRY/92w0zxQ5/1YzwblUX652i4Xs9RwAGjW9d9y6X88t8OaAJfWQ==
+┊    ┊2035┊
 ┊1303┊2036┊is-binary-path@^1.0.0:
 ┊1304┊2037┊  version "1.0.1"
 ┊1305┊2038┊  resolved "https://registry.yarnpkg.com/is-binary-path/-/is-binary-path-1.0.1.tgz#75f16642b480f187a711c814161fd3a4a7655898"
```
```diff
@@ -1373,6 +2106,11 @@
 ┊1373┊2106┊  dependencies:
 ┊1374┊2107┊    is-plain-object "^2.0.4"
 ┊1375┊2108┊
+┊    ┊2109┊is-extglob@^1.0.0:
+┊    ┊2110┊  version "1.0.0"
+┊    ┊2111┊  resolved "https://registry.yarnpkg.com/is-extglob/-/is-extglob-1.0.0.tgz#ac468177c4943405a092fc8f29760c6ffc6206c0"
+┊    ┊2112┊  integrity sha1-rEaBd8SUNAWgkvyPKXYMb/xiBsA=
+┊    ┊2113┊
 ┊1376┊2114┊is-extglob@^2.1.0, is-extglob@^2.1.1:
 ┊1377┊2115┊  version "2.1.1"
 ┊1378┊2116┊  resolved "https://registry.yarnpkg.com/is-extglob/-/is-extglob-2.1.1.tgz#a88c02535791f02ed37c76a1b9ea9773c833f8c2"
```
```diff
@@ -1390,6 +2128,20 @@
 ┊1390┊2128┊  resolved "https://registry.yarnpkg.com/is-fullwidth-code-point/-/is-fullwidth-code-point-2.0.0.tgz#a3b30a5c4f199183167aaab93beefae3ddfb654f"
 ┊1391┊2129┊  integrity sha1-o7MKXE8ZkYMWeqq5O+764937ZU8=
 ┊1392┊2130┊
+┊    ┊2131┊is-glob@4.0.0, is-glob@^4.0.0:
+┊    ┊2132┊  version "4.0.0"
+┊    ┊2133┊  resolved "https://registry.yarnpkg.com/is-glob/-/is-glob-4.0.0.tgz#9521c76845cc2610a85203ddf080a958c2ffabc0"
+┊    ┊2134┊  integrity sha1-lSHHaEXMJhCoUgPd8ICpWML/q8A=
+┊    ┊2135┊  dependencies:
+┊    ┊2136┊    is-extglob "^2.1.1"
+┊    ┊2137┊
+┊    ┊2138┊is-glob@^2.0.0:
+┊    ┊2139┊  version "2.0.1"
+┊    ┊2140┊  resolved "https://registry.yarnpkg.com/is-glob/-/is-glob-2.0.1.tgz#d096f926a3ded5600f3fdfd91198cb0888c2d863"
+┊    ┊2141┊  integrity sha1-0Jb5JqPe1WAPP9/ZEZjLCIjC2GM=
+┊    ┊2142┊  dependencies:
+┊    ┊2143┊    is-extglob "^1.0.0"
+┊    ┊2144┊
 ┊1393┊2145┊is-glob@^3.1.0:
 ┊1394┊2146┊  version "3.1.0"
 ┊1395┊2147┊  resolved "https://registry.yarnpkg.com/is-glob/-/is-glob-3.1.0.tgz#7ba5ae24217804ac70707b96922567486cc3e84a"
```
```diff
@@ -1397,13 +2149,6 @@
 ┊1397┊2149┊  dependencies:
 ┊1398┊2150┊    is-extglob "^2.1.0"
 ┊1399┊2151┊
-┊1400┊    ┊is-glob@^4.0.0:
-┊1401┊    ┊  version "4.0.0"
-┊1402┊    ┊  resolved "https://registry.yarnpkg.com/is-glob/-/is-glob-4.0.0.tgz#9521c76845cc2610a85203ddf080a958c2ffabc0"
-┊1403┊    ┊  integrity sha1-lSHHaEXMJhCoUgPd8ICpWML/q8A=
-┊1404┊    ┊  dependencies:
-┊1405┊    ┊    is-extglob "^2.1.1"
-┊1406┊    ┊
 ┊1407┊2152┊is-installed-globally@^0.1.0:
 ┊1408┊2153┊  version "0.1.0"
 ┊1409┊2154┊  resolved "https://registry.yarnpkg.com/is-installed-globally/-/is-installed-globally-0.1.0.tgz#0dfd98f5a9111716dd535dda6492f67bf3d25a80"
```
```diff
@@ -1412,6 +2157,20 @@
 ┊1412┊2157┊    global-dirs "^0.1.0"
 ┊1413┊2158┊    is-path-inside "^1.0.0"
 ┊1414┊2159┊
+┊    ┊2160┊is-invalid-path@^0.1.0:
+┊    ┊2161┊  version "0.1.0"
+┊    ┊2162┊  resolved "https://registry.yarnpkg.com/is-invalid-path/-/is-invalid-path-0.1.0.tgz#307a855b3cf1a938b44ea70d2c61106053714f34"
+┊    ┊2163┊  integrity sha1-MHqFWzzxqTi0TqcNLGEQYFNxTzQ=
+┊    ┊2164┊  dependencies:
+┊    ┊2165┊    is-glob "^2.0.0"
+┊    ┊2166┊
+┊    ┊2167┊is-lower-case@^1.1.0:
+┊    ┊2168┊  version "1.1.3"
+┊    ┊2169┊  resolved "https://registry.yarnpkg.com/is-lower-case/-/is-lower-case-1.1.3.tgz#7e147be4768dc466db3bfb21cc60b31e6ad69393"
+┊    ┊2170┊  integrity sha1-fhR75HaNxGbbO/shzGCzHmrWk5M=
+┊    ┊2171┊  dependencies:
+┊    ┊2172┊    lower-case "^1.1.0"
+┊    ┊2173┊
 ┊1415┊2174┊is-npm@^1.0.0:
 ┊1416┊2175┊  version "1.0.0"
 ┊1417┊2176┊  resolved "https://registry.yarnpkg.com/is-npm/-/is-npm-1.0.0.tgz#f2fb63a65e4905b406c86072765a1a4dc793b9f4"
```
```diff
@@ -1429,6 +2188,13 @@
 ┊1429┊2188┊  resolved "https://registry.yarnpkg.com/is-obj/-/is-obj-1.0.1.tgz#3e4729ac1f5fde025cd7d83a896dab9f4f67db0f"
 ┊1430┊2189┊  integrity sha1-PkcprB9f3gJc19g6iW2rn09n2w8=
 ┊1431┊2190┊
+┊    ┊2191┊is-observable@^1.1.0:
+┊    ┊2192┊  version "1.1.0"
+┊    ┊2193┊  resolved "https://registry.yarnpkg.com/is-observable/-/is-observable-1.1.0.tgz#b3e986c8f44de950867cab5403f5a3465005975e"
+┊    ┊2194┊  integrity sha512-NqCa4Sa2d+u7BWc6CukaObG3Fh+CU9bvixbpcXYhy2VvYS7vVGIdAgnIS5Ks3A/cqk4rebLJ9s8zBstT2aKnIA==
+┊    ┊2195┊  dependencies:
+┊    ┊2196┊    symbol-observable "^1.1.0"
+┊    ┊2197┊
 ┊1432┊2198┊is-path-inside@^1.0.0:
 ┊1433┊2199┊  version "1.0.1"
 ┊1434┊2200┊  resolved "https://registry.yarnpkg.com/is-path-inside/-/is-path-inside-1.0.1.tgz#8ef5b7de50437a3fdca6b4e865ef7aa55cb48036"
```
```diff
@@ -1443,6 +2209,11 @@
 ┊1443┊2209┊  dependencies:
 ┊1444┊2210┊    isobject "^3.0.1"
 ┊1445┊2211┊
+┊    ┊2212┊is-promise@^2.1.0:
+┊    ┊2213┊  version "2.1.0"
+┊    ┊2214┊  resolved "https://registry.yarnpkg.com/is-promise/-/is-promise-2.1.0.tgz#79a2a9ece7f096e80f36d2b2f3bc16c1ff4bf3fa"
+┊    ┊2215┊  integrity sha1-eaKp7OfwlugPNtKy87wWwf9L8/o=
+┊    ┊2216┊
 ┊1446┊2217┊is-redirect@^1.0.0:
 ┊1447┊2218┊  version "1.0.0"
 ┊1448┊2219┊  resolved "https://registry.yarnpkg.com/is-redirect/-/is-redirect-1.0.0.tgz#1d03dded53bd8db0f30c26e4f95d36fc7c87dc24"
```
```diff
@@ -1472,6 +2243,25 @@
 ┊1472┊2243┊  dependencies:
 ┊1473┊2244┊    has-symbols "^1.0.0"
 ┊1474┊2245┊
+┊    ┊2246┊is-typedarray@~1.0.0:
+┊    ┊2247┊  version "1.0.0"
+┊    ┊2248┊  resolved "https://registry.yarnpkg.com/is-typedarray/-/is-typedarray-1.0.0.tgz#e479c80858df0c1b11ddda6940f96011fcda4a9a"
+┊    ┊2249┊  integrity sha1-5HnICFjfDBsR3dppQPlgEfzaSpo=
+┊    ┊2250┊
+┊    ┊2251┊is-upper-case@^1.1.0:
+┊    ┊2252┊  version "1.1.2"
+┊    ┊2253┊  resolved "https://registry.yarnpkg.com/is-upper-case/-/is-upper-case-1.1.2.tgz#8d0b1fa7e7933a1e58483600ec7d9661cbaf756f"
+┊    ┊2254┊  integrity sha1-jQsfp+eTOh5YSDYA7H2WYcuvdW8=
+┊    ┊2255┊  dependencies:
+┊    ┊2256┊    upper-case "^1.1.0"
+┊    ┊2257┊
+┊    ┊2258┊is-valid-path@0.1.1:
+┊    ┊2259┊  version "0.1.1"
+┊    ┊2260┊  resolved "https://registry.yarnpkg.com/is-valid-path/-/is-valid-path-0.1.1.tgz#110f9ff74c37f663e1ec7915eb451f2db93ac9df"
+┊    ┊2261┊  integrity sha1-EQ+f90w39mPh7HkV60UfLbk6yd8=
+┊    ┊2262┊  dependencies:
+┊    ┊2263┊    is-invalid-path "^0.1.0"
+┊    ┊2264┊
 ┊1475┊2265┊is-windows@^1.0.2:
 ┊1476┊2266┊  version "1.0.2"
 ┊1477┊2267┊  resolved "https://registry.yarnpkg.com/is-windows/-/is-windows-1.0.2.tgz#d1850eb9791ecd18e6182ce12a30f396634bb19d"
```
```diff
@@ -1499,11 +2289,57 @@
 ┊1499┊2289┊  resolved "https://registry.yarnpkg.com/isobject/-/isobject-3.0.1.tgz#4e431e92b11a9731636aa1f9c8d1ccbcfdab78df"
 ┊1500┊2290┊  integrity sha1-TkMekrEalzFjaqH5yNHMvP2reN8=
 ┊1501┊2291┊
+┊    ┊2292┊isstream@~0.1.2:
+┊    ┊2293┊  version "0.1.2"
+┊    ┊2294┊  resolved "https://registry.yarnpkg.com/isstream/-/isstream-0.1.2.tgz#47e63f7af55afa6f92e1500e690eb8b8529c099a"
+┊    ┊2295┊  integrity sha1-R+Y/evVa+m+S4VAOaQ64uFKcCZo=
+┊    ┊2296┊
 ┊1502┊2297┊iterall@^1.1.3, iterall@^1.2.1, iterall@^1.2.2:
 ┊1503┊2298┊  version "1.2.2"
 ┊1504┊2299┊  resolved "https://registry.yarnpkg.com/iterall/-/iterall-1.2.2.tgz#92d70deb8028e0c39ff3164fdbf4d8b088130cd7"
 ┊1505┊2300┊  integrity sha512-yynBb1g+RFUPY64fTrFv7nsjRrENBQJaX2UL+2Szc9REFrSNm1rpSXHGzhmAy7a9uv3vlvgBlXnf9RqmPH1/DA==
 ┊1506┊2301┊
+┊    ┊2302┊js-tokens@^4.0.0:
+┊    ┊2303┊  version "4.0.0"
+┊    ┊2304┊  resolved "https://registry.yarnpkg.com/js-tokens/-/js-tokens-4.0.0.tgz#19203fb59991df98e3a287050d4647cdeaf32499"
+┊    ┊2305┊  integrity sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==
+┊    ┊2306┊
+┊    ┊2307┊js-yaml@3.12.0:
+┊    ┊2308┊  version "3.12.0"
+┊    ┊2309┊  resolved "https://registry.yarnpkg.com/js-yaml/-/js-yaml-3.12.0.tgz#eaed656ec8344f10f527c6bfa1b6e2244de167d1"
+┊    ┊2310┊  integrity sha512-PIt2cnwmPfL4hKNwqeiuz4bKfnzHTBv6HyVgjahA6mPLwPDzjDWrplJBMjHUFxku/N3FlmrbyPclad+I+4mJ3A==
+┊    ┊2311┊  dependencies:
+┊    ┊2312┊    argparse "^1.0.7"
+┊    ┊2313┊    esprima "^4.0.0"
+┊    ┊2314┊
+┊    ┊2315┊js-yaml@^3.10.0:
+┊    ┊2316┊  version "3.12.1"
+┊    ┊2317┊  resolved "https://registry.yarnpkg.com/js-yaml/-/js-yaml-3.12.1.tgz#295c8632a18a23e054cf5c9d3cecafe678167600"
+┊    ┊2318┊  integrity sha512-um46hB9wNOKlwkHgiuyEVAybXBjwFUV0Z/RaHJblRd9DXltue9FTYvzCr9ErQrK9Adz5MU4gHWVaNUfdmrC8qA==
+┊    ┊2319┊  dependencies:
+┊    ┊2320┊    argparse "^1.0.7"
+┊    ┊2321┊    esprima "^4.0.0"
+┊    ┊2322┊
+┊    ┊2323┊jsbn@~0.1.0:
+┊    ┊2324┊  version "0.1.1"
+┊    ┊2325┊  resolved "https://registry.yarnpkg.com/jsbn/-/jsbn-0.1.1.tgz#a5e654c2e5a2deb5f201d96cefbca80c0ef2f513"
+┊    ┊2326┊  integrity sha1-peZUwuWi3rXyAdls77yoDA7y9RM=
+┊    ┊2327┊
+┊    ┊2328┊jsesc@^2.5.1:
+┊    ┊2329┊  version "2.5.2"
+┊    ┊2330┊  resolved "https://registry.yarnpkg.com/jsesc/-/jsesc-2.5.2.tgz#80564d2e483dacf6e8ef209650a67df3f0c283a4"
+┊    ┊2331┊  integrity sha512-OYu7XEzjkCQ3C5Ps3QIZsQfNpqoJyZZA99wd9aWd05NCtC5pWOkShK2mkL6HXQR6/Cy2lbNdPlZBpuQHXE63gA==
+┊    ┊2332┊
+┊    ┊2333┊json-schema-traverse@^0.4.1:
+┊    ┊2334┊  version "0.4.1"
+┊    ┊2335┊  resolved "https://registry.yarnpkg.com/json-schema-traverse/-/json-schema-traverse-0.4.1.tgz#69f6a87d9513ab8bb8fe63bdb0979c448e684660"
+┊    ┊2336┊  integrity sha512-xbbCH5dCYU5T8LcEhhuh7HJ88HXuW3qsI3Y0zOZFKfZEHcpWiHU/Jxzk629Brsab/mMiHQti9wMP+845RPe3Vg==
+┊    ┊2337┊
+┊    ┊2338┊json-schema@0.2.3:
+┊    ┊2339┊  version "0.2.3"
+┊    ┊2340┊  resolved "https://registry.yarnpkg.com/json-schema/-/json-schema-0.2.3.tgz#b480c892e59a2f05954ce727bd3f2a4e882f9e13"
+┊    ┊2341┊  integrity sha1-tIDIkuWaLwWVTOcnvT8qTogvnhM=
+┊    ┊2342┊
 ┊1507┊2343┊json-stable-stringify@^1.0.1:
 ┊1508┊2344┊  version "1.0.1"
 ┊1509┊2345┊  resolved "https://registry.yarnpkg.com/json-stable-stringify/-/json-stable-stringify-1.0.1.tgz#9a759d39c5f2ff503fd5300646ed445f88c4f9af"
```
```diff
@@ -1511,11 +2347,34 @@
 ┊1511┊2347┊  dependencies:
 ┊1512┊2348┊    jsonify "~0.0.0"
 ┊1513┊2349┊
+┊    ┊2350┊json-stringify-safe@~5.0.1:
+┊    ┊2351┊  version "5.0.1"
+┊    ┊2352┊  resolved "https://registry.yarnpkg.com/json-stringify-safe/-/json-stringify-safe-5.0.1.tgz#1296a2d58fd45f19a0f6ce01d65701e2c735b6eb"
+┊    ┊2353┊  integrity sha1-Epai1Y/UXxmg9s4B1lcB4sc1tus=
+┊    ┊2354┊
+┊    ┊2355┊json-to-pretty-yaml@1.2.2:
+┊    ┊2356┊  version "1.2.2"
+┊    ┊2357┊  resolved "https://registry.yarnpkg.com/json-to-pretty-yaml/-/json-to-pretty-yaml-1.2.2.tgz#f4cd0bd0a5e8fe1df25aaf5ba118b099fd992d5b"
+┊    ┊2358┊  integrity sha1-9M0L0KXo/h3yWq9boRiwmf2ZLVs=
+┊    ┊2359┊  dependencies:
+┊    ┊2360┊    remedial "^1.0.7"
+┊    ┊2361┊    remove-trailing-spaces "^1.0.6"
+┊    ┊2362┊
 ┊1514┊2363┊jsonify@~0.0.0:
 ┊1515┊2364┊  version "0.0.0"
 ┊1516┊2365┊  resolved "https://registry.yarnpkg.com/jsonify/-/jsonify-0.0.0.tgz#2c74b6ee41d93ca51b7b5aaee8f503631d252a73"
 ┊1517┊2366┊  integrity sha1-LHS27kHZPKUbe1qu6PUDYx0lKnM=
 ┊1518┊2367┊
+┊    ┊2368┊jsprim@^1.2.2:
+┊    ┊2369┊  version "1.4.1"
+┊    ┊2370┊  resolved "https://registry.yarnpkg.com/jsprim/-/jsprim-1.4.1.tgz#313e66bc1e5cc06e438bc1b7499c2e5c56acb6a2"
+┊    ┊2371┊  integrity sha1-MT5mvB5cwG5Di8G3SZwuXFastqI=
+┊    ┊2372┊  dependencies:
+┊    ┊2373┊    assert-plus "1.0.0"
+┊    ┊2374┊    extsprintf "1.3.0"
+┊    ┊2375┊    json-schema "0.2.3"
+┊    ┊2376┊    verror "1.10.0"
+┊    ┊2377┊
 ┊1519┊2378┊kind-of@^3.0.2, kind-of@^3.0.3, kind-of@^3.2.0:
 ┊1520┊2379┊  version "3.2.2"
 ┊1521┊2380┊  resolved "https://registry.yarnpkg.com/kind-of/-/kind-of-3.2.2.tgz#31ea21a734bab9bbb0f32466d893aea51e4a3c64"
```
```diff
@@ -1540,6 +2399,13 @@
 ┊1540┊2399┊  resolved "https://registry.yarnpkg.com/kind-of/-/kind-of-6.0.2.tgz#01146b36a6218e64e58f3a8d66de5d7fc6f6d051"
 ┊1541┊2400┊  integrity sha512-s5kLOcnH0XqDO+FvuaLX8DDjZ18CGFk7VygH40QoKPUQhW4e2rvM0rwUq0t8IQDOwYSeLK01U90OjzBTme2QqA==
 ┊1542┊2401┊
+┊    ┊2402┊kuler@1.0.x:
+┊    ┊2403┊  version "1.0.1"
+┊    ┊2404┊  resolved "https://registry.yarnpkg.com/kuler/-/kuler-1.0.1.tgz#ef7c784f36c9fb6e16dd3150d152677b2b0228a6"
+┊    ┊2405┊  integrity sha512-J9nVUucG1p/skKul6DU3PUZrhs0LPulNaeUOox0IyXDi8S4CztTHs1gQphhuZmzXG7VOQSf6NJfKuzteQLv9gQ==
+┊    ┊2406┊  dependencies:
+┊    ┊2407┊    colornames "^1.1.1"
+┊    ┊2408┊
 ┊1543┊2409┊latest-version@^3.0.0:
 ┊1544┊2410┊  version "3.1.0"
 ┊1545┊2411┊  resolved "https://registry.yarnpkg.com/latest-version/-/latest-version-3.1.0.tgz#a205383fea322b33b5ae3b18abee0dc2f356ee15"
```
```diff
@@ -1547,21 +2413,111 @@
 ┊1547┊2413┊  dependencies:
 ┊1548┊2414┊    package-json "^4.0.0"
 ┊1549┊2415┊
+┊    ┊2416┊listr-silent-renderer@^1.1.1:
+┊    ┊2417┊  version "1.1.1"
+┊    ┊2418┊  resolved "https://registry.yarnpkg.com/listr-silent-renderer/-/listr-silent-renderer-1.1.1.tgz#924b5a3757153770bf1a8e3fbf74b8bbf3f9242e"
+┊    ┊2419┊  integrity sha1-kktaN1cVN3C/Go4/v3S4u/P5JC4=
+┊    ┊2420┊
+┊    ┊2421┊listr-update-renderer@^0.5.0:
+┊    ┊2422┊  version "0.5.0"
+┊    ┊2423┊  resolved "https://registry.yarnpkg.com/listr-update-renderer/-/listr-update-renderer-0.5.0.tgz#4ea8368548a7b8aecb7e06d8c95cb45ae2ede6a2"
+┊    ┊2424┊  integrity sha512-tKRsZpKz8GSGqoI/+caPmfrypiaq+OQCbd+CovEC24uk1h952lVj5sC7SqyFUm+OaJ5HN/a1YLt5cit2FMNsFA==
+┊    ┊2425┊  dependencies:
+┊    ┊2426┊    chalk "^1.1.3"
+┊    ┊2427┊    cli-truncate "^0.2.1"
+┊    ┊2428┊    elegant-spinner "^1.0.1"
+┊    ┊2429┊    figures "^1.7.0"
+┊    ┊2430┊    indent-string "^3.0.0"
+┊    ┊2431┊    log-symbols "^1.0.2"
+┊    ┊2432┊    log-update "^2.3.0"
+┊    ┊2433┊    strip-ansi "^3.0.1"
+┊    ┊2434┊
+┊    ┊2435┊listr-verbose-renderer@^0.5.0:
+┊    ┊2436┊  version "0.5.0"
+┊    ┊2437┊  resolved "https://registry.yarnpkg.com/listr-verbose-renderer/-/listr-verbose-renderer-0.5.0.tgz#f1132167535ea4c1261102b9f28dac7cba1e03db"
+┊    ┊2438┊  integrity sha512-04PDPqSlsqIOaaaGZ+41vq5FejI9auqTInicFRndCBgE3bXG8D6W1I+mWhk+1nqbHmyhla/6BUrd5OSiHwKRXw==
+┊    ┊2439┊  dependencies:
+┊    ┊2440┊    chalk "^2.4.1"
+┊    ┊2441┊    cli-cursor "^2.1.0"
+┊    ┊2442┊    date-fns "^1.27.2"
+┊    ┊2443┊    figures "^2.0.0"
+┊    ┊2444┊
+┊    ┊2445┊listr@0.14.3:
+┊    ┊2446┊  version "0.14.3"
+┊    ┊2447┊  resolved "https://registry.yarnpkg.com/listr/-/listr-0.14.3.tgz#2fea909604e434be464c50bddba0d496928fa586"
+┊    ┊2448┊  integrity sha512-RmAl7su35BFd/xoMamRjpIE4j3v+L28o8CT5YhAXQJm1fD+1l9ngXY8JAQRJ+tFK2i5njvi0iRUKV09vPwA0iA==
+┊    ┊2449┊  dependencies:
+┊    ┊2450┊    "@samverschueren/stream-to-observable" "^0.3.0"
+┊    ┊2451┊    is-observable "^1.1.0"
+┊    ┊2452┊    is-promise "^2.1.0"
+┊    ┊2453┊    is-stream "^1.1.0"
+┊    ┊2454┊    listr-silent-renderer "^1.1.1"
+┊    ┊2455┊    listr-update-renderer "^0.5.0"
+┊    ┊2456┊    listr-verbose-renderer "^0.5.0"
+┊    ┊2457┊    p-map "^2.0.0"
+┊    ┊2458┊    rxjs "^6.3.3"
+┊    ┊2459┊
 ┊1550┊2460┊lodash.debounce@^4.0.8:
 ┊1551┊2461┊  version "4.0.8"
 ┊1552┊2462┊  resolved "https://registry.yarnpkg.com/lodash.debounce/-/lodash.debounce-4.0.8.tgz#82d79bff30a67c4005ffd5e2515300ad9ca4d7af"
 ┊1553┊2463┊  integrity sha1-gteb/zCmfEAF/9XiUVMArZyk168=
 ┊1554┊2464┊
-┊1555┊    ┊lodash@^4.17.10:
+┊    ┊2465┊lodash@^4.17.10, lodash@^4.17.4, lodash@^4.2.0:
 ┊1556┊2466┊  version "4.17.11"
 ┊1557┊2467┊  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.11.tgz#b39ea6229ef607ecd89e2c8df12536891cac9b8d"
 ┊1558┊2468┊  integrity sha512-cQKh8igo5QUhZ7lg38DYWAxMvjSAKG0A8wGSVimP07SIUEK2UO+arSRKbRZWtelMtN5V0Hkwh5ryOto/SshYIg==
 ┊1559┊2469┊
+┊    ┊2470┊log-symbols@2.2.0:
+┊    ┊2471┊  version "2.2.0"
+┊    ┊2472┊  resolved "https://registry.yarnpkg.com/log-symbols/-/log-symbols-2.2.0.tgz#5740e1c5d6f0dfda4ad9323b5332107ef6b4c40a"
+┊    ┊2473┊  integrity sha512-VeIAFslyIerEJLXHziedo2basKbMKtTw3vfn5IzG0XTjhAVEJyNHnL2p7vc+wBDSdQuUpNw3M2u6xb9QsAY5Eg==
+┊    ┊2474┊  dependencies:
+┊    ┊2475┊    chalk "^2.0.1"
+┊    ┊2476┊
+┊    ┊2477┊log-symbols@^1.0.2:
+┊    ┊2478┊  version "1.0.2"
+┊    ┊2479┊  resolved "https://registry.yarnpkg.com/log-symbols/-/log-symbols-1.0.2.tgz#376ff7b58ea3086a0f09facc74617eca501e1a18"
+┊    ┊2480┊  integrity sha1-N2/3tY6jCGoPCfrMdGF+ylAeGhg=
+┊    ┊2481┊  dependencies:
+┊    ┊2482┊    chalk "^1.0.0"
+┊    ┊2483┊
+┊    ┊2484┊log-update@2.3.0, log-update@^2.3.0:
+┊    ┊2485┊  version "2.3.0"
+┊    ┊2486┊  resolved "https://registry.yarnpkg.com/log-update/-/log-update-2.3.0.tgz#88328fd7d1ce7938b29283746f0b1bc126b24708"
+┊    ┊2487┊  integrity sha1-iDKP19HOeTiykoN0bwsbwSayRwg=
+┊    ┊2488┊  dependencies:
+┊    ┊2489┊    ansi-escapes "^3.0.0"
+┊    ┊2490┊    cli-cursor "^2.0.0"
+┊    ┊2491┊    wrap-ansi "^3.0.1"
+┊    ┊2492┊
+┊    ┊2493┊logform@^1.9.1:
+┊    ┊2494┊  version "1.10.0"
+┊    ┊2495┊  resolved "https://registry.yarnpkg.com/logform/-/logform-1.10.0.tgz#c9d5598714c92b546e23f4e78147c40f1e02012e"
+┊    ┊2496┊  integrity sha512-em5ojIhU18fIMOw/333mD+ZLE2fis0EzXl1ZwHx4iQzmpQi6odNiY/t+ITNr33JZhT9/KEaH+UPIipr6a9EjWg==
+┊    ┊2497┊  dependencies:
+┊    ┊2498┊    colors "^1.2.1"
+┊    ┊2499┊    fast-safe-stringify "^2.0.4"
+┊    ┊2500┊    fecha "^2.3.3"
+┊    ┊2501┊    ms "^2.1.1"
+┊    ┊2502┊    triple-beam "^1.2.0"
+┊    ┊2503┊
 ┊1560┊2504┊long@^4.0.0:
 ┊1561┊2505┊  version "4.0.0"
 ┊1562┊2506┊  resolved "https://registry.yarnpkg.com/long/-/long-4.0.0.tgz#9a7b71cfb7d361a194ea555241c92f7468d5bf28"
 ┊1563┊2507┊  integrity sha512-XsP+KhQif4bjX1kbuSiySJFNAehNxgLb6hPRGJ9QsUr8ajHkuXGdrHmFUTUUXhDwVX2R5bY4JNZEwbUiMhV+MA==
 ┊1564┊2508┊
+┊    ┊2509┊lower-case-first@^1.0.0:
+┊    ┊2510┊  version "1.0.2"
+┊    ┊2511┊  resolved "https://registry.yarnpkg.com/lower-case-first/-/lower-case-first-1.0.2.tgz#e5da7c26f29a7073be02d52bac9980e5922adfa1"
+┊    ┊2512┊  integrity sha1-5dp8JvKacHO+AtUrrJmA5ZIq36E=
+┊    ┊2513┊  dependencies:
+┊    ┊2514┊    lower-case "^1.1.2"
+┊    ┊2515┊
+┊    ┊2516┊lower-case@^1.1.0, lower-case@^1.1.1, lower-case@^1.1.2:
+┊    ┊2517┊  version "1.1.4"
+┊    ┊2518┊  resolved "https://registry.yarnpkg.com/lower-case/-/lower-case-1.1.4.tgz#9a2cabd1b9e8e0ae993a4bf7d5875c39c42e8eac"
+┊    ┊2519┊  integrity sha1-miyr0bno4K6ZOkv31YdcOcQujqw=
+┊    ┊2520┊
 ┊1565┊2521┊lowercase-keys@^1.0.0:
 ┊1566┊2522┊  version "1.0.1"
 ┊1567┊2523┊  resolved "https://registry.yarnpkg.com/lowercase-keys/-/lowercase-keys-1.0.1.tgz#6f9e30b47084d971a7c820ff15a6c5167b74c26f"
```
```diff
@@ -1645,7 +2601,7 @@
 ┊1645┊2601┊  resolved "https://registry.yarnpkg.com/mime-db/-/mime-db-1.37.0.tgz#0b6a0ce6fdbe9576e25f1f2d2fde8830dc0ad0d8"
 ┊1646┊2602┊  integrity sha512-R3C4db6bgQhlIhPU48fUtdVmKnflq+hRdad7IyKhtFj06VPNVdk2RhiYL3UjQIlso8L+YxAtFkobT0VK+S/ybg==
 ┊1647┊2603┊
-┊1648┊    ┊mime-types@~2.1.18:
+┊    ┊2604┊mime-types@^2.1.12, mime-types@~2.1.18, mime-types@~2.1.19:
 ┊1649┊2605┊  version "2.1.21"
 ┊1650┊2606┊  resolved "https://registry.yarnpkg.com/mime-types/-/mime-types-2.1.21.tgz#28995aa1ecb770742fe6ae7e58f9181c744b3f96"
 ┊1651┊2607┊  integrity sha512-3iL6DbwpyLzjR3xHSFNFeb9Nz/M8WDkX33t1GFQnFOllWk8pOrh/LSrB5OXlnlW5P9LH73X6loW/eogc+F5lJg==
```
```diff
@@ -1657,6 +2613,11 @@
 ┊1657┊2613┊  resolved "https://registry.yarnpkg.com/mime/-/mime-1.4.1.tgz#121f9ebc49e3766f311a76e1fa1c8003c4b03aa6"
 ┊1658┊2614┊  integrity sha512-KI1+qOZu5DcW6wayYHSzR/tXKCDC5Om4s1z2QJjDULzLcmf3DvzS7oluY4HCTrc+9FiKmWUgeNLg7W3uIQvxtQ==
 ┊1659┊2615┊
+┊    ┊2616┊mimic-fn@^1.0.0:
+┊    ┊2617┊  version "1.2.0"
+┊    ┊2618┊  resolved "https://registry.yarnpkg.com/mimic-fn/-/mimic-fn-1.2.0.tgz#820c86a39334640e99516928bd03fca88057d022"
+┊    ┊2619┊  integrity sha512-jf84uxzwiuiIVKiOLpfYk7N46TSy8ubTonmneY9vrpHNAnp0QBt2BxWV9dO3/j+BoVAb+a5G6YDPW3M5HOdMWQ==
+┊    ┊2620┊
 ┊1660┊2621┊minimatch@^3.0.4:
 ┊1661┊2622┊  version "3.0.4"
 ┊1662┊2623┊  resolved "https://registry.yarnpkg.com/minimatch/-/minimatch-3.0.4.tgz#5166e286457f03306064be5497e8dbb0c3d32083"
```
```diff
@@ -1697,7 +2658,7 @@
 ┊1697┊2658┊    for-in "^1.0.2"
 ┊1698┊2659┊    is-extendable "^1.0.1"
 ┊1699┊2660┊
-┊1700┊    ┊mkdirp@^0.5.0, mkdirp@^0.5.1:
+┊    ┊2661┊mkdirp@0.5.1, mkdirp@^0.5.0, mkdirp@^0.5.1:
 ┊1701┊2662┊  version "0.5.1"
 ┊1702┊2663┊  resolved "https://registry.yarnpkg.com/mkdirp/-/mkdirp-0.5.1.tgz#30057438eac6cf7f8c4767f38648d6697d75c903"
 ┊1703┊2664┊  integrity sha1-MAV0OOrGz3+MR2fzhkjWaX11yQM=
```
```diff
@@ -1719,6 +2680,11 @@
 ┊1719┊2680┊  resolved "https://registry.yarnpkg.com/ms/-/ms-2.1.1.tgz#30a5864eb3ebb0a66f2ebe6d727af06a09d86e0a"
 ┊1720┊2681┊  integrity sha512-tgp+dl5cGk28utYktBsrFqA7HKgrhgPsg6Z/EfhWI4gl1Hwq8B/GmY/0oXZ6nF8hDVesS/FpnYaD/kOWhYQvyg==
 ┊1721┊2682┊
+┊    ┊2683┊mute-stream@0.0.7:
+┊    ┊2684┊  version "0.0.7"
+┊    ┊2685┊  resolved "https://registry.yarnpkg.com/mute-stream/-/mute-stream-0.0.7.tgz#3075ce93bc21b8fab43e1bc4da7e8115ed1e7bab"
+┊    ┊2686┊  integrity sha1-MHXOk7whuPq0PhvE2n6BFe0ee6s=
+┊    ┊2687┊
 ┊1722┊2688┊nan@^2.9.2:
 ┊1723┊2689┊  version "2.12.1"
 ┊1724┊2690┊  resolved "https://registry.yarnpkg.com/nan/-/nan-2.12.1.tgz#7b1aa193e9aa86057e3c7bbd0ac448e770925552"
```
```diff
@@ -1755,6 +2721,18 @@
 ┊1755┊2721┊  resolved "https://registry.yarnpkg.com/negotiator/-/negotiator-0.6.1.tgz#2b327184e8992101177b28563fb5e7102acd0ca9"
 ┊1756┊2722┊  integrity sha1-KzJxhOiZIQEXeyhWP7XnECrNDKk=
 ┊1757┊2723┊
+┊    ┊2724┊no-case@^2.2.0, no-case@^2.3.2:
+┊    ┊2725┊  version "2.3.2"
+┊    ┊2726┊  resolved "https://registry.yarnpkg.com/no-case/-/no-case-2.3.2.tgz#60b813396be39b3f1288a4c1ed5d1e7d28b464ac"
+┊    ┊2727┊  integrity sha512-rmTZ9kz+f3rCvK2TD1Ue/oZlns7OGoIWP4fc3llxxRXlOkHKoWPPWJOfFYpITabSow43QJbRIoHQXtt10VldyQ==
+┊    ┊2728┊  dependencies:
+┊    ┊2729┊    lower-case "^1.1.1"
+┊    ┊2730┊
+┊    ┊2731┊node-fetch@2.1.2:
+┊    ┊2732┊  version "2.1.2"
+┊    ┊2733┊  resolved "https://registry.yarnpkg.com/node-fetch/-/node-fetch-2.1.2.tgz#ab884e8e7e57e38a944753cec706f788d1768bb5"
+┊    ┊2734┊  integrity sha1-q4hOjn5X44qUR1POxwb3iNF2i7U=
+┊    ┊2735┊
 ┊1758┊2736┊node-fetch@^2.1.2, node-fetch@^2.2.0:
 ┊1759┊2737┊  version "2.3.0"
 ┊1760┊2738┊  resolved "https://registry.yarnpkg.com/node-fetch/-/node-fetch-2.3.0.tgz#1a1d940bbfb916a1d3e0219f037e89e71f8c5fa5"
```
```diff
@@ -1849,6 +2827,11 @@
 ┊1849┊2827┊  resolved "https://registry.yarnpkg.com/number-is-nan/-/number-is-nan-1.0.1.tgz#097b602b53422a522c1afb8790318336941a011d"
 ┊1850┊2828┊  integrity sha1-CXtgK1NCKlIsGvuHkDGDNpQaAR0=
 ┊1851┊2829┊
+┊    ┊2830┊oauth-sign@~0.9.0:
+┊    ┊2831┊  version "0.9.0"
+┊    ┊2832┊  resolved "https://registry.yarnpkg.com/oauth-sign/-/oauth-sign-0.9.0.tgz#47a7b016baa68b5fa0ecf3dee08a85c679ac6455"
+┊    ┊2833┊  integrity sha512-fexhUFFPTGV8ybAtSIGbV6gOkSv8UtRbDBnAyLQw4QPKkgNlsH2ByPGtMUqdWkos6YCRmAqViwgZrJc/mRDzZQ==
+┊    ┊2834┊
 ┊1852┊2835┊object-assign@^4, object-assign@^4.1.0:
 ┊1853┊2836┊  version "4.1.1"
 ┊1854┊2837┊  resolved "https://registry.yarnpkg.com/object-assign/-/object-assign-4.1.1.tgz#2109adc7965887cfc05cbbd442cac8bfbb360863"
```
```diff
@@ -1909,12 +2892,24 @@
 ┊1909┊2892┊  dependencies:
 ┊1910┊2893┊    wrappy "1"
 ┊1911┊2894┊
+┊    ┊2895┊one-time@0.0.4:
+┊    ┊2896┊  version "0.0.4"
+┊    ┊2897┊  resolved "https://registry.yarnpkg.com/one-time/-/one-time-0.0.4.tgz#f8cdf77884826fe4dff93e3a9cc37b1e4480742e"
+┊    ┊2898┊  integrity sha1-+M33eISCb+Tf+T46nMN7HkSAdC4=
+┊    ┊2899┊
+┊    ┊2900┊onetime@^2.0.0:
+┊    ┊2901┊  version "2.0.1"
+┊    ┊2902┊  resolved "https://registry.yarnpkg.com/onetime/-/onetime-2.0.1.tgz#067428230fd67443b2794b22bba528b6867962d4"
+┊    ┊2903┊  integrity sha1-BnQoIw/WdEOyeUsiu6UotoZ5YtQ=
+┊    ┊2904┊  dependencies:
+┊    ┊2905┊    mimic-fn "^1.0.0"
+┊    ┊2906┊
 ┊1912┊2907┊os-homedir@^1.0.0:
 ┊1913┊2908┊  version "1.0.2"
 ┊1914┊2909┊  resolved "https://registry.yarnpkg.com/os-homedir/-/os-homedir-1.0.2.tgz#ffbc4988336e0e833de0c168c7ef152121aa7fb3"
 ┊1915┊2910┊  integrity sha1-/7xJiDNuDoM94MFox+8VISGqf7M=
 ┊1916┊2911┊
-┊1917┊    ┊os-tmpdir@^1.0.0:
+┊    ┊2912┊os-tmpdir@^1.0.0, os-tmpdir@~1.0.2:
 ┊1918┊2913┊  version "1.0.2"
 ┊1919┊2914┊  resolved "https://registry.yarnpkg.com/os-tmpdir/-/os-tmpdir-1.0.2.tgz#bbe67406c79aa85c5cfec766fe5734555dfa1274"
 ┊1920┊2915┊  integrity sha1-u+Z0BseaqFxc/sdm/lc0VV36EnQ=
```
```diff
@@ -1932,6 +2927,11 @@
 ┊1932┊2927┊  resolved "https://registry.yarnpkg.com/p-finally/-/p-finally-1.0.0.tgz#3fbcfb15b899a44123b34b6dcc18b724336a2cae"
 ┊1933┊2928┊  integrity sha1-P7z7FbiZpEEjs0ttzBi3JDNqLK4=
 ┊1934┊2929┊
+┊    ┊2930┊p-map@^2.0.0:
+┊    ┊2931┊  version "2.0.0"
+┊    ┊2932┊  resolved "https://registry.yarnpkg.com/p-map/-/p-map-2.0.0.tgz#be18c5a5adeb8e156460651421aceca56c213a50"
+┊    ┊2933┊  integrity sha512-GO107XdrSUmtHxVoi60qc9tUl/KkNKm+X2CF4P9amalpGxv5YqVPJNfSb0wcA+syCopkZvYYIzW8OVTQW59x/w==
+┊    ┊2934┊
 ┊1935┊2935┊package-json@^4.0.0:
 ┊1936┊2936┊  version "4.0.1"
 ┊1937┊2937┊  resolved "https://registry.yarnpkg.com/package-json/-/package-json-4.0.1.tgz#8869a0401253661c4c4ca3da6c2121ed555f5eed"
```
```diff
@@ -1942,16 +2942,38 @@
 ┊1942┊2942┊    registry-url "^3.0.3"
 ┊1943┊2943┊    semver "^5.1.0"
 ┊1944┊2944┊
+┊    ┊2945┊param-case@^2.1.0:
+┊    ┊2946┊  version "2.1.1"
+┊    ┊2947┊  resolved "https://registry.yarnpkg.com/param-case/-/param-case-2.1.1.tgz#df94fd8cf6531ecf75e6bef9a0858fbc72be2247"
+┊    ┊2948┊  integrity sha1-35T9jPZTHs915r75oIWPvHK+Ikc=
+┊    ┊2949┊  dependencies:
+┊    ┊2950┊    no-case "^2.2.0"
+┊    ┊2951┊
 ┊1945┊2952┊parseurl@~1.3.2:
 ┊1946┊2953┊  version "1.3.2"
 ┊1947┊2954┊  resolved "https://registry.yarnpkg.com/parseurl/-/parseurl-1.3.2.tgz#fc289d4ed8993119460c156253262cdc8de65bf3"
 ┊1948┊2955┊  integrity sha1-/CidTtiZMRlGDBViUyYs3I3mW/M=
 ┊1949┊2956┊
+┊    ┊2957┊pascal-case@^2.0.0:
+┊    ┊2958┊  version "2.0.1"
+┊    ┊2959┊  resolved "https://registry.yarnpkg.com/pascal-case/-/pascal-case-2.0.1.tgz#2d578d3455f660da65eca18ef95b4e0de912761e"
+┊    ┊2960┊  integrity sha1-LVeNNFX2YNpl7KGO+VtODekSdh4=
+┊    ┊2961┊  dependencies:
+┊    ┊2962┊    camel-case "^3.0.0"
+┊    ┊2963┊    upper-case-first "^1.1.0"
+┊    ┊2964┊
 ┊1950┊2965┊pascalcase@^0.1.1:
 ┊1951┊2966┊  version "0.1.1"
 ┊1952┊2967┊  resolved "https://registry.yarnpkg.com/pascalcase/-/pascalcase-0.1.1.tgz#b363e55e8006ca6fe21784d2db22bd15d7917f14"
 ┊1953┊2968┊  integrity sha1-s2PlXoAGym/iF4TS2yK9FdeRfxQ=
 ┊1954┊2969┊
+┊    ┊2970┊path-case@^2.1.0:
+┊    ┊2971┊  version "2.1.1"
+┊    ┊2972┊  resolved "https://registry.yarnpkg.com/path-case/-/path-case-2.1.1.tgz#94b8037c372d3fe2906e465bb45e25d226e8eea5"
+┊    ┊2973┊  integrity sha1-lLgDfDctP+KQbkZbtF4l0ibo7qU=
+┊    ┊2974┊  dependencies:
+┊    ┊2975┊    no-case "^2.2.0"
+┊    ┊2976┊
 ┊1955┊2977┊path-dirname@^1.0.0:
 ┊1956┊2978┊  version "1.0.2"
 ┊1957┊2979┊  resolved "https://registry.yarnpkg.com/path-dirname/-/path-dirname-1.0.2.tgz#cc33d24d525e099a5388c0336c6e32b9160609e0"
```
```diff
@@ -1977,6 +2999,11 @@
 ┊1977┊2999┊  resolved "https://registry.yarnpkg.com/path-to-regexp/-/path-to-regexp-0.1.7.tgz#df604178005f522f15eb4490e7247a1bfaa67f8c"
 ┊1978┊3000┊  integrity sha1-32BBeABfUi8V60SQ5yR6G/qmf4w=
 ┊1979┊3001┊
+┊    ┊3002┊performance-now@^2.1.0:
+┊    ┊3003┊  version "2.1.0"
+┊    ┊3004┊  resolved "https://registry.yarnpkg.com/performance-now/-/performance-now-2.1.0.tgz#6309f4e0e5fa913ec1c69307ae364b4b377c9e7b"
+┊    ┊3005┊  integrity sha1-Ywn04OX6kT7BxpMHrjZLSzd8nns=
+┊    ┊3006┊
 ┊1980┊3007┊pify@^3.0.0:
 ┊1981┊3008┊  version "3.0.0"
 ┊1982┊3009┊  resolved "https://registry.yarnpkg.com/pify/-/pify-3.0.0.tgz#e5a4acd2c101fdf3d9a4d07f0dbc4db49dd28176"
```
```diff
@@ -1992,6 +3019,11 @@
 ┊1992┊3019┊  resolved "https://registry.yarnpkg.com/prepend-http/-/prepend-http-1.0.4.tgz#d4f4562b0ce3696e41ac52d0e002e57a635dc6dc"
 ┊1993┊3020┊  integrity sha1-1PRWKwzjaW5BrFLQ4ALlemNdxtw=
 ┊1994┊3021┊
+┊    ┊3022┊prettier@1.15.3:
+┊    ┊3023┊  version "1.15.3"
+┊    ┊3024┊  resolved "https://registry.yarnpkg.com/prettier/-/prettier-1.15.3.tgz#1feaac5bdd181237b54dbe65d874e02a1472786a"
+┊    ┊3025┊  integrity sha512-gAU9AGAPMaKb3NNSUUuhhFAS7SCO4ALTN4nRIn6PJ075Qd28Yn2Ig2ahEJWdJwJmlEBTUfC7mMUSFy8MwsOCfg==
+┊    ┊3026┊
 ┊1995┊3027┊process-nextick-args@~2.0.0:
 ┊1996┊3028┊  version "2.0.0"
 ┊1997┊3029┊  resolved "https://registry.yarnpkg.com/process-nextick-args/-/process-nextick-args-2.0.0.tgz#a37d732f4271b4ab1ad070d35508e8290788ffaa"
```
```diff
@@ -2029,12 +3061,27 @@
 ┊2029┊3061┊  resolved "https://registry.yarnpkg.com/pseudomap/-/pseudomap-1.0.2.tgz#f052a28da70e618917ef0a8ac34c1ae5a68286b3"
 ┊2030┊3062┊  integrity sha1-8FKijacOYYkX7wqKw0wa5aaChrM=
 ┊2031┊3063┊
+┊    ┊3064┊psl@^1.1.24:
+┊    ┊3065┊  version "1.1.31"
+┊    ┊3066┊  resolved "https://registry.yarnpkg.com/psl/-/psl-1.1.31.tgz#e9aa86d0101b5b105cbe93ac6b784cd547276184"
+┊    ┊3067┊  integrity sha512-/6pt4+C+T+wZUieKR620OpzN/LlnNKuWjy1iFLQ/UG35JqHlR/89MP1d96dUfkf6Dne3TuLQzOYEYshJ+Hx8mw==
+┊    ┊3068┊
 ┊2032┊3069┊pstree.remy@^1.1.6:
 ┊2033┊3070┊  version "1.1.6"
 ┊2034┊3071┊  resolved "https://registry.yarnpkg.com/pstree.remy/-/pstree.remy-1.1.6.tgz#73a55aad9e2d95814927131fbf4dc1b62d259f47"
 ┊2035┊3072┊  integrity sha512-NdF35+QsqD7EgNEI5mkI/X+UwaxVEbQaz9f4IooEmMUv6ZPmlTQYGjBPJGgrlzNdjSvIy4MWMg6Q6vCgBO2K+w==
 ┊2036┊3073┊
-┊2037┊    ┊qs@6.5.2:
+┊    ┊3074┊punycode@^1.4.1:
+┊    ┊3075┊  version "1.4.1"
+┊    ┊3076┊  resolved "https://registry.yarnpkg.com/punycode/-/punycode-1.4.1.tgz#c0d5a63b2718800ad8e1eb0fa5269c84dd41845e"
+┊    ┊3077┊  integrity sha1-wNWmOycYgArY4esPpSachN1BhF4=
+┊    ┊3078┊
+┊    ┊3079┊punycode@^2.1.0:
+┊    ┊3080┊  version "2.1.1"
+┊    ┊3081┊  resolved "https://registry.yarnpkg.com/punycode/-/punycode-2.1.1.tgz#b58b010ac40c22c5657616c8d2c2c02c7bf479ec"
+┊    ┊3082┊  integrity sha512-XRsRjdf+j5ml+y/6GKHPZbrF/8p2Yga0JPtdqTIY2Xe5ohJPD9saDJJLPvp9+NSBprVvevdXZybnj2cv8OEd0A==
+┊    ┊3083┊
+┊    ┊3084┊qs@6.5.2, qs@~6.5.2:
 ┊2038┊3085┊  version "6.5.2"
 ┊2039┊3086┊  resolved "https://registry.yarnpkg.com/qs/-/qs-6.5.2.tgz#cb3ae806e8740444584ef154ce8ee98d403f3e36"
 ┊2040┊3087┊  integrity sha512-N5ZAX4/LxJmF+7wN74pUD6qAh9/wnvdQcjq9TZjevvXzSUo7bfmw91saqMjzGS2xq91/odN2dW/WOl7qQHNDGA==
```
```diff
@@ -2064,7 +3111,7 @@
 ┊2064┊3111┊    minimist "^1.2.0"
 ┊2065┊3112┊    strip-json-comments "~2.0.1"
 ┊2066┊3113┊
-┊2067┊    ┊readable-stream@^2.0.2, readable-stream@^2.0.6:
+┊    ┊3114┊readable-stream@^2.0.2, readable-stream@^2.0.6, readable-stream@^2.3.6:
 ┊2068┊3115┊  version "2.3.6"
 ┊2069┊3116┊  resolved "https://registry.yarnpkg.com/readable-stream/-/readable-stream-2.3.6.tgz#b11c27d88b8ff1fbe070643cf94b0c79ae1b0aaf"
 ┊2070┊3117┊  integrity sha512-tQtKA9WIAhBF3+VLAseyMqZeBjW0AHJoxOtYqSUZNJxauErmLbVm2FW1y+J/YA9dUrAC39ITejlZWhVIwawkKw==
```
```diff
@@ -2109,11 +3156,21 @@
 ┊2109┊3156┊  dependencies:
 ┊2110┊3157┊    rc "^1.0.1"
 ┊2111┊3158┊
+┊    ┊3159┊remedial@^1.0.7:
+┊    ┊3160┊  version "1.0.8"
+┊    ┊3161┊  resolved "https://registry.yarnpkg.com/remedial/-/remedial-1.0.8.tgz#a5e4fd52a0e4956adbaf62da63a5a46a78c578a0"
+┊    ┊3162┊  integrity sha512-/62tYiOe6DzS5BqVsNpH/nkGlX45C/Sp6V+NtiN6JQNS1Viay7cWkazmRkrQrdFj2eshDe96SIQNIoMxqhzBOg==
+┊    ┊3163┊
 ┊2112┊3164┊remove-trailing-separator@^1.0.1:
 ┊2113┊3165┊  version "1.1.0"
 ┊2114┊3166┊  resolved "https://registry.yarnpkg.com/remove-trailing-separator/-/remove-trailing-separator-1.1.0.tgz#c24bce2a283adad5bc3f58e0d48249b92379d8ef"
 ┊2115┊3167┊  integrity sha1-wkvOKig62tW8P1jg1IJJuSN52O8=
 ┊2116┊3168┊
+┊    ┊3169┊remove-trailing-spaces@^1.0.6:
+┊    ┊3170┊  version "1.0.7"
+┊    ┊3171┊  resolved "https://registry.yarnpkg.com/remove-trailing-spaces/-/remove-trailing-spaces-1.0.7.tgz#491f04e11d98880714d12429b0d0938cbe030ae6"
+┊    ┊3172┊  integrity sha512-wjM17CJ2kk0SgoGyJ7ZMzRRCuTq+V8YhMwpZ5XEWX0uaked2OUq6utvHXGNBQrfkUzUUABFMyxlKn+85hMv4dg==
+┊    ┊3173┊
 ┊2117┊3174┊repeat-element@^1.1.2:
 ┊2118┊3175┊  version "1.1.3"
 ┊2119┊3176┊  resolved "https://registry.yarnpkg.com/repeat-element/-/repeat-element-1.1.3.tgz#782e0d825c0c5a3bb39731f84efee6b742e6b1ce"
```
```diff
@@ -2124,11 +3181,55 @@
 ┊2124┊3181┊  resolved "https://registry.yarnpkg.com/repeat-string/-/repeat-string-1.6.1.tgz#8dcae470e1c88abc2d600fff4a776286da75e637"
 ┊2125┊3182┊  integrity sha1-jcrkcOHIirwtYA//Sndihtp15jc=
 ┊2126┊3183┊
+┊    ┊3184┊request@2.88.0:
+┊    ┊3185┊  version "2.88.0"
+┊    ┊3186┊  resolved "https://registry.yarnpkg.com/request/-/request-2.88.0.tgz#9c2fca4f7d35b592efe57c7f0a55e81052124fef"
+┊    ┊3187┊  integrity sha512-NAqBSrijGLZdM0WZNsInLJpkJokL72XYjUpnB0iwsRgxh7dB6COrHnTBNwN0E+lHDAJzu7kLAkDeY08z2/A0hg==
+┊    ┊3188┊  dependencies:
+┊    ┊3189┊    aws-sign2 "~0.7.0"
+┊    ┊3190┊    aws4 "^1.8.0"
+┊    ┊3191┊    caseless "~0.12.0"
+┊    ┊3192┊    combined-stream "~1.0.6"
+┊    ┊3193┊    extend "~3.0.2"
+┊    ┊3194┊    forever-agent "~0.6.1"
+┊    ┊3195┊    form-data "~2.3.2"
+┊    ┊3196┊    har-validator "~5.1.0"
+┊    ┊3197┊    http-signature "~1.2.0"
+┊    ┊3198┊    is-typedarray "~1.0.0"
+┊    ┊3199┊    isstream "~0.1.2"
+┊    ┊3200┊    json-stringify-safe "~5.0.1"
+┊    ┊3201┊    mime-types "~2.1.19"
+┊    ┊3202┊    oauth-sign "~0.9.0"
+┊    ┊3203┊    performance-now "^2.1.0"
+┊    ┊3204┊    qs "~6.5.2"
+┊    ┊3205┊    safe-buffer "^5.1.2"
+┊    ┊3206┊    tough-cookie "~2.4.3"
+┊    ┊3207┊    tunnel-agent "^0.6.0"
+┊    ┊3208┊    uuid "^3.3.2"
+┊    ┊3209┊
+┊    ┊3210┊resolve-from@^3.0.0:
+┊    ┊3211┊  version "3.0.0"
+┊    ┊3212┊  resolved "https://registry.yarnpkg.com/resolve-from/-/resolve-from-3.0.0.tgz#b22c7af7d9d6881bc8b6e653335eebcb0a188748"
+┊    ┊3213┊  integrity sha1-six699nWiBvItuZTM17rywoYh0g=
+┊    ┊3214┊
+┊    ┊3215┊resolve-from@^4.0.0:
+┊    ┊3216┊  version "4.0.0"
+┊    ┊3217┊  resolved "https://registry.yarnpkg.com/resolve-from/-/resolve-from-4.0.0.tgz#4abcd852ad32dd7baabfe9b40e00a36db5f392e6"
+┊    ┊3218┊  integrity sha512-pb/MYmXstAkysRFx8piNI1tGFNQIFA3vkE3Gq4EuA1dF6gHp/+vgZqsCGJapvy8N3Q+4o7FwvquPJcnZ7RYy4g==
+┊    ┊3219┊
 ┊2127┊3220┊resolve-url@^0.2.1:
 ┊2128┊3221┊  version "0.2.1"
 ┊2129┊3222┊  resolved "https://registry.yarnpkg.com/resolve-url/-/resolve-url-0.2.1.tgz#2c637fe77c893afd2a663fe21aa9080068e2052a"
 ┊2130┊3223┊  integrity sha1-LGN/53yJOv0qZj/iGqkIAGjiBSo=
 ┊2131┊3224┊
+┊    ┊3225┊restore-cursor@^2.0.0:
+┊    ┊3226┊  version "2.0.0"
+┊    ┊3227┊  resolved "https://registry.yarnpkg.com/restore-cursor/-/restore-cursor-2.0.0.tgz#9f7ee287f82fd326d4fd162923d62129eee0dfaf"
+┊    ┊3228┊  integrity sha1-n37ih/gv0ybU/RYpI9YhKe7g368=
+┊    ┊3229┊  dependencies:
+┊    ┊3230┊    onetime "^2.0.0"
+┊    ┊3231┊    signal-exit "^3.0.2"
+┊    ┊3232┊
 ┊2132┊3233┊ret@~0.1.10:
 ┊2133┊3234┊  version "0.1.15"
 ┊2134┊3235┊  resolved "https://registry.yarnpkg.com/ret/-/ret-0.1.15.tgz#b8a4825d5bdb1fc3f6f53c2bc33f81388681c7bc"
```
```diff
@@ -2146,6 +3247,20 @@
 ┊2146┊3247┊  dependencies:
 ┊2147┊3248┊    glob "^7.1.3"
 ┊2148┊3249┊
+┊    ┊3250┊run-async@^2.2.0:
+┊    ┊3251┊  version "2.3.0"
+┊    ┊3252┊  resolved "https://registry.yarnpkg.com/run-async/-/run-async-2.3.0.tgz#0371ab4ae0bdd720d4166d7dfda64ff7a445a6c0"
+┊    ┊3253┊  integrity sha1-A3GrSuC91yDUFm19/aZP96RFpsA=
+┊    ┊3254┊  dependencies:
+┊    ┊3255┊    is-promise "^2.1.0"
+┊    ┊3256┊
+┊    ┊3257┊rxjs@^6.1.0, rxjs@^6.3.3:
+┊    ┊3258┊  version "6.3.3"
+┊    ┊3259┊  resolved "https://registry.yarnpkg.com/rxjs/-/rxjs-6.3.3.tgz#3c6a7fa420e844a81390fb1158a9ec614f4bad55"
+┊    ┊3260┊  integrity sha512-JTWmoY9tWCs7zvIk/CvRjhjGaOd+OVBM987mxFo+OW66cGpdKjZcpmc74ES1sB//7Kl/PAe8+wEakuhG4pcgOw==
+┊    ┊3261┊  dependencies:
+┊    ┊3262┊    tslib "^1.9.0"
+┊    ┊3263┊
 ┊2149┊3264┊safe-buffer@5.1.2, safe-buffer@^5.0.1, safe-buffer@^5.1.2, safe-buffer@~5.1.0, safe-buffer@~5.1.1:
 ┊2150┊3265┊  version "5.1.2"
 ┊2151┊3266┊  resolved "https://registry.yarnpkg.com/safe-buffer/-/safe-buffer-5.1.2.tgz#991ec69d296e0313747d59bdfd2b745c35f8828d"
```
```diff
@@ -2158,7 +3273,7 @@
 ┊2158┊3273┊  dependencies:
 ┊2159┊3274┊    ret "~0.1.10"
 ┊2160┊3275┊
-┊2161┊    ┊"safer-buffer@>= 2.1.2 < 3":
+┊    ┊3276┊"safer-buffer@>= 2.1.2 < 3", safer-buffer@^2.0.2, safer-buffer@^2.1.0, safer-buffer@~2.1.0:
 ┊2162┊3277┊  version "2.1.2"
 ┊2163┊3278┊  resolved "https://registry.yarnpkg.com/safer-buffer/-/safer-buffer-2.1.2.tgz#44fa161b0187b9549dd84bb91802f9bd8385cd6a"
 ┊2164┊3279┊  integrity sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==
```
```diff
@@ -2199,6 +3314,14 @@
 ┊2199┊3314┊    range-parser "~1.2.0"
 ┊2200┊3315┊    statuses "~1.4.0"
 ┊2201┊3316┊
+┊    ┊3317┊sentence-case@^2.1.0:
+┊    ┊3318┊  version "2.1.1"
+┊    ┊3319┊  resolved "https://registry.yarnpkg.com/sentence-case/-/sentence-case-2.1.1.tgz#1f6e2dda39c168bf92d13f86d4a918933f667ed4"
+┊    ┊3320┊  integrity sha1-H24t2jnBaL+S0T+G1KkYkz9mftQ=
+┊    ┊3321┊  dependencies:
+┊    ┊3322┊    no-case "^2.2.0"
+┊    ┊3323┊    upper-case-first "^1.1.2"
+┊    ┊3324┊
 ┊2202┊3325┊serve-static@1.13.2:
 ┊2203┊3326┊  version "1.13.2"
 ┊2204┊3327┊  resolved "https://registry.yarnpkg.com/serve-static/-/serve-static-1.13.2.tgz#095e8472fd5b46237db50ce486a43f4b86c6cec1"
```
```diff
@@ -2256,6 +3379,25 @@
 ┊2256┊3379┊  resolved "https://registry.yarnpkg.com/signal-exit/-/signal-exit-3.0.2.tgz#b5fdc08f1287ea1178628e415e25132b73646c6d"
 ┊2257┊3380┊  integrity sha1-tf3AjxKH6hF4Yo5BXiUTK3NkbG0=
 ┊2258┊3381┊
+┊    ┊3382┊simple-swizzle@^0.2.2:
+┊    ┊3383┊  version "0.2.2"
+┊    ┊3384┊  resolved "https://registry.yarnpkg.com/simple-swizzle/-/simple-swizzle-0.2.2.tgz#a4da6b635ffcccca33f70d17cb92592de95e557a"
+┊    ┊3385┊  integrity sha1-pNprY1/8zMoz9w0Xy5JZLeleVXo=
+┊    ┊3386┊  dependencies:
+┊    ┊3387┊    is-arrayish "^0.3.1"
+┊    ┊3388┊
+┊    ┊3389┊slice-ansi@0.0.4:
+┊    ┊3390┊  version "0.0.4"
+┊    ┊3391┊  resolved "https://registry.yarnpkg.com/slice-ansi/-/slice-ansi-0.0.4.tgz#edbf8903f66f7ce2f8eafd6ceed65e264c831b35"
+┊    ┊3392┊  integrity sha1-7b+JA/ZvfOL46v1s7tZeJkyDGzU=
+┊    ┊3393┊
+┊    ┊3394┊snake-case@^2.1.0:
+┊    ┊3395┊  version "2.1.0"
+┊    ┊3396┊  resolved "https://registry.yarnpkg.com/snake-case/-/snake-case-2.1.0.tgz#41bdb1b73f30ec66a04d4e2cad1b76387d4d6d9f"
+┊    ┊3397┊  integrity sha1-Qb2xtz8w7GagTU4srRt2OH1NbZ8=
+┊    ┊3398┊  dependencies:
+┊    ┊3399┊    no-case "^2.2.0"
+┊    ┊3400┊
 ┊2259┊3401┊snapdragon-node@^2.0.1:
 ┊2260┊3402┊  version "2.1.1"
 ┊2261┊3403┊  resolved "https://registry.yarnpkg.com/snapdragon-node/-/snapdragon-node-2.1.1.tgz#6c175f86ff14bdb0724563e8f3c1b021a286853b"
```
```diff
@@ -2297,7 +3439,7 @@
 ┊2297┊3439┊    source-map-url "^0.4.0"
 ┊2298┊3440┊    urix "^0.1.0"
 ┊2299┊3441┊
-┊2300┊    ┊source-map-support@^0.5.6:
+┊    ┊3442┊source-map-support@^0.5.6, source-map-support@^0.5.9:
 ┊2301┊3443┊  version "0.5.10"
 ┊2302┊3444┊  resolved "https://registry.yarnpkg.com/source-map-support/-/source-map-support-0.5.10.tgz#2214080bc9d51832511ee2bab96e3c2f9353120c"
 ┊2303┊3445┊  integrity sha512-YfQ3tQFTK/yzlGJuX8pTwa4tifQj4QS2Mj7UegOu8jAz59MqIiMGPXxQhVQiIMNzayuUSF/jEuVnfFF5JqybmQ==
```
```diff
@@ -2310,7 +3452,7 @@
 ┊2310┊3452┊  resolved "https://registry.yarnpkg.com/source-map-url/-/source-map-url-0.4.0.tgz#3e935d7ddd73631b97659956d55128e87b5084a3"
 ┊2311┊3453┊  integrity sha1-PpNdfd1zYxuXZZlW1VEo6HtQhKM=
 ┊2312┊3454┊
-┊2313┊    ┊source-map@^0.5.6:
+┊    ┊3455┊source-map@^0.5.0, source-map@^0.5.6:
 ┊2314┊3456┊  version "0.5.7"
 ┊2315┊3457┊  resolved "https://registry.yarnpkg.com/source-map/-/source-map-0.5.7.tgz#8a039d2d1021d22d1ea14c80d8ea468ba2ef3fcc"
 ┊2316┊3458┊  integrity sha1-igOdLRAh0i0eoUyA2OpGi6LvP8w=
```
```diff
@@ -2327,6 +3469,31 @@
 ┊2327┊3469┊  dependencies:
 ┊2328┊3470┊    extend-shallow "^3.0.0"
 ┊2329┊3471┊
+┊    ┊3472┊sprintf-js@~1.0.2:
+┊    ┊3473┊  version "1.0.3"
+┊    ┊3474┊  resolved "https://registry.yarnpkg.com/sprintf-js/-/sprintf-js-1.0.3.tgz#04e6926f662895354f3dd015203633b857297e2c"
+┊    ┊3475┊  integrity sha1-BOaSb2YolTVPPdAVIDYzuFcpfiw=
+┊    ┊3476┊
+┊    ┊3477┊sshpk@^1.7.0:
+┊    ┊3478┊  version "1.16.0"
+┊    ┊3479┊  resolved "https://registry.yarnpkg.com/sshpk/-/sshpk-1.16.0.tgz#1d4963a2fbffe58050aa9084ca20be81741c07de"
+┊    ┊3480┊  integrity sha512-Zhev35/y7hRMcID/upReIvRse+I9SVhyVre/KTJSJQWMz3C3+G+HpO7m1wK/yckEtujKZ7dS4hkVxAnmHaIGVQ==
+┊    ┊3481┊  dependencies:
+┊    ┊3482┊    asn1 "~0.2.3"
+┊    ┊3483┊    assert-plus "^1.0.0"
+┊    ┊3484┊    bcrypt-pbkdf "^1.0.0"
+┊    ┊3485┊    dashdash "^1.12.0"
+┊    ┊3486┊    ecc-jsbn "~0.1.1"
+┊    ┊3487┊    getpass "^0.1.1"
+┊    ┊3488┊    jsbn "~0.1.0"
+┊    ┊3489┊    safer-buffer "^2.0.2"
+┊    ┊3490┊    tweetnacl "~0.14.0"
+┊    ┊3491┊
+┊    ┊3492┊stack-trace@0.0.x:
+┊    ┊3493┊  version "0.0.10"
+┊    ┊3494┊  resolved "https://registry.yarnpkg.com/stack-trace/-/stack-trace-0.0.10.tgz#547c70b347e8d32b4e108ea1a2a159e5fdde19c0"
+┊    ┊3495┊  integrity sha1-VHxws0fo0ytOEI6hoqFZ5f3eGcA=
+┊    ┊3496┊
 ┊2330┊3497┊static-extend@^0.1.1:
 ┊2331┊3498┊  version "0.1.2"
 ┊2332┊3499┊  resolved "https://registry.yarnpkg.com/static-extend/-/static-extend-0.1.2.tgz#60809c39cbff55337226fd5e0b520f341f1fb5c6"
```
```diff
@@ -2359,7 +3526,7 @@
 ┊2359┊3526┊    is-fullwidth-code-point "^1.0.0"
 ┊2360┊3527┊    strip-ansi "^3.0.0"
 ┊2361┊3528┊
-┊2362┊    ┊"string-width@^1.0.2 || 2", string-width@^2.0.0, string-width@^2.1.1:
+┊    ┊3529┊"string-width@^1.0.2 || 2", string-width@^2.0.0, string-width@^2.1.0, string-width@^2.1.1:
 ┊2363┊3530┊  version "2.1.1"
 ┊2364┊3531┊  resolved "https://registry.yarnpkg.com/string-width/-/string-width-2.1.1.tgz#ab93f27a8dc13d28cac815c462143a6d9012ae9e"
 ┊2365┊3532┊  integrity sha512-nOqH59deCq9SRHlxq1Aw85Jnt4w6KvLKqWVik6oA9ZklXLNIOlqg4F2yrT1MVaTjAqvVwdfeZ7w7aCvJD7ugkw==
```
```diff
@@ -2388,6 +3555,13 @@
 ┊2388┊3555┊  dependencies:
 ┊2389┊3556┊    ansi-regex "^3.0.0"
 ┊2390┊3557┊
+┊    ┊3558┊strip-ansi@^5.0.0:
+┊    ┊3559┊  version "5.0.0"
+┊    ┊3560┊  resolved "https://registry.yarnpkg.com/strip-ansi/-/strip-ansi-5.0.0.tgz#f78f68b5d0866c20b2c9b8c61b5298508dc8756f"
+┊    ┊3561┊  integrity sha512-Uu7gQyZI7J7gn5qLn1Np3G9vcYGTVqB+lFTytnDJv83dd8T22aGH451P3jueT2/QemInJDfxHB5Tde5OzgG1Ow==
+┊    ┊3562┊  dependencies:
+┊    ┊3563┊    ansi-regex "^4.0.0"
+┊    ┊3564┊
 ┊2391┊3565┊strip-eof@^1.0.0:
 ┊2392┊3566┊  version "1.0.0"
 ┊2393┊3567┊  resolved "https://registry.yarnpkg.com/strip-eof/-/strip-eof-1.0.0.tgz#bb43ff5598a6eb05d89b59fcd129c983313606bf"
```
```diff
@@ -2409,6 +3583,11 @@
 ┊2409┊3583┊    symbol-observable "^1.0.4"
 ┊2410┊3584┊    ws "^5.2.0"
 ┊2411┊3585┊
+┊    ┊3586┊supports-color@^2.0.0:
+┊    ┊3587┊  version "2.0.0"
+┊    ┊3588┊  resolved "https://registry.yarnpkg.com/supports-color/-/supports-color-2.0.0.tgz#535d045ce6b6363fa40117084629995e9df324c7"
+┊    ┊3589┊  integrity sha1-U10EXOa2Nj+kARcIRimZXp3zJMc=
+┊    ┊3590┊
 ┊2412┊3591┊supports-color@^5.2.0, supports-color@^5.3.0:
 ┊2413┊3592┊  version "5.5.0"
 ┊2414┊3593┊  resolved "https://registry.yarnpkg.com/supports-color/-/supports-color-5.5.0.tgz#e2e69a44ac8772f78a1ec0b35b689df6530efc8f"
```
```diff
@@ -2416,7 +3595,15 @@
 ┊2416┊3595┊  dependencies:
 ┊2417┊3596┊    has-flag "^3.0.0"
 ┊2418┊3597┊
-┊2419┊    ┊symbol-observable@^1.0.4:
+┊    ┊3598┊swap-case@^1.1.0:
+┊    ┊3599┊  version "1.1.2"
+┊    ┊3600┊  resolved "https://registry.yarnpkg.com/swap-case/-/swap-case-1.1.2.tgz#c39203a4587385fad3c850a0bd1bcafa081974e3"
+┊    ┊3601┊  integrity sha1-w5IDpFhzhfrTyFCgvRvK+ggZdOM=
+┊    ┊3602┊  dependencies:
+┊    ┊3603┊    lower-case "^1.1.1"
+┊    ┊3604┊    upper-case "^1.1.1"
+┊    ┊3605┊
+┊    ┊3606┊symbol-observable@^1.0.4, symbol-observable@^1.1.0:
 ┊2420┊3607┊  version "1.2.0"
 ┊2421┊3608┊  resolved "https://registry.yarnpkg.com/symbol-observable/-/symbol-observable-1.2.0.tgz#c22688aed4eab3cdc2dfeacbb561660560a00804"
 ┊2422┊3609┊  integrity sha512-e900nM8RRtGhlV36KGEU9k65K3mPb1WV70OdjfxlG2EAuM1noi/E/BaW/uMhL7bPEssK8QV57vN3esixjUvcXQ==
```
```diff
@@ -2441,11 +3628,41 @@
 ┊2441┊3628┊  dependencies:
 ┊2442┊3629┊    execa "^0.7.0"
 ┊2443┊3630┊
+┊    ┊3631┊text-hex@1.0.x:
+┊    ┊3632┊  version "1.0.0"
+┊    ┊3633┊  resolved "https://registry.yarnpkg.com/text-hex/-/text-hex-1.0.0.tgz#69dc9c1b17446ee79a92bf5b884bb4b9127506f5"
+┊    ┊3634┊  integrity sha512-uuVGNWzgJ4yhRaNSiubPY7OjISw4sw4E5Uv0wbjp+OzcbmVU/rsT8ujgcXJhn9ypzsgr5vlzpPqP+MBBKcGvbg==
+┊    ┊3635┊
+┊    ┊3636┊through@^2.3.6:
+┊    ┊3637┊  version "2.3.8"
+┊    ┊3638┊  resolved "https://registry.yarnpkg.com/through/-/through-2.3.8.tgz#0dd4c9ffaabc357960b1b724115d7e0e86a2e1f5"
+┊    ┊3639┊  integrity sha1-DdTJ/6q8NXlgsbckEV1+Doai4fU=
+┊    ┊3640┊
 ┊2444┊3641┊timed-out@^4.0.0:
 ┊2445┊3642┊  version "4.0.1"
 ┊2446┊3643┊  resolved "https://registry.yarnpkg.com/timed-out/-/timed-out-4.0.1.tgz#f32eacac5a175bea25d7fab565ab3ed8741ef56f"
 ┊2447┊3644┊  integrity sha1-8y6srFoXW+ol1/q1Zas+2HQe9W8=
 ┊2448┊3645┊
+┊    ┊3646┊title-case@^2.1.0:
+┊    ┊3647┊  version "2.1.1"
+┊    ┊3648┊  resolved "https://registry.yarnpkg.com/title-case/-/title-case-2.1.1.tgz#3e127216da58d2bc5becf137ab91dae3a7cd8faa"
+┊    ┊3649┊  integrity sha1-PhJyFtpY0rxb7PE3q5Ha46fNj6o=
+┊    ┊3650┊  dependencies:
+┊    ┊3651┊    no-case "^2.2.0"
+┊    ┊3652┊    upper-case "^1.0.3"
+┊    ┊3653┊
+┊    ┊3654┊tmp@^0.0.33:
+┊    ┊3655┊  version "0.0.33"
+┊    ┊3656┊  resolved "https://registry.yarnpkg.com/tmp/-/tmp-0.0.33.tgz#6d34335889768d21b2bcda0aa277ced3b1bfadf9"
+┊    ┊3657┊  integrity sha512-jRCJlojKnZ3addtTOjdIqoRuPEKBvNXcGYqzO6zWZX8KfKEpnGY5jfggJQ3EjKuu8D4bJRr0y+cYJFmYbImXGw==
+┊    ┊3658┊  dependencies:
+┊    ┊3659┊    os-tmpdir "~1.0.2"
+┊    ┊3660┊
+┊    ┊3661┊to-fast-properties@^2.0.0:
+┊    ┊3662┊  version "2.0.0"
+┊    ┊3663┊  resolved "https://registry.yarnpkg.com/to-fast-properties/-/to-fast-properties-2.0.0.tgz#dc5e698cbd079265bc73e0377681a4e4e83f616e"
+┊    ┊3664┊  integrity sha1-3F5pjL0HkmW8c+A3doGk5Og/YW4=
+┊    ┊3665┊
 ┊2449┊3666┊to-object-path@^0.3.0:
 ┊2450┊3667┊  version "0.3.0"
 ┊2451┊3668┊  resolved "https://registry.yarnpkg.com/to-object-path/-/to-object-path-0.3.0.tgz#297588b7b0e7e0ac08e04e672f85c1f4999e17af"
```
```diff
@@ -2483,6 +3700,29 @@
 ┊2483┊3700┊  dependencies:
 ┊2484┊3701┊    nopt "~1.0.10"
 ┊2485┊3702┊
+┊    ┊3703┊tough-cookie@~2.4.3:
+┊    ┊3704┊  version "2.4.3"
+┊    ┊3705┊  resolved "https://registry.yarnpkg.com/tough-cookie/-/tough-cookie-2.4.3.tgz#53f36da3f47783b0925afa06ff9f3b165280f781"
+┊    ┊3706┊  integrity sha512-Q5srk/4vDM54WJsJio3XNn6K2sCG+CQ8G5Wz6bZhRZoAe/+TxjWB/GlFAnYEbkYVlON9FMk/fE3h2RLpPXo4lQ==
+┊    ┊3707┊  dependencies:
+┊    ┊3708┊    psl "^1.1.24"
+┊    ┊3709┊    punycode "^1.4.1"
+┊    ┊3710┊
+┊    ┊3711┊trim-right@^1.0.1:
+┊    ┊3712┊  version "1.0.1"
+┊    ┊3713┊  resolved "https://registry.yarnpkg.com/trim-right/-/trim-right-1.0.1.tgz#cb2e1203067e0c8de1f614094b9fe45704ea6003"
+┊    ┊3714┊  integrity sha1-yy4SAwZ+DI3h9hQJS5/kVwTqYAM=
+┊    ┊3715┊
+┊    ┊3716┊triple-beam@^1.2.0, triple-beam@^1.3.0:
+┊    ┊3717┊  version "1.3.0"
+┊    ┊3718┊  resolved "https://registry.yarnpkg.com/triple-beam/-/triple-beam-1.3.0.tgz#a595214c7298db8339eeeee083e4d10bd8cb8dd9"
+┊    ┊3719┊  integrity sha512-XrHUvV5HpdLmIj4uVMxHggLbFSZYIn7HEWsqePZcI50pco+MPqJ50wMGY794X7AOOhxOBAjbkqfAbEe/QMp2Lw==
+┊    ┊3720┊
+┊    ┊3721┊ts-log@2.1.4:
+┊    ┊3722┊  version "2.1.4"
+┊    ┊3723┊  resolved "https://registry.yarnpkg.com/ts-log/-/ts-log-2.1.4.tgz#063c5ad1cbab5d49d258d18015963489fb6fb59a"
+┊    ┊3724┊  integrity sha512-P1EJSoyV+N3bR/IWFeAqXzKPZwHpnLY6j7j58mAvewHRipo+BQM2Y1f9Y9BjEQznKwgqqZm7H8iuixmssU7tYQ==
+┊    ┊3725┊
 ┊2486┊3726┊ts-node@^7.0.1:
 ┊2487┊3727┊  version "7.0.1"
 ┊2488┊3728┊  resolved "https://registry.yarnpkg.com/ts-node/-/ts-node-7.0.1.tgz#9562dc2d1e6d248d24bc55f773e3f614337d9baf"
```
```diff
@@ -2497,6 +3737,23 @@
 ┊2497┊3737┊    source-map-support "^0.5.6"
 ┊2498┊3738┊    yn "^2.0.0"
 ┊2499┊3739┊
+┊    ┊3740┊tslib@1.9.3, tslib@^1.9.0:
+┊    ┊3741┊  version "1.9.3"
+┊    ┊3742┊  resolved "https://registry.yarnpkg.com/tslib/-/tslib-1.9.3.tgz#d7e4dd79245d85428c4d7e4822a79917954ca286"
+┊    ┊3743┊  integrity sha512-4krF8scpejhaOgqzBEcGM7yDIEfi0/8+8zDRZhNZZ2kjmHJ4hv3zCbQWxoJGz1iw5U0Jl0nma13xzHXcncMavQ==
+┊    ┊3744┊
+┊    ┊3745┊tunnel-agent@^0.6.0:
+┊    ┊3746┊  version "0.6.0"
+┊    ┊3747┊  resolved "https://registry.yarnpkg.com/tunnel-agent/-/tunnel-agent-0.6.0.tgz#27a5dea06b36b04a0a9966774b290868f0fc40fd"
+┊    ┊3748┊  integrity sha1-J6XeoGs2sEoKmWZ3SykIaPD8QP0=
+┊    ┊3749┊  dependencies:
+┊    ┊3750┊    safe-buffer "^5.0.1"
+┊    ┊3751┊
+┊    ┊3752┊tweetnacl@^0.14.3, tweetnacl@~0.14.0:
+┊    ┊3753┊  version "0.14.5"
+┊    ┊3754┊  resolved "https://registry.yarnpkg.com/tweetnacl/-/tweetnacl-0.14.5.tgz#5ae68177f192d4456269d108afa93ff8743f4f64"
+┊    ┊3755┊  integrity sha1-WuaBd/GS1EViadEIr6k/+HQ/T2Q=
+┊    ┊3756┊
 ┊2500┊3757┊type-is@^1.6.16, type-is@~1.6.16:
 ┊2501┊3758┊  version "1.6.16"
 ┊2502┊3759┊  resolved "https://registry.yarnpkg.com/type-is/-/type-is-1.6.16.tgz#f89ce341541c672b25ee7ae3c73dee3b2be50194"
```
```diff
@@ -2573,6 +3830,25 @@
 ┊2573┊3830┊    semver-diff "^2.0.0"
 ┊2574┊3831┊    xdg-basedir "^3.0.0"
 ┊2575┊3832┊
+┊    ┊3833┊upper-case-first@^1.1.0, upper-case-first@^1.1.2:
+┊    ┊3834┊  version "1.1.2"
+┊    ┊3835┊  resolved "https://registry.yarnpkg.com/upper-case-first/-/upper-case-first-1.1.2.tgz#5d79bedcff14419518fd2edb0a0507c9b6859115"
+┊    ┊3836┊  integrity sha1-XXm+3P8UQZUY/S7bCgUHybaFkRU=
+┊    ┊3837┊  dependencies:
+┊    ┊3838┊    upper-case "^1.1.1"
+┊    ┊3839┊
+┊    ┊3840┊upper-case@^1.0.3, upper-case@^1.1.0, upper-case@^1.1.1, upper-case@^1.1.3:
+┊    ┊3841┊  version "1.1.3"
+┊    ┊3842┊  resolved "https://registry.yarnpkg.com/upper-case/-/upper-case-1.1.3.tgz#f6b4501c2ec4cdd26ba78be7222961de77621598"
+┊    ┊3843┊  integrity sha1-9rRQHC7EzdJrp4vnIilh3ndiFZg=
+┊    ┊3844┊
+┊    ┊3845┊uri-js@^4.2.2:
+┊    ┊3846┊  version "4.2.2"
+┊    ┊3847┊  resolved "https://registry.yarnpkg.com/uri-js/-/uri-js-4.2.2.tgz#94c540e1ff772956e2299507c010aea6c8838eb0"
+┊    ┊3848┊  integrity sha512-KY9Frmirql91X2Qgjry0Wd4Y+YTdrdZheS8TFwvkbLWf/G5KNJDCh6pKL5OZctEW4+0Baa5idK2ZQuELRwPznQ==
+┊    ┊3849┊  dependencies:
+┊    ┊3850┊    punycode "^2.1.0"
+┊    ┊3851┊
 ┊2576┊3852┊urix@^0.1.0:
 ┊2577┊3853┊  version "0.1.0"
 ┊2578┊3854┊  resolved "https://registry.yarnpkg.com/urix/-/urix-0.1.0.tgz#da937f7a62e21fec1fd18d49b35c2935067a6c72"
```
```diff
@@ -2608,16 +3884,35 @@
 ┊2608┊3884┊  resolved "https://registry.yarnpkg.com/utils-merge/-/utils-merge-1.0.1.tgz#9f95710f50a267947b2ccc124741c1028427e713"
 ┊2609┊3885┊  integrity sha1-n5VxD1CiZ5R7LMwSR0HBAoQn5xM=
 ┊2610┊3886┊
-┊2611┊    ┊uuid@^3.1.0:
+┊    ┊3887┊uuid@^3.1.0, uuid@^3.3.2:
 ┊2612┊3888┊  version "3.3.2"
 ┊2613┊3889┊  resolved "https://registry.yarnpkg.com/uuid/-/uuid-3.3.2.tgz#1b4af4955eb3077c501c23872fc6513811587131"
 ┊2614┊3890┊  integrity sha512-yXJmeNaw3DnnKAOKJE51sL/ZaYfWJRl1pK9dr19YFCu0ObS231AB1/LbqTKRAQ5kw8A90rA6fr4riOUpTZvQZA==
 ┊2615┊3891┊
+┊    ┊3892┊valid-url@1.0.9:
+┊    ┊3893┊  version "1.0.9"
+┊    ┊3894┊  resolved "https://registry.yarnpkg.com/valid-url/-/valid-url-1.0.9.tgz#1c14479b40f1397a75782f115e4086447433a200"
+┊    ┊3895┊  integrity sha1-HBRHm0DxOXp1eC8RXkCGRHQzogA=
+┊    ┊3896┊
 ┊2616┊3897┊vary@^1, vary@~1.1.2:
 ┊2617┊3898┊  version "1.1.2"
 ┊2618┊3899┊  resolved "https://registry.yarnpkg.com/vary/-/vary-1.1.2.tgz#2299f02c6ded30d4a5961b0b9f74524a18f634fc"
 ┊2619┊3900┊  integrity sha1-IpnwLG3tMNSllhsLn3RSShj2NPw=
 ┊2620┊3901┊
+┊    ┊3902┊verror@1.10.0:
+┊    ┊3903┊  version "1.10.0"
+┊    ┊3904┊  resolved "https://registry.yarnpkg.com/verror/-/verror-1.10.0.tgz#3a105ca17053af55d6e270c1f8288682e18da400"
+┊    ┊3905┊  integrity sha1-OhBcoXBTr1XW4nDB+CiGguGNpAA=
+┊    ┊3906┊  dependencies:
+┊    ┊3907┊    assert-plus "^1.0.0"
+┊    ┊3908┊    core-util-is "1.0.2"
+┊    ┊3909┊    extsprintf "^1.2.0"
+┊    ┊3910┊
+┊    ┊3911┊whatwg-fetch@2.0.4:
+┊    ┊3912┊  version "2.0.4"
+┊    ┊3913┊  resolved "https://registry.yarnpkg.com/whatwg-fetch/-/whatwg-fetch-2.0.4.tgz#dde6a5df315f9d39991aa17621853d720b85566f"
+┊    ┊3914┊  integrity sha512-dcQ1GWpOD/eEQ97k66aiEVpNnapVj90/+R+SXTPYGHpYBBypfKJEQjLrvMZ7YXbKm21gXd4NcuxUTjiv1YtLng==
+┊    ┊3915┊
 ┊2621┊3916┊which@^1.2.9:
 ┊2622┊3917┊  version "1.3.1"
 ┊2623┊3918┊  resolved "https://registry.yarnpkg.com/which/-/which-1.3.1.tgz#a45043d54f5805316da8d62f9f50918d3da70b0a"
```
```diff
@@ -2639,6 +3934,37 @@
 ┊2639┊3934┊  dependencies:
 ┊2640┊3935┊    string-width "^2.1.1"
 ┊2641┊3936┊
+┊    ┊3937┊winston-transport@^4.2.0:
+┊    ┊3938┊  version "4.3.0"
+┊    ┊3939┊  resolved "https://registry.yarnpkg.com/winston-transport/-/winston-transport-4.3.0.tgz#df68c0c202482c448d9b47313c07304c2d7c2c66"
+┊    ┊3940┊  integrity sha512-B2wPuwUi3vhzn/51Uukcao4dIduEiPOcOt9HJ3QeaXgkJ5Z7UwpBzxS4ZGNHtrxrUvTwemsQiSys0ihOf8Mp1A==
+┊    ┊3941┊  dependencies:
+┊    ┊3942┊    readable-stream "^2.3.6"
+┊    ┊3943┊    triple-beam "^1.2.0"
+┊    ┊3944┊
+┊    ┊3945┊winston@3.1.0:
+┊    ┊3946┊  version "3.1.0"
+┊    ┊3947┊  resolved "https://registry.yarnpkg.com/winston/-/winston-3.1.0.tgz#80724376aef164e024f316100d5b178d78ac5331"
+┊    ┊3948┊  integrity sha512-FsQfEE+8YIEeuZEYhHDk5cILo1HOcWkGwvoidLrDgPog0r4bser1lEIOco2dN9zpDJ1M88hfDgZvxe5z4xNcwg==
+┊    ┊3949┊  dependencies:
+┊    ┊3950┊    async "^2.6.0"
+┊    ┊3951┊    diagnostics "^1.1.1"
+┊    ┊3952┊    is-stream "^1.1.0"
+┊    ┊3953┊    logform "^1.9.1"
+┊    ┊3954┊    one-time "0.0.4"
+┊    ┊3955┊    readable-stream "^2.3.6"
+┊    ┊3956┊    stack-trace "0.0.x"
+┊    ┊3957┊    triple-beam "^1.3.0"
+┊    ┊3958┊    winston-transport "^4.2.0"
+┊    ┊3959┊
+┊    ┊3960┊wrap-ansi@^3.0.1:
+┊    ┊3961┊  version "3.0.1"
+┊    ┊3962┊  resolved "https://registry.yarnpkg.com/wrap-ansi/-/wrap-ansi-3.0.1.tgz#288a04d87eda5c286e060dfe8f135ce8d007f8ba"
+┊    ┊3963┊  integrity sha1-KIoE2H7aXChuBg3+jxNc6NAH+Lo=
+┊    ┊3964┊  dependencies:
+┊    ┊3965┊    string-width "^2.1.1"
+┊    ┊3966┊    strip-ansi "^4.0.0"
+┊    ┊3967┊
 ┊2642┊3968┊wrappy@1:
 ┊2643┊3969┊  version "1.0.2"
 ┊2644┊3970┊  resolved "https://registry.yarnpkg.com/wrappy/-/wrappy-1.0.2.tgz#b5243d8f3ec1aa35f1364605bc0d1036e30ab69f"
```

[}]: #

Now let's run the generator (the server must be running in the background):

    $ npm run generator

Those are the types created with `npm run generator`:

[{]: <helper> (diffStep "2.2")

#### Step 2.2: Create types with generator

##### Added types.d.ts
```diff
@@ -0,0 +1,456 @@
+┊   ┊  1┊export type Maybe<T> = T | undefined | null;
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
+┊   ┊100┊import { ChatDb, MessageDb, RecipientDb, UserDb } from "./db";
+┊   ┊101┊
+┊   ┊102┊export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
+┊   ┊103┊  parent: Parent,
+┊   ┊104┊  args: Args,
+┊   ┊105┊  context: Context,
+┊   ┊106┊  info: GraphQLResolveInfo
+┊   ┊107┊) => Promise<Result> | Result;
+┊   ┊108┊
+┊   ┊109┊export interface ISubscriptionResolverObject<Result, Parent, Context, Args> {
+┊   ┊110┊  subscribe<R = Result, P = Parent>(
+┊   ┊111┊    parent: P,
+┊   ┊112┊    args: Args,
+┊   ┊113┊    context: Context,
+┊   ┊114┊    info: GraphQLResolveInfo
+┊   ┊115┊  ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>;
+┊   ┊116┊  resolve?<R = Result, P = Parent>(
+┊   ┊117┊    parent: P,
+┊   ┊118┊    args: Args,
+┊   ┊119┊    context: Context,
+┊   ┊120┊    info: GraphQLResolveInfo
+┊   ┊121┊  ): R | Result | Promise<R | Result>;
+┊   ┊122┊}
+┊   ┊123┊
+┊   ┊124┊export type SubscriptionResolver<
+┊   ┊125┊  Result,
+┊   ┊126┊  Parent = {},
+┊   ┊127┊  Context = {},
+┊   ┊128┊  Args = {}
+┊   ┊129┊> =
+┊   ┊130┊  | ((
+┊   ┊131┊      ...args: any[]
+┊   ┊132┊    ) => ISubscriptionResolverObject<Result, Parent, Context, Args>)
+┊   ┊133┊  | ISubscriptionResolverObject<Result, Parent, Context, Args>;
+┊   ┊134┊
+┊   ┊135┊export type TypeResolveFn<Types, Parent = {}, Context = {}> = (
+┊   ┊136┊  parent: Parent,
+┊   ┊137┊  context: Context,
+┊   ┊138┊  info: GraphQLResolveInfo
+┊   ┊139┊) => Maybe<Types>;
+┊   ┊140┊
+┊   ┊141┊export type NextResolverFn<T> = () => Promise<T>;
+┊   ┊142┊
+┊   ┊143┊export type DirectiveResolverFn<TResult, TArgs = {}, TContext = {}> = (
+┊   ┊144┊  next: NextResolverFn<TResult>,
+┊   ┊145┊  source: any,
+┊   ┊146┊  args: TArgs,
+┊   ┊147┊  context: TContext,
+┊   ┊148┊  info: GraphQLResolveInfo
+┊   ┊149┊) => TResult | Promise<TResult>;
+┊   ┊150┊
+┊   ┊151┊export namespace QueryResolvers {
+┊   ┊152┊  export interface Resolvers<Context = {}, TypeParent = {}> {
+┊   ┊153┊    users?: UsersResolver<Maybe<UserDb[]>, TypeParent, Context>;
+┊   ┊154┊
+┊   ┊155┊    chats?: ChatsResolver<Maybe<ChatDb[]>, TypeParent, Context>;
+┊   ┊156┊
+┊   ┊157┊    chat?: ChatResolver<Maybe<ChatDb>, TypeParent, Context>;
+┊   ┊158┊  }
+┊   ┊159┊
+┊   ┊160┊  export type UsersResolver<
+┊   ┊161┊    R = Maybe<UserDb[]>,
+┊   ┊162┊    Parent = {},
+┊   ┊163┊    Context = {}
+┊   ┊164┊  > = Resolver<R, Parent, Context>;
+┊   ┊165┊  export type ChatsResolver<
+┊   ┊166┊    R = Maybe<ChatDb[]>,
+┊   ┊167┊    Parent = {},
+┊   ┊168┊    Context = {}
+┊   ┊169┊  > = Resolver<R, Parent, Context>;
+┊   ┊170┊  export type ChatResolver<
+┊   ┊171┊    R = Maybe<ChatDb>,
+┊   ┊172┊    Parent = {},
+┊   ┊173┊    Context = {}
+┊   ┊174┊  > = Resolver<R, Parent, Context, ChatArgs>;
+┊   ┊175┊  export interface ChatArgs {
+┊   ┊176┊    chatId: string;
+┊   ┊177┊  }
+┊   ┊178┊}
+┊   ┊179┊
+┊   ┊180┊export namespace UserResolvers {
+┊   ┊181┊  export interface Resolvers<Context = {}, TypeParent = UserDb> {
+┊   ┊182┊    id?: IdResolver<string, TypeParent, Context>;
+┊   ┊183┊
+┊   ┊184┊    name?: NameResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊185┊
+┊   ┊186┊    picture?: PictureResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊187┊
+┊   ┊188┊    phone?: PhoneResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊189┊  }
+┊   ┊190┊
+┊   ┊191┊  export type IdResolver<R = string, Parent = UserDb, Context = {}> = Resolver<
+┊   ┊192┊    R,
+┊   ┊193┊    Parent,
+┊   ┊194┊    Context
+┊   ┊195┊  >;
+┊   ┊196┊  export type NameResolver<
+┊   ┊197┊    R = Maybe<string>,
+┊   ┊198┊    Parent = UserDb,
+┊   ┊199┊    Context = {}
+┊   ┊200┊  > = Resolver<R, Parent, Context>;
+┊   ┊201┊  export type PictureResolver<
+┊   ┊202┊    R = Maybe<string>,
+┊   ┊203┊    Parent = UserDb,
+┊   ┊204┊    Context = {}
+┊   ┊205┊  > = Resolver<R, Parent, Context>;
+┊   ┊206┊  export type PhoneResolver<
+┊   ┊207┊    R = Maybe<string>,
+┊   ┊208┊    Parent = UserDb,
+┊   ┊209┊    Context = {}
+┊   ┊210┊  > = Resolver<R, Parent, Context>;
+┊   ┊211┊}
+┊   ┊212┊
+┊   ┊213┊export namespace ChatResolvers {
+┊   ┊214┊  export interface Resolvers<Context = {}, TypeParent = ChatDb> {
+┊   ┊215┊    id?: IdResolver<string, TypeParent, Context>;
+┊   ┊216┊
+┊   ┊217┊    name?: NameResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊218┊
+┊   ┊219┊    picture?: PictureResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊220┊
+┊   ┊221┊    allTimeMembers?: AllTimeMembersResolver<UserDb[], TypeParent, Context>;
+┊   ┊222┊
+┊   ┊223┊    listingMembers?: ListingMembersResolver<UserDb[], TypeParent, Context>;
+┊   ┊224┊
+┊   ┊225┊    actualGroupMembers?: ActualGroupMembersResolver<
+┊   ┊226┊      UserDb[],
+┊   ┊227┊      TypeParent,
+┊   ┊228┊      Context
+┊   ┊229┊    >;
+┊   ┊230┊
+┊   ┊231┊    admins?: AdminsResolver<Maybe<UserDb[]>, TypeParent, Context>;
+┊   ┊232┊
+┊   ┊233┊    owner?: OwnerResolver<Maybe<UserDb>, TypeParent, Context>;
+┊   ┊234┊
+┊   ┊235┊    messages?: MessagesResolver<(Maybe<MessageDb>)[], TypeParent, Context>;
+┊   ┊236┊
+┊   ┊237┊    unreadMessages?: UnreadMessagesResolver<number, TypeParent, Context>;
+┊   ┊238┊
+┊   ┊239┊    isGroup?: IsGroupResolver<boolean, TypeParent, Context>;
+┊   ┊240┊  }
+┊   ┊241┊
+┊   ┊242┊  export type IdResolver<R = string, Parent = ChatDb, Context = {}> = Resolver<
+┊   ┊243┊    R,
+┊   ┊244┊    Parent,
+┊   ┊245┊    Context
+┊   ┊246┊  >;
+┊   ┊247┊  export type NameResolver<
+┊   ┊248┊    R = Maybe<string>,
+┊   ┊249┊    Parent = ChatDb,
+┊   ┊250┊    Context = {}
+┊   ┊251┊  > = Resolver<R, Parent, Context>;
+┊   ┊252┊  export type PictureResolver<
+┊   ┊253┊    R = Maybe<string>,
+┊   ┊254┊    Parent = ChatDb,
+┊   ┊255┊    Context = {}
+┊   ┊256┊  > = Resolver<R, Parent, Context>;
+┊   ┊257┊  export type AllTimeMembersResolver<
+┊   ┊258┊    R = UserDb[],
+┊   ┊259┊    Parent = ChatDb,
+┊   ┊260┊    Context = {}
+┊   ┊261┊  > = Resolver<R, Parent, Context>;
+┊   ┊262┊  export type ListingMembersResolver<
+┊   ┊263┊    R = UserDb[],
+┊   ┊264┊    Parent = ChatDb,
+┊   ┊265┊    Context = {}
+┊   ┊266┊  > = Resolver<R, Parent, Context>;
+┊   ┊267┊  export type ActualGroupMembersResolver<
+┊   ┊268┊    R = UserDb[],
+┊   ┊269┊    Parent = ChatDb,
+┊   ┊270┊    Context = {}
+┊   ┊271┊  > = Resolver<R, Parent, Context>;
+┊   ┊272┊  export type AdminsResolver<
+┊   ┊273┊    R = Maybe<UserDb[]>,
+┊   ┊274┊    Parent = ChatDb,
+┊   ┊275┊    Context = {}
+┊   ┊276┊  > = Resolver<R, Parent, Context>;
+┊   ┊277┊  export type OwnerResolver<
+┊   ┊278┊    R = Maybe<UserDb>,
+┊   ┊279┊    Parent = ChatDb,
+┊   ┊280┊    Context = {}
+┊   ┊281┊  > = Resolver<R, Parent, Context>;
+┊   ┊282┊  export type MessagesResolver<
+┊   ┊283┊    R = (Maybe<MessageDb>)[],
+┊   ┊284┊    Parent = ChatDb,
+┊   ┊285┊    Context = {}
+┊   ┊286┊  > = Resolver<R, Parent, Context, MessagesArgs>;
+┊   ┊287┊  export interface MessagesArgs {
+┊   ┊288┊    amount?: Maybe<number>;
+┊   ┊289┊  }
+┊   ┊290┊
+┊   ┊291┊  export type UnreadMessagesResolver<
+┊   ┊292┊    R = number,
+┊   ┊293┊    Parent = ChatDb,
+┊   ┊294┊    Context = {}
+┊   ┊295┊  > = Resolver<R, Parent, Context>;
+┊   ┊296┊  export type IsGroupResolver<
+┊   ┊297┊    R = boolean,
+┊   ┊298┊    Parent = ChatDb,
+┊   ┊299┊    Context = {}
+┊   ┊300┊  > = Resolver<R, Parent, Context>;
+┊   ┊301┊}
+┊   ┊302┊
+┊   ┊303┊export namespace MessageResolvers {
+┊   ┊304┊  export interface Resolvers<Context = {}, TypeParent = MessageDb> {
+┊   ┊305┊    id?: IdResolver<string, TypeParent, Context>;
+┊   ┊306┊
+┊   ┊307┊    sender?: SenderResolver<UserDb, TypeParent, Context>;
+┊   ┊308┊
+┊   ┊309┊    chat?: ChatResolver<ChatDb, TypeParent, Context>;
+┊   ┊310┊
+┊   ┊311┊    content?: ContentResolver<string, TypeParent, Context>;
+┊   ┊312┊
+┊   ┊313┊    createdAt?: CreatedAtResolver<string, TypeParent, Context>;
+┊   ┊314┊
+┊   ┊315┊    type?: TypeResolver<number, TypeParent, Context>;
+┊   ┊316┊
+┊   ┊317┊    recipients?: RecipientsResolver<RecipientDb[], TypeParent, Context>;
+┊   ┊318┊
+┊   ┊319┊    holders?: HoldersResolver<UserDb[], TypeParent, Context>;
+┊   ┊320┊
+┊   ┊321┊    ownership?: OwnershipResolver<boolean, TypeParent, Context>;
+┊   ┊322┊  }
+┊   ┊323┊
+┊   ┊324┊  export type IdResolver<
+┊   ┊325┊    R = string,
+┊   ┊326┊    Parent = MessageDb,
+┊   ┊327┊    Context = {}
+┊   ┊328┊  > = Resolver<R, Parent, Context>;
+┊   ┊329┊  export type SenderResolver<
+┊   ┊330┊    R = UserDb,
+┊   ┊331┊    Parent = MessageDb,
+┊   ┊332┊    Context = {}
+┊   ┊333┊  > = Resolver<R, Parent, Context>;
+┊   ┊334┊  export type ChatResolver<
+┊   ┊335┊    R = ChatDb,
+┊   ┊336┊    Parent = MessageDb,
+┊   ┊337┊    Context = {}
+┊   ┊338┊  > = Resolver<R, Parent, Context>;
+┊   ┊339┊  export type ContentResolver<
+┊   ┊340┊    R = string,
+┊   ┊341┊    Parent = MessageDb,
+┊   ┊342┊    Context = {}
+┊   ┊343┊  > = Resolver<R, Parent, Context>;
+┊   ┊344┊  export type CreatedAtResolver<
+┊   ┊345┊    R = string,
+┊   ┊346┊    Parent = MessageDb,
+┊   ┊347┊    Context = {}
+┊   ┊348┊  > = Resolver<R, Parent, Context>;
+┊   ┊349┊  export type TypeResolver<
+┊   ┊350┊    R = number,
+┊   ┊351┊    Parent = MessageDb,
+┊   ┊352┊    Context = {}
+┊   ┊353┊  > = Resolver<R, Parent, Context>;
+┊   ┊354┊  export type RecipientsResolver<
+┊   ┊355┊    R = RecipientDb[],
+┊   ┊356┊    Parent = MessageDb,
+┊   ┊357┊    Context = {}
+┊   ┊358┊  > = Resolver<R, Parent, Context>;
+┊   ┊359┊  export type HoldersResolver<
+┊   ┊360┊    R = UserDb[],
+┊   ┊361┊    Parent = MessageDb,
+┊   ┊362┊    Context = {}
+┊   ┊363┊  > = Resolver<R, Parent, Context>;
+┊   ┊364┊  export type OwnershipResolver<
+┊   ┊365┊    R = boolean,
+┊   ┊366┊    Parent = MessageDb,
+┊   ┊367┊    Context = {}
+┊   ┊368┊  > = Resolver<R, Parent, Context>;
+┊   ┊369┊}
+┊   ┊370┊
+┊   ┊371┊export namespace RecipientResolvers {
+┊   ┊372┊  export interface Resolvers<Context = {}, TypeParent = RecipientDb> {
+┊   ┊373┊    user?: UserResolver<UserDb, TypeParent, Context>;
+┊   ┊374┊
+┊   ┊375┊    message?: MessageResolver<MessageDb, TypeParent, Context>;
+┊   ┊376┊
+┊   ┊377┊    chat?: ChatResolver<ChatDb, TypeParent, Context>;
+┊   ┊378┊
+┊   ┊379┊    receivedAt?: ReceivedAtResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊380┊
+┊   ┊381┊    readAt?: ReadAtResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊382┊  }
+┊   ┊383┊
+┊   ┊384┊  export type UserResolver<
+┊   ┊385┊    R = UserDb,
+┊   ┊386┊    Parent = RecipientDb,
+┊   ┊387┊    Context = {}
+┊   ┊388┊  > = Resolver<R, Parent, Context>;
+┊   ┊389┊  export type MessageResolver<
+┊   ┊390┊    R = MessageDb,
+┊   ┊391┊    Parent = RecipientDb,
+┊   ┊392┊    Context = {}
+┊   ┊393┊  > = Resolver<R, Parent, Context>;
+┊   ┊394┊  export type ChatResolver<
+┊   ┊395┊    R = ChatDb,
+┊   ┊396┊    Parent = RecipientDb,
+┊   ┊397┊    Context = {}
+┊   ┊398┊  > = Resolver<R, Parent, Context>;
+┊   ┊399┊  export type ReceivedAtResolver<
+┊   ┊400┊    R = Maybe<string>,
+┊   ┊401┊    Parent = RecipientDb,
+┊   ┊402┊    Context = {}
+┊   ┊403┊  > = Resolver<R, Parent, Context>;
+┊   ┊404┊  export type ReadAtResolver<
+┊   ┊405┊    R = Maybe<string>,
+┊   ┊406┊    Parent = RecipientDb,
+┊   ┊407┊    Context = {}
+┊   ┊408┊  > = Resolver<R, Parent, Context>;
+┊   ┊409┊}
+┊   ┊410┊
+┊   ┊411┊/** Directs the executor to skip this field or fragment when the `if` argument is true. */
+┊   ┊412┊export type SkipDirectiveResolver<Result> = DirectiveResolverFn<
+┊   ┊413┊  Result,
+┊   ┊414┊  SkipDirectiveArgs,
+┊   ┊415┊  {}
+┊   ┊416┊>;
+┊   ┊417┊export interface SkipDirectiveArgs {
+┊   ┊418┊  /** Skipped when true. */
+┊   ┊419┊  if: boolean;
+┊   ┊420┊}
+┊   ┊421┊
+┊   ┊422┊/** Directs the executor to include this field or fragment only when the `if` argument is true. */
+┊   ┊423┊export type IncludeDirectiveResolver<Result> = DirectiveResolverFn<
+┊   ┊424┊  Result,
+┊   ┊425┊  IncludeDirectiveArgs,
+┊   ┊426┊  {}
+┊   ┊427┊>;
+┊   ┊428┊export interface IncludeDirectiveArgs {
+┊   ┊429┊  /** Included when true. */
+┊   ┊430┊  if: boolean;
+┊   ┊431┊}
+┊   ┊432┊
+┊   ┊433┊/** Marks an element of a GraphQL schema as no longer supported. */
+┊   ┊434┊export type DeprecatedDirectiveResolver<Result> = DirectiveResolverFn<
+┊   ┊435┊  Result,
+┊   ┊436┊  DeprecatedDirectiveArgs,
+┊   ┊437┊  {}
+┊   ┊438┊>;
+┊   ┊439┊export interface DeprecatedDirectiveArgs {
+┊   ┊440┊  /** Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax (as specified by [CommonMark](https://commonmark.org/). */
+┊   ┊441┊  reason?: string;
+┊   ┊442┊}
+┊   ┊443┊
+┊   ┊444┊export interface IResolvers {
+┊   ┊445┊  Query?: QueryResolvers.Resolvers;
+┊   ┊446┊  User?: UserResolvers.Resolvers;
+┊   ┊447┊  Chat?: ChatResolvers.Resolvers;
+┊   ┊448┊  Message?: MessageResolvers.Resolvers;
+┊   ┊449┊  Recipient?: RecipientResolvers.Resolvers;
+┊   ┊450┊}
+┊   ┊451┊
+┊   ┊452┊export interface IDirectiveResolvers<Result> {
+┊   ┊453┊  skip?: SkipDirectiveResolver<Result>;
+┊   ┊454┊  include?: IncludeDirectiveResolver<Result>;
+┊   ┊455┊  deprecated?: DeprecatedDirectiveResolver<Result>;
+┊   ┊456┊}
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
@@ -1,5 +1,5 @@
-┊1┊ ┊import { IResolvers } from 'apollo-server-express';
-┊2┊ ┊import { ChatDb, db, MessageDb, RecipientDb, UserDb } from "../db";
+┊ ┊1┊import { db } from "../db";
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
-┊11┊  ┊    users: (): UserDb[] => users.filter(user => user.id !== currentUser),
-┊12┊  ┊    chats: (): ChatDb[] => chats.filter(chat => chat.listingMemberIds.includes(currentUser)),
-┊13┊  ┊    chat: (obj: any, {chatId}): ChatDb | null => chats.find(chat => chat.id === chatId) || null,
+┊  ┊11┊    users: () => users.filter(user => user.id !== currentUser),
+┊  ┊12┊    chats: () => chats.filter(chat => chat.listingMemberIds.includes(currentUser)),
+┊  ┊13┊    chat: (obj, {chatId}) => chats.find(chat => chat.id === Number(chatId)),
 ┊14┊14┊  },
 ┊15┊15┊  Chat: {
-┊16┊  ┊    name: (chat: ChatDb): string => chat.name ? chat.name : users
+┊  ┊16┊    name: (chat): string => chat.name ? chat.name : users
 ┊17┊17┊      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.name,
-┊18┊  ┊    picture: (chat: ChatDb) => chat.name ? chat.picture : users
+┊  ┊18┊    picture: (chat) => chat.name ? chat.picture : users
 ┊19┊19┊      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.picture,
-┊20┊  ┊    allTimeMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.allTimeMemberIds.includes(user.id)),
-┊21┊  ┊    listingMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.listingMemberIds.includes(user.id)),
-┊22┊  ┊    actualGroupMembers: (chat: ChatDb): UserDb[] => users.filter(user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)),
-┊23┊  ┊    admins: (chat: ChatDb): UserDb[] => users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
-┊24┊  ┊    owner: (chat: ChatDb): UserDb | null => users.find(user => chat.ownerId === user.id) || null,
-┊25┊  ┊    messages: (chat: ChatDb, {amount = 0}: {amount: number}): MessageDb[] => {
+┊  ┊20┊    allTimeMembers: (chat) => users.filter(user => chat.allTimeMemberIds.includes(user.id)),
+┊  ┊21┊    listingMembers: (chat) => users.filter(user => chat.listingMemberIds.includes(user.id)),
+┊  ┊22┊    actualGroupMembers: (chat) => users.filter(user => chat.actualGroupMemberIds && chat.actualGroupMemberIds.includes(user.id)),
+┊  ┊23┊    admins: (chat) => users.filter(user => chat.adminIds && chat.adminIds.includes(user.id)),
+┊  ┊24┊    owner: (chat) => users.find(user => chat.ownerId === user.id) || null,
+┊  ┊25┊    messages: (chat, {amount = 0}) => {
 ┊26┊26┊      const messages = chat.messages
 ┊27┊27┊      .filter(message => message.holderIds.includes(currentUser))
-┊28┊  ┊      .sort((a, b) => b.createdAt - a.createdAt) || <MessageDb[]>[];
+┊  ┊28┊      .sort((a, b) => b.createdAt - a.createdAt) || [];
 ┊29┊29┊      return (amount ? messages.slice(0, amount) : messages).reverse();
 ┊30┊30┊    },
-┊31┊  ┊    unreadMessages: (chat: ChatDb): number => chat.messages
+┊  ┊31┊    unreadMessages: (chat) => chat.messages
 ┊32┊32┊      .filter(message => message.holderIds.includes(currentUser) &&
 ┊33┊33┊        message.recipients.find(recipient => recipient.userId === currentUser && !recipient.readAt))
 ┊34┊34┊      .length,
-┊35┊  ┊    isGroup: (chat: ChatDb): boolean => !!chat.name,
+┊  ┊35┊    isGroup: (chat) => !!chat.name,
 ┊36┊36┊  },
 ┊37┊37┊  Message: {
-┊38┊  ┊    chat: (message: MessageDb): ChatDb | null => chats.find(chat => message.chatId === chat.id) || null,
-┊39┊  ┊    sender: (message: MessageDb): UserDb | null => users.find(user => user.id === message.senderId) || null,
-┊40┊  ┊    holders: (message: MessageDb): UserDb[] => users.filter(user => message.holderIds.includes(user.id)),
-┊41┊  ┊    ownership: (message: MessageDb): boolean => message.senderId === currentUser,
+┊  ┊38┊    chat: (message) => chats.find(chat => message.chatId === chat.id)!,
+┊  ┊39┊    sender: (message) => users.find(user => user.id === message.senderId)!,
+┊  ┊40┊    holders: (message) => users.filter(user => message.holderIds.includes(user.id)),
+┊  ┊41┊    ownership: (message) => message.senderId === currentUser,
 ┊42┊42┊  },
 ┊43┊43┊  Recipient: {
-┊44┊  ┊    user: (recipient: RecipientDb): UserDb | null => users.find(user => recipient.userId === user.id) || null,
-┊45┊  ┊    message: (recipient: RecipientDb): MessageDb | null => {
-┊46┊  ┊      const chat = chats.find(chat => recipient.chatId === chat.id);
-┊47┊  ┊      return chat ? chat.messages.find(message => recipient.messageId === message.id) || null : null;
+┊  ┊44┊    user: (recipient) => users.find(user => recipient.userId === user.id)!,
+┊  ┊45┊    message: (recipient) => {
+┊  ┊46┊      const chat = chats.find(chat => recipient.chatId === chat.id)!;
+┊  ┊47┊      return chat.messages.find(message => recipient.messageId === message.id)!;
 ┊48┊48┊    },
-┊49┊  ┊    chat: (recipient: RecipientDb): ChatDb | null => chats.find(chat => recipient.chatId === chat.id) || null,
+┊  ┊49┊    chat: (recipient) => chats.find(chat => recipient.chatId === chat.id)!,
 ┊50┊50┊  },
 ┊51┊51┊};
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
-┊1┊ ┊import { db } from "../db";
-┊2┊ ┊import { IResolvers } from '../types';
+┊ ┊1┊import { IResolvers } from "../types";
+┊ ┊2┊import { ChatDb, db, MessageDb, MessageType, RecipientDb } from "../db";
+┊ ┊3┊import moment from "moment";
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
+┊   ┊ 18┊      if (!users.find(user => user.id === Number(recipientId))) {
+┊   ┊ 19┊        throw new Error(`Recipient ${recipientId} doesn't exist.`);
+┊   ┊ 20┊      }
+┊   ┊ 21┊
+┊   ┊ 22┊      const chat = chats.find(chat => !chat.name && chat.allTimeMemberIds.includes(currentUser) && chat.allTimeMemberIds.includes(Number(recipientId)));
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
+┊   ┊ 37┊        const chat: ChatDb = {
+┊   ┊ 38┊          id,
+┊   ┊ 39┊          name: null,
+┊   ┊ 40┊          picture: null,
+┊   ┊ 41┊          adminIds: null,
+┊   ┊ 42┊          ownerId: null,
+┊   ┊ 43┊          allTimeMemberIds: [currentUser, Number(recipientId)],
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
+┊   ┊ 54┊      recipientIds.forEach(recipientId => {
+┊   ┊ 55┊        if (!users.find(user => user.id === Number(recipientId))) {
+┊   ┊ 56┊          throw new Error(`Recipient ${recipientId} doesn't exist.`);
+┊   ┊ 57┊        }
+┊   ┊ 58┊      });
+┊   ┊ 59┊
+┊   ┊ 60┊      const id = (chats.length && chats[chats.length - 1].id + 1) || 1;
+┊   ┊ 61┊      const chat: ChatDb = {
+┊   ┊ 62┊        id,
+┊   ┊ 63┊        name: groupName,
+┊   ┊ 64┊        picture: null,
+┊   ┊ 65┊        adminIds: [currentUser],
+┊   ┊ 66┊        ownerId: currentUser,
+┊   ┊ 67┊        allTimeMemberIds: [currentUser, ...recipientIds.map(id => Number(id))],
+┊   ┊ 68┊        listingMemberIds: [currentUser, ...recipientIds.map(id => Number(id))],
+┊   ┊ 69┊        actualGroupMemberIds: [currentUser, ...recipientIds.map(id => Number(id))],
+┊   ┊ 70┊        messages: [],
+┊   ┊ 71┊      };
+┊   ┊ 72┊      chats.push(chat);
+┊   ┊ 73┊      return chat;
+┊   ┊ 74┊    },
+┊   ┊ 75┊    removeChat: (obj, {chatId}) => {
+┊   ┊ 76┊      const chat = chats.find(chat => chat.id === Number(chatId));
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
+┊   ┊ 89┊        const messages = chat.messages.reduce<MessageDb[]>((filtered, message) => {
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
+┊   ┊106┊          chats = chats.filter(chat => chat.id !== Number(chatId));
+┊   ┊107┊        } else {
+┊   ┊108┊          // Update the chat
+┊   ┊109┊          chats = chats.map(chat => {
+┊   ┊110┊            if (chat.id === Number(chatId)) {
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
+┊   ┊124┊        const messages = chat.messages.reduce<MessageDb[]>((filtered, message) => {
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
+┊   ┊141┊          chats = chats.filter(chat => chat.id !== Number(chatId));
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
+┊   ┊159┊            if (chat.id === Number(chatId)) {
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
+┊   ┊173┊      let chat = chats.find(chat => chat.id === Number(chatId));
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
+┊   ┊194┊            if (chat.id === Number(chatId)) {
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
+┊   ┊213┊      let recipients: RecipientDb[] = [];
+┊   ┊214┊
+┊   ┊215┊      holderIds.forEach(holderId => {
+┊   ┊216┊        if (holderId !== currentUser) {
+┊   ┊217┊          recipients.push({
+┊   ┊218┊            userId: holderId,
+┊   ┊219┊            messageId: id,
+┊   ┊220┊            chatId: Number(chatId),
+┊   ┊221┊            receivedAt: null,
+┊   ┊222┊            readAt: null,
+┊   ┊223┊          });
+┊   ┊224┊        }
+┊   ┊225┊      });
+┊   ┊226┊
+┊   ┊227┊      const message: MessageDb = {
+┊   ┊228┊        id,
+┊   ┊229┊        chatId: Number(chatId),
+┊   ┊230┊        senderId: currentUser,
+┊   ┊231┊        content,
+┊   ┊232┊        createdAt: moment().unix(),
+┊   ┊233┊        type: MessageType.TEXT,
+┊   ┊234┊        recipients,
+┊   ┊235┊        holderIds,
+┊   ┊236┊      };
+┊   ┊237┊
+┊   ┊238┊      chats = chats.map(chat => {
+┊   ┊239┊        if (chat.id === Number(chatId)) {
+┊   ┊240┊          chat = {...chat, messages: chat.messages.concat(message)}
+┊   ┊241┊        }
+┊   ┊242┊        return chat;
+┊   ┊243┊      });
+┊   ┊244┊
+┊   ┊245┊      return message;
+┊   ┊246┊    },
+┊   ┊247┊    removeMessages: (obj, {chatId, messageIds, all}) => {
+┊   ┊248┊      const chat = chats.find(chat => chat.id === Number(chatId));
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
+┊   ┊262┊      let deletedIds: string[] = [];
+┊   ┊263┊      chats = chats.map(chat => {
+┊   ┊264┊        if (chat.id === Number(chatId)) {
+┊   ┊265┊          // Instead of chaining map and filter we can loop once using reduce
+┊   ┊266┊          const messages = chat.messages.reduce<MessageDb[]>((filtered, message) => {
+┊   ┊267┊            if (all || messageIds!.map(Number).includes(message.id)) {
+┊   ┊268┊              deletedIds.push(String(message.id));
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
+┊   ┊ 92┊  removeChat?: Maybe<string>;
+┊   ┊ 93┊
+┊   ┊ 94┊  addMessage?: Maybe<Message>;
+┊   ┊ 95┊
+┊   ┊ 96┊  removeMessages?: Maybe<(Maybe<string>)[]>;
+┊   ┊ 97┊
+┊   ┊ 98┊  addMembers?: Maybe<(Maybe<string>)[]>;
+┊   ┊ 99┊
+┊   ┊100┊  removeMembers?: Maybe<(Maybe<string>)[]>;
+┊   ┊101┊
+┊   ┊102┊  addAdmins?: Maybe<(Maybe<string>)[]>;
+┊   ┊103┊
+┊   ┊104┊  removeAdmins?: Maybe<(Maybe<string>)[]>;
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
+┊   ┊126┊  recipientId: string;
+┊   ┊127┊}
+┊   ┊128┊export interface AddGroupMutationArgs {
+┊   ┊129┊  recipientIds: string[];
+┊   ┊130┊
+┊   ┊131┊  groupName: string;
+┊   ┊132┊}
+┊   ┊133┊export interface RemoveChatMutationArgs {
+┊   ┊134┊  chatId: string;
+┊   ┊135┊}
+┊   ┊136┊export interface AddMessageMutationArgs {
+┊   ┊137┊  chatId: string;
+┊   ┊138┊
+┊   ┊139┊  content: string;
+┊   ┊140┊}
+┊   ┊141┊export interface RemoveMessagesMutationArgs {
+┊   ┊142┊  chatId: string;
+┊   ┊143┊
+┊   ┊144┊  messageIds?: Maybe<(Maybe<string>)[]>;
+┊   ┊145┊
+┊   ┊146┊  all?: Maybe<boolean>;
+┊   ┊147┊}
+┊   ┊148┊export interface AddMembersMutationArgs {
+┊   ┊149┊  groupId: string;
+┊   ┊150┊
+┊   ┊151┊  userIds: string[];
+┊   ┊152┊}
+┊   ┊153┊export interface RemoveMembersMutationArgs {
+┊   ┊154┊  groupId: string;
+┊   ┊155┊
+┊   ┊156┊  userIds: string[];
+┊   ┊157┊}
+┊   ┊158┊export interface AddAdminsMutationArgs {
+┊   ┊159┊  groupId: string;
+┊   ┊160┊
+┊   ┊161┊  userIds: string[];
+┊   ┊162┊}
+┊   ┊163┊export interface RemoveAdminsMutationArgs {
+┊   ┊164┊  groupId: string;
+┊   ┊165┊
+┊   ┊166┊  userIds: string[];
+┊   ┊167┊}
+┊   ┊168┊export interface SetGroupNameMutationArgs {
+┊   ┊169┊  groupId: string;
+┊   ┊170┊}
+┊   ┊171┊export interface SetGroupPictureMutationArgs {
+┊   ┊172┊  groupId: string;
+┊   ┊173┊}
+┊   ┊174┊export interface MarkAsReceivedMutationArgs {
+┊   ┊175┊  chatId: string;
+┊   ┊176┊}
+┊   ┊177┊export interface MarkAsReadMutationArgs {
+┊   ┊178┊  chatId: string;
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
+┊   ┊496┊    addChat?: AddChatResolver<Maybe<ChatDb>, TypeParent, Context>;
+┊   ┊497┊
+┊   ┊498┊    addGroup?: AddGroupResolver<Maybe<ChatDb>, TypeParent, Context>;
+┊   ┊499┊
+┊   ┊500┊    removeChat?: RemoveChatResolver<Maybe<string>, TypeParent, Context>;
+┊   ┊501┊
+┊   ┊502┊    addMessage?: AddMessageResolver<Maybe<MessageDb>, TypeParent, Context>;
+┊   ┊503┊
+┊   ┊504┊    removeMessages?: RemoveMessagesResolver<
+┊   ┊505┊      Maybe<(Maybe<string>)[]>,
+┊   ┊506┊      TypeParent,
+┊   ┊507┊      Context
+┊   ┊508┊    >;
+┊   ┊509┊
+┊   ┊510┊    addMembers?: AddMembersResolver<
+┊   ┊511┊      Maybe<(Maybe<string>)[]>,
+┊   ┊512┊      TypeParent,
+┊   ┊513┊      Context
+┊   ┊514┊    >;
+┊   ┊515┊
+┊   ┊516┊    removeMembers?: RemoveMembersResolver<
+┊   ┊517┊      Maybe<(Maybe<string>)[]>,
+┊   ┊518┊      TypeParent,
+┊   ┊519┊      Context
+┊   ┊520┊    >;
+┊   ┊521┊
+┊   ┊522┊    addAdmins?: AddAdminsResolver<
+┊   ┊523┊      Maybe<(Maybe<string>)[]>,
+┊   ┊524┊      TypeParent,
+┊   ┊525┊      Context
+┊   ┊526┊    >;
+┊   ┊527┊
+┊   ┊528┊    removeAdmins?: RemoveAdminsResolver<
+┊   ┊529┊      Maybe<(Maybe<string>)[]>,
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
+┊   ┊552┊    R = Maybe<ChatDb>,
+┊   ┊553┊    Parent = {},
+┊   ┊554┊    Context = {}
+┊   ┊555┊  > = Resolver<R, Parent, Context, AddChatArgs>;
+┊   ┊556┊  export interface AddChatArgs {
+┊   ┊557┊    recipientId: string;
+┊   ┊558┊  }
+┊   ┊559┊
+┊   ┊560┊  export type AddGroupResolver<
+┊   ┊561┊    R = Maybe<ChatDb>,
+┊   ┊562┊    Parent = {},
+┊   ┊563┊    Context = {}
+┊   ┊564┊  > = Resolver<R, Parent, Context, AddGroupArgs>;
+┊   ┊565┊  export interface AddGroupArgs {
+┊   ┊566┊    recipientIds: string[];
+┊   ┊567┊
+┊   ┊568┊    groupName: string;
+┊   ┊569┊  }
+┊   ┊570┊
+┊   ┊571┊  export type RemoveChatResolver<
+┊   ┊572┊    R = Maybe<string>,
+┊   ┊573┊    Parent = {},
+┊   ┊574┊    Context = {}
+┊   ┊575┊  > = Resolver<R, Parent, Context, RemoveChatArgs>;
+┊   ┊576┊  export interface RemoveChatArgs {
+┊   ┊577┊    chatId: string;
+┊   ┊578┊  }
+┊   ┊579┊
+┊   ┊580┊  export type AddMessageResolver<
+┊   ┊581┊    R = Maybe<MessageDb>,
+┊   ┊582┊    Parent = {},
+┊   ┊583┊    Context = {}
+┊   ┊584┊  > = Resolver<R, Parent, Context, AddMessageArgs>;
+┊   ┊585┊  export interface AddMessageArgs {
+┊   ┊586┊    chatId: string;
+┊   ┊587┊
+┊   ┊588┊    content: string;
+┊   ┊589┊  }
+┊   ┊590┊
+┊   ┊591┊  export type RemoveMessagesResolver<
+┊   ┊592┊    R = Maybe<(Maybe<string>)[]>,
+┊   ┊593┊    Parent = {},
+┊   ┊594┊    Context = {}
+┊   ┊595┊  > = Resolver<R, Parent, Context, RemoveMessagesArgs>;
+┊   ┊596┊  export interface RemoveMessagesArgs {
+┊   ┊597┊    chatId: string;
+┊   ┊598┊
+┊   ┊599┊    messageIds?: Maybe<(Maybe<string>)[]>;
+┊   ┊600┊
+┊   ┊601┊    all?: Maybe<boolean>;
+┊   ┊602┊  }
+┊   ┊603┊
+┊   ┊604┊  export type AddMembersResolver<
+┊   ┊605┊    R = Maybe<(Maybe<string>)[]>,
+┊   ┊606┊    Parent = {},
+┊   ┊607┊    Context = {}
+┊   ┊608┊  > = Resolver<R, Parent, Context, AddMembersArgs>;
+┊   ┊609┊  export interface AddMembersArgs {
+┊   ┊610┊    groupId: string;
+┊   ┊611┊
+┊   ┊612┊    userIds: string[];
+┊   ┊613┊  }
+┊   ┊614┊
+┊   ┊615┊  export type RemoveMembersResolver<
+┊   ┊616┊    R = Maybe<(Maybe<string>)[]>,
+┊   ┊617┊    Parent = {},
+┊   ┊618┊    Context = {}
+┊   ┊619┊  > = Resolver<R, Parent, Context, RemoveMembersArgs>;
+┊   ┊620┊  export interface RemoveMembersArgs {
+┊   ┊621┊    groupId: string;
+┊   ┊622┊
+┊   ┊623┊    userIds: string[];
+┊   ┊624┊  }
+┊   ┊625┊
+┊   ┊626┊  export type AddAdminsResolver<
+┊   ┊627┊    R = Maybe<(Maybe<string>)[]>,
+┊   ┊628┊    Parent = {},
+┊   ┊629┊    Context = {}
+┊   ┊630┊  > = Resolver<R, Parent, Context, AddAdminsArgs>;
+┊   ┊631┊  export interface AddAdminsArgs {
+┊   ┊632┊    groupId: string;
+┊   ┊633┊
+┊   ┊634┊    userIds: string[];
+┊   ┊635┊  }
+┊   ┊636┊
+┊   ┊637┊  export type RemoveAdminsResolver<
+┊   ┊638┊    R = Maybe<(Maybe<string>)[]>,
+┊   ┊639┊    Parent = {},
+┊   ┊640┊    Context = {}
+┊   ┊641┊  > = Resolver<R, Parent, Context, RemoveAdminsArgs>;
+┊   ┊642┊  export interface RemoveAdminsArgs {
+┊   ┊643┊    groupId: string;
+┊   ┊644┊
+┊   ┊645┊    userIds: string[];
+┊   ┊646┊  }
+┊   ┊647┊
+┊   ┊648┊  export type SetGroupNameResolver<
+┊   ┊649┊    R = Maybe<string>,
+┊   ┊650┊    Parent = {},
+┊   ┊651┊    Context = {}
+┊   ┊652┊  > = Resolver<R, Parent, Context, SetGroupNameArgs>;
+┊   ┊653┊  export interface SetGroupNameArgs {
+┊   ┊654┊    groupId: string;
+┊   ┊655┊  }
+┊   ┊656┊
+┊   ┊657┊  export type SetGroupPictureResolver<
+┊   ┊658┊    R = Maybe<string>,
+┊   ┊659┊    Parent = {},
+┊   ┊660┊    Context = {}
+┊   ┊661┊  > = Resolver<R, Parent, Context, SetGroupPictureArgs>;
+┊   ┊662┊  export interface SetGroupPictureArgs {
+┊   ┊663┊    groupId: string;
+┊   ┊664┊  }
+┊   ┊665┊
+┊   ┊666┊  export type MarkAsReceivedResolver<
+┊   ┊667┊    R = Maybe<boolean>,
+┊   ┊668┊    Parent = {},
+┊   ┊669┊    Context = {}
+┊   ┊670┊  > = Resolver<R, Parent, Context, MarkAsReceivedArgs>;
+┊   ┊671┊  export interface MarkAsReceivedArgs {
+┊   ┊672┊    chatId: string;
+┊   ┊673┊  }
+┊   ┊674┊
+┊   ┊675┊  export type MarkAsReadResolver<
+┊   ┊676┊    R = Maybe<boolean>,
+┊   ┊677┊    Parent = {},
+┊   ┊678┊    Context = {}
+┊   ┊679┊  > = Resolver<R, Parent, Context, MarkAsReadArgs>;
+┊   ┊680┊  export interface MarkAsReadArgs {
+┊   ┊681┊    chatId: string;
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

#### Step 3.3: NOT FOUND!

[}]: #



[//]: # (foot-start)

[{]: <helper> (navStep)

| [< Previous Step](step2.md) | [Next Step >](step4.md) |
|:--------------------------------|--------------------------------:|

[}]: #

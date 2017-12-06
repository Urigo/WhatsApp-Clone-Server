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
@@ -0,0 +1,10 @@
+┊  ┊ 1┊import { makeExecutableSchema } from 'graphql-tools';
+┊  ┊ 2┊import { typeDefs } from "./typeDefs";
+┊  ┊ 3┊import { resolvers } from "./resolvers";
+┊  ┊ 4┊import { IExecutableSchemaDefinition } from "graphql-tools/dist/Interfaces";
+┊  ┊ 5┊import { GraphQLSchema } from "graphql";
+┊  ┊ 6┊
+┊  ┊ 7┊export const schema: GraphQLSchema = makeExecutableSchema(<IExecutableSchemaDefinition>{
+┊  ┊ 8┊  typeDefs,
+┊  ┊ 9┊  resolvers,
+┊  ┊10┊});🚫↵
```

##### Added schema&#x2F;resolvers.ts
```diff
@@ -0,0 +1,6 @@
+┊ ┊1┊import { IResolvers } from "graphql-tools/dist/Interfaces";
+┊ ┊2┊
+┊ ┊3┊export const resolvers: IResolvers = {
+┊ ┊4┊  Query: {
+┊ ┊5┊  },
+┊ ┊6┊};
```

##### Added schema&#x2F;typeDefs.ts
```diff
@@ -0,0 +1,4 @@
+┊ ┊1┊import { ITypeDefinitions } from "graphql-tools/dist/Interfaces";
+┊ ┊2┊
+┊ ┊3┊export const typeDefs: ITypeDefinitions = `
+┊ ┊4┊`;
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
+┊  ┊ 5┊import { graphiqlExpress, graphqlExpress } from "apollo-server-express";
+┊  ┊ 6┊
+┊  ┊ 7┊const PORT = 3000;
+┊  ┊ 8┊
+┊  ┊ 9┊const app = express();
+┊  ┊10┊
+┊  ┊11┊app.use(cors());
+┊  ┊12┊app.use(bodyParser.json());
+┊  ┊13┊
+┊  ┊14┊app.use('/graphql', graphqlExpress(req => ({
+┊  ┊15┊  schema: schema,
+┊  ┊16┊  context: req,
+┊  ┊17┊})));
+┊  ┊18┊
+┊  ┊19┊app.use('/graphiql', graphiqlExpress({
+┊  ┊20┊  endpointURL: '/graphql',
+┊  ┊21┊}));
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
@@ -1,6 +1,51 @@
+┊  ┊ 1┊import { Chat, db, Message, Recipient, User } from "../db";
 ┊ 1┊ 2┊import { IResolvers } from "graphql-tools/dist/Interfaces";
 ┊ 2┊ 3┊
+┊  ┊ 4┊let users = db.users;
+┊  ┊ 5┊let chats = db.chats;
+┊  ┊ 6┊const currentUser = 1;
+┊  ┊ 7┊
 ┊ 3┊ 8┊export const resolvers: IResolvers = {
 ┊ 4┊ 9┊  Query: {
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
+┊  ┊25┊    messages: (chat: Chat, {amount = null}: {amount: number}): Message[] => {
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
 ┊ 5┊50┊  },
 ┊ 6┊51┊};
```

##### Changed schema&#x2F;typeDefs.ts
```diff
@@ -1,4 +1,70 @@
 ┊ 1┊ 1┊import { ITypeDefinitions } from "graphql-tools/dist/Interfaces";
 ┊ 2┊ 2┊
 ┊ 3┊ 3┊export const typeDefs: ITypeDefinitions = `
+┊  ┊ 4┊  type Query {
+┊  ┊ 5┊    users: [User!]
+┊  ┊ 6┊    chats: [Chat!]
+┊  ┊ 7┊    chat(chatId: ID!): Chat
+┊  ┊ 8┊  }
+┊  ┊ 9┊
+┊  ┊10┊  enum MessageType {
+┊  ┊11┊    LOCATION
+┊  ┊12┊    TEXT
+┊  ┊13┊    PICTURE
+┊  ┊14┊  }
+┊  ┊15┊  
+┊  ┊16┊  type Chat {
+┊  ┊17┊    #May be a chat or a group
+┊  ┊18┊    id: ID!
+┊  ┊19┊    #Computed for chats
+┊  ┊20┊    name: String
+┊  ┊21┊    #Computed for chats
+┊  ┊22┊    picture: String
+┊  ┊23┊    #All members, current and past ones.
+┊  ┊24┊    allTimeMembers: [User!]!
+┊  ┊25┊    #Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
+┊  ┊26┊    listingMembers: [User!]!
+┊  ┊27┊    #Actual members of the group (they are not the only ones who get the group listed). Null for chats.
+┊  ┊28┊    actualGroupMembers: [User!]!
+┊  ┊29┊    #Null for chats
+┊  ┊30┊    admins: [User!]
+┊  ┊31┊    #If null the group is read-only. Null for chats.
+┊  ┊32┊    owner: User
+┊  ┊33┊    messages(amount: Int): [Message]!
+┊  ┊34┊    #Computed property
+┊  ┊35┊    unreadMessages: Int!
+┊  ┊36┊    #Computed property
+┊  ┊37┊    isGroup: Boolean!
+┊  ┊38┊  }
+┊  ┊39┊
+┊  ┊40┊  type Message {
+┊  ┊41┊    id: ID!
+┊  ┊42┊    sender: User!
+┊  ┊43┊    chat: Chat!
+┊  ┊44┊    content: String!
+┊  ┊45┊    createdAt: String!
+┊  ┊46┊    #FIXME: should return MessageType
+┊  ┊47┊    type: Int!
+┊  ┊48┊    #Whoever received the message
+┊  ┊49┊    recipients: [Recipient!]!
+┊  ┊50┊    #Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise
+┊  ┊51┊    holders: [User!]!
+┊  ┊52┊    #Computed property
+┊  ┊53┊    ownership: Boolean!
+┊  ┊54┊  }
+┊  ┊55┊  
+┊  ┊56┊  type Recipient {
+┊  ┊57┊    user: User!
+┊  ┊58┊    message: Message!
+┊  ┊59┊    chat: Chat!
+┊  ┊60┊    receivedAt: String
+┊  ┊61┊    readAt: String
+┊  ┊62┊  }
+┊  ┊63┊
+┊  ┊64┊  type User {
+┊  ┊65┊    id: ID!
+┊  ┊66┊    name: String
+┊  ┊67┊    picture: String
+┊  ┊68┊    phone: String
+┊  ┊69┊  }
 ┊ 4┊70┊`;
```

[}]: #

# Chapter 6

First, let's install `graphql-code-generator`  in our server and add it to the run scripts:

    $ npm install graphql-code-generator

[{]: <helper> (diffStep "2.1")

#### Step 2.1: Install graphql-code-generator

##### Changed package.json
```diff
@@ -4,7 +4,8 @@
 ┊ 4┊ 4┊  "private": true,
 ┊ 5┊ 5┊  "scripts": {
 ┊ 6┊ 6┊    "start": "npm run build:live",
-┊ 7┊  ┊    "build:live": "nodemon --exec ./node_modules/.bin/ts-node -- ./index.ts"
+┊  ┊ 7┊    "build:live": "nodemon --exec ./node_modules/.bin/ts-node -- ./index.ts",
+┊  ┊ 8┊    "generator": "gql-gen --url http://localhost:3000/graphql --template ts --out ./types.d.ts"
 ┊ 8┊ 9┊  },
 ┊ 9┊10┊  "devDependencies": {
 ┊10┊11┊    "@types/body-parser": "1.17.0",
```
```diff
@@ -22,6 +23,7 @@
 ┊22┊23┊    "cors": "2.8.4",
 ┊23┊24┊    "express": "4.16.3",
 ┊24┊25┊    "graphql": "0.13.2",
+┊  ┊26┊    "graphql-code-generator": "0.9.1",
 ┊25┊27┊    "graphql-tools": "3.0.1",
 ┊26┊28┊    "moment": "2.22.1"
 ┊27┊29┊  }
```

[}]: #

Now let's run the generator (the server must be running in the background):

    $ npm run generator

Those are the types created with `npm run generator`:

[{]: <helper> (diffStep "2.2")

#### Step 2.2: Create types with generator

##### Changed package.json
```diff
@@ -5,7 +5,7 @@
 ┊ 5┊ 5┊  "scripts": {
 ┊ 6┊ 6┊    "start": "npm run build:live",
 ┊ 7┊ 7┊    "build:live": "nodemon --exec ./node_modules/.bin/ts-node -- ./index.ts",
-┊ 8┊  ┊    "generator": "gql-gen --url http://localhost:3000/graphql --template ts --out ./types.d.ts"
+┊  ┊ 8┊    "generator": "gql-gen --schema http://localhost:3000/graphql --template ts --out ./types.d.ts"
 ┊ 9┊ 9┊  },
 ┊10┊10┊  "devDependencies": {
 ┊11┊11┊    "@types/body-parser": "1.17.0",
```
```diff
@@ -24,6 +24,7 @@
 ┊24┊24┊    "express": "4.16.3",
 ┊25┊25┊    "graphql": "0.13.2",
 ┊26┊26┊    "graphql-code-generator": "0.9.1",
+┊  ┊27┊    "graphql-codegen-typescript-template": "0.9.1",
 ┊27┊28┊    "graphql-tools": "3.0.1",
 ┊28┊29┊    "moment": "2.22.1"
 ┊29┊30┊  }
```

##### Added types.d.ts
```diff
@@ -0,0 +1,60 @@
+┊  ┊ 1┊/* tslint:disable */
+┊  ┊ 2┊
+┊  ┊ 3┊export interface Query {
+┊  ┊ 4┊  users?: User[] | null;
+┊  ┊ 5┊  chats?: Chat[] | null;
+┊  ┊ 6┊  chat?: Chat | null;
+┊  ┊ 7┊}
+┊  ┊ 8┊
+┊  ┊ 9┊export interface User {
+┊  ┊10┊  id: string;
+┊  ┊11┊  name?: string | null;
+┊  ┊12┊  picture?: string | null;
+┊  ┊13┊  phone?: string | null;
+┊  ┊14┊}
+┊  ┊15┊
+┊  ┊16┊export interface Chat {
+┊  ┊17┊  id: string /** May be a chat or a group */;
+┊  ┊18┊  name?: string | null /** Computed for chats */;
+┊  ┊19┊  picture?: string | null /** Computed for chats */;
+┊  ┊20┊  allTimeMembers: User[] /** All members, current and past ones. */;
+┊  ┊21┊  listingMembers: User[] /** Whoever gets the chat listed. For groups includes past members who still didn't delete the group. */;
+┊  ┊22┊  actualGroupMembers: User[] /** Actual members of the group (they are not the only ones who get the group listed). Null for chats. */;
+┊  ┊23┊  admins?: User[] | null /** Null for chats */;
+┊  ┊24┊  owner?: User | null /** If null the group is read-only. Null for chats. */;
+┊  ┊25┊  messages: (Message | null)[];
+┊  ┊26┊  unreadMessages: number /** Computed property */;
+┊  ┊27┊  isGroup: boolean /** Computed property */;
+┊  ┊28┊}
+┊  ┊29┊
+┊  ┊30┊export interface Message {
+┊  ┊31┊  id: string;
+┊  ┊32┊  sender: User;
+┊  ┊33┊  chat: Chat;
+┊  ┊34┊  content: string;
+┊  ┊35┊  createdAt: string;
+┊  ┊36┊  type: number /** FIXME: should return MessageType */;
+┊  ┊37┊  recipients: Recipient[] /** Whoever received the message */;
+┊  ┊38┊  holders: User[] /** Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise */;
+┊  ┊39┊  ownership: boolean /** Computed property */;
+┊  ┊40┊}
+┊  ┊41┊
+┊  ┊42┊export interface Recipient {
+┊  ┊43┊  user: User;
+┊  ┊44┊  message: Message;
+┊  ┊45┊  chat: Chat;
+┊  ┊46┊  receivedAt?: string | null;
+┊  ┊47┊  readAt?: string | null;
+┊  ┊48┊}
+┊  ┊49┊export interface ChatQueryArgs {
+┊  ┊50┊  chatId: string;
+┊  ┊51┊}
+┊  ┊52┊export interface MessagesChatArgs {
+┊  ┊53┊  amount?: number | null;
+┊  ┊54┊}
+┊  ┊55┊
+┊  ┊56┊export enum MessageType {
+┊  ┊57┊  LOCATION = "LOCATION",
+┊  ┊58┊  TEXT = "TEXT",
+┊  ┊59┊  PICTURE = "PICTURE"
+┊  ┊60┊}
```

[}]: #

Now let's use them:

[{]: <helper> (diffStep "2.3")

#### Step 2.3: Use our types

##### Changed schema&#x2F;resolvers.ts
```diff
@@ -1,5 +1,6 @@
 ┊1┊1┊import { Chat, db, Message, Recipient, User } from "../db";
 ┊2┊2┊import { IResolvers } from "graphql-tools/dist/Interfaces";
+┊ ┊3┊import { ChatQueryArgs } from "../types";
 ┊3┊4┊
 ┊4┊5┊let users = db.users;
 ┊5┊6┊let chats = db.chats;
```
```diff
@@ -10,7 +11,7 @@
 ┊10┊11┊    // Show all users for the moment.
 ┊11┊12┊    users: (): User[] => users.filter(user => user.id !== currentUser),
 ┊12┊13┊    chats: (): Chat[] => chats.filter(chat => chat.listingMemberIds.includes(currentUser)),
-┊13┊  ┊    chat: (obj: any, {chatId}): Chat | null => chats.find(chat => chat.id === chatId) || null,
+┊  ┊14┊    chat: (obj: any, {chatId}: ChatQueryArgs): Chat | null => chats.find(chat => chat.id === Number(chatId)) || null,
 ┊14┊15┊  },
 ┊15┊16┊  Chat: {
 ┊16┊17┊    name: (chat: Chat): string => chat.name ? chat.name : users
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
-┊1┊ ┊import { Chat, db, Message, Recipient, User } from "../db";
+┊ ┊1┊import { Chat, db, Message, MessageType, Recipient, User } from "../db";
 ┊2┊2┊import { IResolvers } from "graphql-tools/dist/Interfaces";
 ┊3┊3┊import { ChatQueryArgs } from "../types";
+┊ ┊4┊import * as moment from "moment";
 ┊4┊5┊
 ┊5┊6┊let users = db.users;
 ┊6┊7┊let chats = db.chats;
```
```diff
@@ -13,6 +14,276 @@
 ┊ 13┊ 14┊    chats: (): Chat[] => chats.filter(chat => chat.listingMemberIds.includes(currentUser)),
 ┊ 14┊ 15┊    chat: (obj: any, {chatId}: ChatQueryArgs): Chat | null => chats.find(chat => chat.id === Number(chatId)) || null,
 ┊ 15┊ 16┊  },
+┊   ┊ 17┊  Mutation: {
+┊   ┊ 18┊    addChat: (obj: any, {recipientId}: any): Chat => {
+┊   ┊ 19┊      if (!users.find(user => user.id === recipientId)) {
+┊   ┊ 20┊        throw new Error(`Recipient ${recipientId} doesn't exist.`);
+┊   ┊ 21┊      }
+┊   ┊ 22┊
+┊   ┊ 23┊      const chat = chats.find(chat => !chat.name && chat.allTimeMemberIds.includes(currentUser) && chat.allTimeMemberIds.includes(recipientId));
+┊   ┊ 24┊      if (chat) {
+┊   ┊ 25┊        // Chat already exists. Both users are already in the allTimeMemberIds array
+┊   ┊ 26┊        const chatId = chat.id;
+┊   ┊ 27┊        if (!chat.listingMemberIds.includes(currentUser)) {
+┊   ┊ 28┊          // The chat isn't listed for the current user. Add him to the memberIds
+┊   ┊ 29┊          chat.listingMemberIds.push(currentUser);
+┊   ┊ 30┊          chats.find(chat => chat.id === chatId)!.listingMemberIds.push(currentUser);
+┊   ┊ 31┊          return chat;
+┊   ┊ 32┊        } else {
+┊   ┊ 33┊          throw new Error(`Chat already exists.`);
+┊   ┊ 34┊        }
+┊   ┊ 35┊      } else {
+┊   ┊ 36┊        // Create the chat
+┊   ┊ 37┊        const id = (chats.length && chats[chats.length - 1].id + 1) || 1;
+┊   ┊ 38┊        const chat: Chat = {
+┊   ┊ 39┊          id,
+┊   ┊ 40┊          name: null,
+┊   ┊ 41┊          picture: null,
+┊   ┊ 42┊          adminIds: null,
+┊   ┊ 43┊          ownerId: null,
+┊   ┊ 44┊          allTimeMemberIds: [currentUser, recipientId],
+┊   ┊ 45┊          // Chat will not be listed to the other user until the first message gets written
+┊   ┊ 46┊          listingMemberIds: [currentUser],
+┊   ┊ 47┊          actualGroupMemberIds: null,
+┊   ┊ 48┊          messages: [],
+┊   ┊ 49┊        };
+┊   ┊ 50┊        chats.push(chat);
+┊   ┊ 51┊        return chat;
+┊   ┊ 52┊      }
+┊   ┊ 53┊    },
+┊   ┊ 54┊    addGroup: (obj: any, {recipientIds, groupName}: any): Chat => {
+┊   ┊ 55┊      recipientIds.forEach((recipientId: any) => {
+┊   ┊ 56┊        if (!users.find(user => user.id === recipientId)) {
+┊   ┊ 57┊          throw new Error(`Recipient ${recipientId} doesn't exist.`);
+┊   ┊ 58┊        }
+┊   ┊ 59┊      });
+┊   ┊ 60┊
+┊   ┊ 61┊      const id = (chats.length && chats[chats.length - 1].id + 1) || 1;
+┊   ┊ 62┊      const chat: Chat = {
+┊   ┊ 63┊        id,
+┊   ┊ 64┊        name: groupName,
+┊   ┊ 65┊        picture: null,
+┊   ┊ 66┊        adminIds: [currentUser],
+┊   ┊ 67┊        ownerId: currentUser,
+┊   ┊ 68┊        allTimeMemberIds: [currentUser, ...recipientIds],
+┊   ┊ 69┊        listingMemberIds: [currentUser, ...recipientIds],
+┊   ┊ 70┊        actualGroupMemberIds: [currentUser, ...recipientIds],
+┊   ┊ 71┊        messages: [],
+┊   ┊ 72┊      };
+┊   ┊ 73┊      chats.push(chat);
+┊   ┊ 74┊      return chat;
+┊   ┊ 75┊    },
+┊   ┊ 76┊    removeChat: (obj: any, {chatId}: any): number => {
+┊   ┊ 77┊      const chat = chats.find(chat => chat.id === chatId);
+┊   ┊ 78┊
+┊   ┊ 79┊      if (!chat) {
+┊   ┊ 80┊        throw new Error(`The chat ${chatId} doesn't exist.`);
+┊   ┊ 81┊      }
+┊   ┊ 82┊
+┊   ┊ 83┊      if (!chat.name) {
+┊   ┊ 84┊        // Chat
+┊   ┊ 85┊        if (!chat.listingMemberIds.includes(currentUser)) {
+┊   ┊ 86┊          throw new Error(`The user is not a member of the chat ${chatId}.`);
+┊   ┊ 87┊        }
+┊   ┊ 88┊
+┊   ┊ 89┊        // Instead of chaining map and filter we can loop once using reduce
+┊   ┊ 90┊        const messages = chat.messages.reduce<Message[]>((filtered, message) => {
+┊   ┊ 91┊          // Remove the current user from the message holders
+┊   ┊ 92┊          message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser);
+┊   ┊ 93┊
+┊   ┊ 94┊          if (message.holderIds.length !== 0) {
+┊   ┊ 95┊            filtered.push(message);
+┊   ┊ 96┊          } // else discard the message
+┊   ┊ 97┊
+┊   ┊ 98┊          return filtered;
+┊   ┊ 99┊        }, []);
+┊   ┊100┊
+┊   ┊101┊        // Remove the current user from who gets the chat listed. The chat will no longer appear in his list
+┊   ┊102┊        const listingMemberIds = chat.listingMemberIds.filter(listingId => listingId !== currentUser);
+┊   ┊103┊
+┊   ┊104┊        // Check how many members are left
+┊   ┊105┊        if (listingMemberIds.length === 0) {
+┊   ┊106┊          // Delete the chat
+┊   ┊107┊          chats = chats.filter(chat => chat.id !== chatId);
+┊   ┊108┊        } else {
+┊   ┊109┊          // Update the chat
+┊   ┊110┊          chats = chats.map(chat => {
+┊   ┊111┊            if (chat.id === chatId) {
+┊   ┊112┊              chat = {...chat, listingMemberIds, messages};
+┊   ┊113┊            }
+┊   ┊114┊            return chat;
+┊   ┊115┊          });
+┊   ┊116┊        }
+┊   ┊117┊        return chatId;
+┊   ┊118┊      } else {
+┊   ┊119┊        // Group
+┊   ┊120┊        if (chat.ownerId !== currentUser) {
+┊   ┊121┊          throw new Error(`Group ${chatId} is not owned by the user.`);
+┊   ┊122┊        }
+┊   ┊123┊
+┊   ┊124┊        // Instead of chaining map and filter we can loop once using reduce
+┊   ┊125┊        const messages = chat.messages.reduce<Message[]>((filtered, message) => {
+┊   ┊126┊          // Remove the current user from the message holders
+┊   ┊127┊          message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser);
+┊   ┊128┊
+┊   ┊129┊          if (message.holderIds.length !== 0) {
+┊   ┊130┊            filtered.push(message);
+┊   ┊131┊          } // else discard the message
+┊   ┊132┊
+┊   ┊133┊          return filtered;
+┊   ┊134┊        }, []);
+┊   ┊135┊
+┊   ┊136┊        // Remove the current user from who gets the group listed. The group will no longer appear in his list
+┊   ┊137┊        const listingMemberIds = chat.listingMemberIds.filter(listingId => listingId !== currentUser);
+┊   ┊138┊
+┊   ┊139┊        // Check how many members (including previous ones who can still access old messages) are left
+┊   ┊140┊        if (listingMemberIds.length === 0) {
+┊   ┊141┊          // Remove the group
+┊   ┊142┊          chats = chats.filter(chat => chat.id !== chatId);
+┊   ┊143┊        } else {
+┊   ┊144┊          // Update the group
+┊   ┊145┊
+┊   ┊146┊          // Remove the current user from the chat members. He is no longer a member of the group
+┊   ┊147┊          const actualGroupMemberIds = chat.actualGroupMemberIds!.filter(memberId => memberId !== currentUser);
+┊   ┊148┊          // Remove the current user from the chat admins
+┊   ┊149┊          const adminIds = chat.adminIds!.filter(memberId => memberId !== currentUser);
+┊   ┊150┊          // Set the owner id to be null. A null owner means the group is read-only
+┊   ┊151┊          let ownerId: number | null = null;
+┊   ┊152┊
+┊   ┊153┊          // Check if there is any admin left
+┊   ┊154┊          if (adminIds!.length) {
+┊   ┊155┊            // Pick an admin as the new owner. The group is no longer read-only
+┊   ┊156┊            ownerId = chat.adminIds![0];
+┊   ┊157┊          }
+┊   ┊158┊
+┊   ┊159┊          chats = chats.map(chat => {
+┊   ┊160┊            if (chat.id === chatId) {
+┊   ┊161┊              chat = {...chat, messages, listingMemberIds, actualGroupMemberIds, adminIds, ownerId};
+┊   ┊162┊            }
+┊   ┊163┊            return chat;
+┊   ┊164┊          });
+┊   ┊165┊        }
+┊   ┊166┊        return chatId;
+┊   ┊167┊      }
+┊   ┊168┊    },
+┊   ┊169┊    addMessage: (obj: any, {chatId, content}: any): Message => {
+┊   ┊170┊      if (content === null || content === '') {
+┊   ┊171┊        throw new Error(`Cannot add empty or null messages.`);
+┊   ┊172┊      }
+┊   ┊173┊
+┊   ┊174┊      let chat = chats.find(chat => chat.id === chatId);
+┊   ┊175┊
+┊   ┊176┊      if (!chat) {
+┊   ┊177┊        throw new Error(`Cannot find chat ${chatId}.`);
+┊   ┊178┊      }
+┊   ┊179┊
+┊   ┊180┊      let holderIds = chat.listingMemberIds;
+┊   ┊181┊
+┊   ┊182┊      if (!chat.name) {
+┊   ┊183┊        // Chat
+┊   ┊184┊        if (!chat.listingMemberIds.find(listingId => listingId === currentUser)) {
+┊   ┊185┊          throw new Error(`The chat ${chatId} must be listed for the current user before adding a message.`);
+┊   ┊186┊        }
+┊   ┊187┊
+┊   ┊188┊        const recipientId = chat.allTimeMemberIds.filter(userId => userId !== currentUser)[0];
+┊   ┊189┊
+┊   ┊190┊        if (!chat.listingMemberIds.find(listingId => listingId === recipientId)) {
+┊   ┊191┊          // Chat is not listed for the recipient. Add him to the listingMemberIds
+┊   ┊192┊          const listingMemberIds = chat.listingMemberIds.concat(recipientId);
+┊   ┊193┊
+┊   ┊194┊          chats = chats.map(chat => {
+┊   ┊195┊            if (chat.id === chatId) {
+┊   ┊196┊              chat = {...chat, listingMemberIds};
+┊   ┊197┊            }
+┊   ┊198┊            return chat;
+┊   ┊199┊          });
+┊   ┊200┊
+┊   ┊201┊          holderIds = listingMemberIds;
+┊   ┊202┊        }
+┊   ┊203┊      } else {
+┊   ┊204┊        // Group
+┊   ┊205┊        if (!chat.actualGroupMemberIds!.find(memberId => memberId === currentUser)) {
+┊   ┊206┊          throw new Error(`The user is not a member of the group ${chatId}. Cannot add message.`);
+┊   ┊207┊        }
+┊   ┊208┊
+┊   ┊209┊        holderIds = chat.actualGroupMemberIds!;
+┊   ┊210┊      }
+┊   ┊211┊
+┊   ┊212┊      const id = (chat.messages.length && chat.messages[chat.messages.length - 1].id + 1) || 1;
+┊   ┊213┊
+┊   ┊214┊      let recipients: Recipient[] = [];
+┊   ┊215┊
+┊   ┊216┊      holderIds.forEach(holderId => {
+┊   ┊217┊        if (holderId !== currentUser) {
+┊   ┊218┊          recipients.push({
+┊   ┊219┊            userId: holderId,
+┊   ┊220┊            messageId: id,
+┊   ┊221┊            chatId: chatId,
+┊   ┊222┊            receivedAt: null,
+┊   ┊223┊            readAt: null,
+┊   ┊224┊          });
+┊   ┊225┊        }
+┊   ┊226┊      });
+┊   ┊227┊
+┊   ┊228┊      const message: Message = {
+┊   ┊229┊        id,
+┊   ┊230┊        chatId,
+┊   ┊231┊        senderId: currentUser,
+┊   ┊232┊        content,
+┊   ┊233┊        createdAt: moment().unix(),
+┊   ┊234┊        type: MessageType.TEXT,
+┊   ┊235┊        recipients,
+┊   ┊236┊        holderIds,
+┊   ┊237┊      };
+┊   ┊238┊
+┊   ┊239┊      chats = chats.map(chat => {
+┊   ┊240┊        if (chat.id === chatId) {
+┊   ┊241┊          chat = {...chat, messages: chat.messages.concat(message)}
+┊   ┊242┊        }
+┊   ┊243┊        return chat;
+┊   ┊244┊      });
+┊   ┊245┊
+┊   ┊246┊      return message;
+┊   ┊247┊    },
+┊   ┊248┊    removeMessages: (obj: any, {chatId, messageIds, all}: any): number[] => {
+┊   ┊249┊      const chat = chats.find(chat => chat.id === chatId);
+┊   ┊250┊
+┊   ┊251┊      if (!chat) {
+┊   ┊252┊        throw new Error(`Cannot find chat ${chatId}.`);
+┊   ┊253┊      }
+┊   ┊254┊
+┊   ┊255┊      if (!chat.listingMemberIds.find(listingId => listingId === currentUser)) {
+┊   ┊256┊        throw new Error(`The chat/group ${chatId} is not listed for the current user, so there is nothing to delete.`);
+┊   ┊257┊      }
+┊   ┊258┊
+┊   ┊259┊      if (all && messageIds) {
+┊   ┊260┊        throw new Error(`Cannot specify both 'all' and 'messageIds'.`);
+┊   ┊261┊      }
+┊   ┊262┊
+┊   ┊263┊      let deletedIds: number[] = [];
+┊   ┊264┊      chats = chats.map(chat => {
+┊   ┊265┊        if (chat.id === chatId) {
+┊   ┊266┊          // Instead of chaining map and filter we can loop once using reduce
+┊   ┊267┊          const messages = chat.messages.reduce<Message[]>((filtered, message) => {
+┊   ┊268┊            if (all || messageIds!.includes(message.id)) {
+┊   ┊269┊              deletedIds.push(message.id);
+┊   ┊270┊              // Remove the current user from the message holders
+┊   ┊271┊              message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser);
+┊   ┊272┊            }
+┊   ┊273┊
+┊   ┊274┊            if (message.holderIds.length !== 0) {
+┊   ┊275┊              filtered.push(message);
+┊   ┊276┊            } // else discard the message
+┊   ┊277┊
+┊   ┊278┊            return filtered;
+┊   ┊279┊          }, []);
+┊   ┊280┊          chat = {...chat, messages};
+┊   ┊281┊        }
+┊   ┊282┊        return chat;
+┊   ┊283┊      });
+┊   ┊284┊      return deletedIds;
+┊   ┊285┊    },
+┊   ┊286┊  },
 ┊ 16┊287┊  Chat: {
 ┊ 17┊288┊    name: (chat: Chat): string => chat.name ? chat.name : users
 ┊ 18┊289┊      .find(user => user.id === chat.allTimeMemberIds.find(userId => userId !== currentUser))!.name,
```

##### Changed schema&#x2F;typeDefs.ts
```diff
@@ -67,4 +67,20 @@
 ┊67┊67┊    picture: String
 ┊68┊68┊    phone: String
 ┊69┊69┊  }
+┊  ┊70┊
+┊  ┊71┊  type Mutation {
+┊  ┊72┊    addChat(recipientId: ID!): Chat
+┊  ┊73┊    addGroup(recipientIds: [ID!]!, groupName: String!): Chat
+┊  ┊74┊    removeChat(chatId: ID!): ID
+┊  ┊75┊    addMessage(chatId: ID!, content: String!): Message
+┊  ┊76┊    removeMessages(chatId: ID!, messageIds: [ID], all: Boolean): [ID]
+┊  ┊77┊    addMembers(groupId: ID!, userIds: [ID!]!): [ID]
+┊  ┊78┊    removeMembers(groupId: ID!, userIds: [ID!]!): [ID]
+┊  ┊79┊    addAdmins(groupId: ID!, userIds: [ID!]!): [ID]
+┊  ┊80┊    removeAdmins(groupId: ID!, userIds: [ID!]!): [ID]
+┊  ┊81┊    setGroupName(groupId: ID!): String
+┊  ┊82┊    setGroupPicture(groupId: ID!): String
+┊  ┊83┊    markAsReceived(chatId: ID!): Boolean
+┊  ┊84┊    markAsRead(chatId: ID!): Boolean
+┊  ┊85┊  }
 ┊70┊86┊`;
```

[}]: #

    $ npm run generator

[{]: <helper> (diffStep "3.3")

#### Step 3.3: Use generated types

##### Changed schema&#x2F;resolvers.ts
```diff
@@ -1,6 +1,9 @@
 ┊1┊1┊import { Chat, db, Message, MessageType, Recipient, User } from "../db";
 ┊2┊2┊import { IResolvers } from "graphql-tools/dist/Interfaces";
-┊3┊ ┊import { ChatQueryArgs } from "../types";
+┊ ┊3┊import {
+┊ ┊4┊  AddChatMutationArgs, AddGroupMutationArgs, AddMessageMutationArgs, ChatQueryArgs,
+┊ ┊5┊  RemoveChatMutationArgs, RemoveMessagesMutationArgs
+┊ ┊6┊} from "../types";
 ┊4┊7┊import * as moment from "moment";
 ┊5┊8┊
 ┊6┊9┊let users = db.users;
```
```diff
@@ -15,12 +18,12 @@
 ┊15┊18┊    chat: (obj: any, {chatId}: ChatQueryArgs): Chat | null => chats.find(chat => chat.id === Number(chatId)) || null,
 ┊16┊19┊  },
 ┊17┊20┊  Mutation: {
-┊18┊  ┊    addChat: (obj: any, {recipientId}: any): Chat => {
-┊19┊  ┊      if (!users.find(user => user.id === recipientId)) {
+┊  ┊21┊    addChat: (obj: any, {recipientId}: AddChatMutationArgs): Chat => {
+┊  ┊22┊      if (!users.find(user => user.id === Number(recipientId))) {
 ┊20┊23┊        throw new Error(`Recipient ${recipientId} doesn't exist.`);
 ┊21┊24┊      }
 ┊22┊25┊
-┊23┊  ┊      const chat = chats.find(chat => !chat.name && chat.allTimeMemberIds.includes(currentUser) && chat.allTimeMemberIds.includes(recipientId));
+┊  ┊26┊      const chat = chats.find(chat => !chat.name && chat.allTimeMemberIds.includes(currentUser) && chat.allTimeMemberIds.includes(Number(recipientId)));
 ┊24┊27┊      if (chat) {
 ┊25┊28┊        // Chat already exists. Both users are already in the allTimeMemberIds array
 ┊26┊29┊        const chatId = chat.id;
```
```diff
@@ -41,7 +44,7 @@
 ┊41┊44┊          picture: null,
 ┊42┊45┊          adminIds: null,
 ┊43┊46┊          ownerId: null,
-┊44┊  ┊          allTimeMemberIds: [currentUser, recipientId],
+┊  ┊47┊          allTimeMemberIds: [currentUser, Number(recipientId)],
 ┊45┊48┊          // Chat will not be listed to the other user until the first message gets written
 ┊46┊49┊          listingMemberIds: [currentUser],
 ┊47┊50┊          actualGroupMemberIds: null,
```
```diff
@@ -51,9 +54,9 @@
 ┊51┊54┊        return chat;
 ┊52┊55┊      }
 ┊53┊56┊    },
-┊54┊  ┊    addGroup: (obj: any, {recipientIds, groupName}: any): Chat => {
-┊55┊  ┊      recipientIds.forEach((recipientId: any) => {
-┊56┊  ┊        if (!users.find(user => user.id === recipientId)) {
+┊  ┊57┊    addGroup: (obj: any, {recipientIds, groupName}: AddGroupMutationArgs): Chat => {
+┊  ┊58┊      recipientIds.forEach(recipientId => {
+┊  ┊59┊        if (!users.find(user => user.id === Number(recipientId))) {
 ┊57┊60┊          throw new Error(`Recipient ${recipientId} doesn't exist.`);
 ┊58┊61┊        }
 ┊59┊62┊      });
```
```diff
@@ -65,16 +68,16 @@
 ┊65┊68┊        picture: null,
 ┊66┊69┊        adminIds: [currentUser],
 ┊67┊70┊        ownerId: currentUser,
-┊68┊  ┊        allTimeMemberIds: [currentUser, ...recipientIds],
-┊69┊  ┊        listingMemberIds: [currentUser, ...recipientIds],
-┊70┊  ┊        actualGroupMemberIds: [currentUser, ...recipientIds],
+┊  ┊71┊        allTimeMemberIds: [currentUser, ...recipientIds.map(id => Number(id))],
+┊  ┊72┊        listingMemberIds: [currentUser, ...recipientIds.map(id => Number(id))],
+┊  ┊73┊        actualGroupMemberIds: [currentUser, ...recipientIds.map(id => Number(id))],
 ┊71┊74┊        messages: [],
 ┊72┊75┊      };
 ┊73┊76┊      chats.push(chat);
 ┊74┊77┊      return chat;
 ┊75┊78┊    },
-┊76┊  ┊    removeChat: (obj: any, {chatId}: any): number => {
-┊77┊  ┊      const chat = chats.find(chat => chat.id === chatId);
+┊  ┊79┊    removeChat: (obj: any, {chatId}: RemoveChatMutationArgs): number => {
+┊  ┊80┊      const chat = chats.find(chat => chat.id === Number(chatId));
 ┊78┊81┊
 ┊79┊82┊      if (!chat) {
 ┊80┊83┊        throw new Error(`The chat ${chatId} doesn't exist.`);
```
```diff
@@ -104,17 +107,17 @@
 ┊104┊107┊        // Check how many members are left
 ┊105┊108┊        if (listingMemberIds.length === 0) {
 ┊106┊109┊          // Delete the chat
-┊107┊   ┊          chats = chats.filter(chat => chat.id !== chatId);
+┊   ┊110┊          chats = chats.filter(chat => chat.id !== Number(chatId));
 ┊108┊111┊        } else {
 ┊109┊112┊          // Update the chat
 ┊110┊113┊          chats = chats.map(chat => {
-┊111┊   ┊            if (chat.id === chatId) {
+┊   ┊114┊            if (chat.id === Number(chatId)) {
 ┊112┊115┊              chat = {...chat, listingMemberIds, messages};
 ┊113┊116┊            }
 ┊114┊117┊            return chat;
 ┊115┊118┊          });
 ┊116┊119┊        }
-┊117┊   ┊        return chatId;
+┊   ┊120┊        return Number(chatId);
 ┊118┊121┊      } else {
 ┊119┊122┊        // Group
 ┊120┊123┊        if (chat.ownerId !== currentUser) {
```
```diff
@@ -139,7 +142,7 @@
 ┊139┊142┊        // Check how many members (including previous ones who can still access old messages) are left
 ┊140┊143┊        if (listingMemberIds.length === 0) {
 ┊141┊144┊          // Remove the group
-┊142┊   ┊          chats = chats.filter(chat => chat.id !== chatId);
+┊   ┊145┊          chats = chats.filter(chat => chat.id !== Number(chatId));
 ┊143┊146┊        } else {
 ┊144┊147┊          // Update the group
 ┊145┊148┊
```
```diff
@@ -157,21 +160,21 @@
 ┊157┊160┊          }
 ┊158┊161┊
 ┊159┊162┊          chats = chats.map(chat => {
-┊160┊   ┊            if (chat.id === chatId) {
+┊   ┊163┊            if (chat.id === Number(chatId)) {
 ┊161┊164┊              chat = {...chat, messages, listingMemberIds, actualGroupMemberIds, adminIds, ownerId};
 ┊162┊165┊            }
 ┊163┊166┊            return chat;
 ┊164┊167┊          });
 ┊165┊168┊        }
-┊166┊   ┊        return chatId;
+┊   ┊169┊        return Number(chatId);
 ┊167┊170┊      }
 ┊168┊171┊    },
-┊169┊   ┊    addMessage: (obj: any, {chatId, content}: any): Message => {
+┊   ┊172┊    addMessage: (obj: any, {chatId, content}: AddMessageMutationArgs): Message => {
 ┊170┊173┊      if (content === null || content === '') {
 ┊171┊174┊        throw new Error(`Cannot add empty or null messages.`);
 ┊172┊175┊      }
 ┊173┊176┊
-┊174┊   ┊      let chat = chats.find(chat => chat.id === chatId);
+┊   ┊177┊      let chat = chats.find(chat => chat.id === Number(chatId));
 ┊175┊178┊
 ┊176┊179┊      if (!chat) {
 ┊177┊180┊        throw new Error(`Cannot find chat ${chatId}.`);
```
```diff
@@ -192,7 +195,7 @@
 ┊192┊195┊          const listingMemberIds = chat.listingMemberIds.concat(recipientId);
 ┊193┊196┊
 ┊194┊197┊          chats = chats.map(chat => {
-┊195┊   ┊            if (chat.id === chatId) {
+┊   ┊198┊            if (chat.id === Number(chatId)) {
 ┊196┊199┊              chat = {...chat, listingMemberIds};
 ┊197┊200┊            }
 ┊198┊201┊            return chat;
```
```diff
@@ -218,7 +221,7 @@
 ┊218┊221┊          recipients.push({
 ┊219┊222┊            userId: holderId,
 ┊220┊223┊            messageId: id,
-┊221┊   ┊            chatId: chatId,
+┊   ┊224┊            chatId: Number(chatId),
 ┊222┊225┊            receivedAt: null,
 ┊223┊226┊            readAt: null,
 ┊224┊227┊          });
```
```diff
@@ -227,7 +230,7 @@
 ┊227┊230┊
 ┊228┊231┊      const message: Message = {
 ┊229┊232┊        id,
-┊230┊   ┊        chatId,
+┊   ┊233┊        chatId: Number(chatId),
 ┊231┊234┊        senderId: currentUser,
 ┊232┊235┊        content,
 ┊233┊236┊        createdAt: moment().unix(),
```
```diff
@@ -237,7 +240,7 @@
 ┊237┊240┊      };
 ┊238┊241┊
 ┊239┊242┊      chats = chats.map(chat => {
-┊240┊   ┊        if (chat.id === chatId) {
+┊   ┊243┊        if (chat.id === Number(chatId)) {
 ┊241┊244┊          chat = {...chat, messages: chat.messages.concat(message)}
 ┊242┊245┊        }
 ┊243┊246┊        return chat;
```
```diff
@@ -245,8 +248,8 @@
 ┊245┊248┊
 ┊246┊249┊      return message;
 ┊247┊250┊    },
-┊248┊   ┊    removeMessages: (obj: any, {chatId, messageIds, all}: any): number[] => {
-┊249┊   ┊      const chat = chats.find(chat => chat.id === chatId);
+┊   ┊251┊    removeMessages: (obj: any, {chatId, messageIds, all}: RemoveMessagesMutationArgs): number[] => {
+┊   ┊252┊      const chat = chats.find(chat => chat.id === Number(chatId));
 ┊250┊253┊
 ┊251┊254┊      if (!chat) {
 ┊252┊255┊        throw new Error(`Cannot find chat ${chatId}.`);
```
```diff
@@ -262,10 +265,10 @@
 ┊262┊265┊
 ┊263┊266┊      let deletedIds: number[] = [];
 ┊264┊267┊      chats = chats.map(chat => {
-┊265┊   ┊        if (chat.id === chatId) {
+┊   ┊268┊        if (chat.id === Number(chatId)) {
 ┊266┊269┊          // Instead of chaining map and filter we can loop once using reduce
 ┊267┊270┊          const messages = chat.messages.reduce<Message[]>((filtered, message) => {
-┊268┊   ┊            if (all || messageIds!.includes(message.id)) {
+┊   ┊271┊            if (all || messageIds!.includes(String(message.id))) {
 ┊269┊272┊              deletedIds.push(message.id);
 ┊270┊273┊              // Remove the current user from the message holders
 ┊271┊274┊              message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser);
```

[}]: #



[//]: # (foot-start)

[{]: <helper> (navStep)

| [< Previous Step](step2.md) | [Next Step >](step4.md) |
|:--------------------------------|--------------------------------:|

[}]: #

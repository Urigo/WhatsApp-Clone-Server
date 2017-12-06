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
@@ -0,0 +1,20 @@
+┊  ┊ 1┊import * as Koa from 'koa';
+┊  ┊ 2┊import * as KoaRouter from 'koa-router';
+┊  ┊ 3┊import * as koaBody from 'koa-bodyparser';
+┊  ┊ 4┊import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
+┊  ┊ 5┊import { schema } from "./schema";
+┊  ┊ 6┊import * as cors from '@koa/cors';
+┊  ┊ 7┊
+┊  ┊ 8┊const app = new Koa();
+┊  ┊ 9┊const router = new KoaRouter();
+┊  ┊10┊const PORT = 3000;
+┊  ┊11┊
+┊  ┊12┊app.use(cors({
+┊  ┊13┊  origin: '*',
+┊  ┊14┊}));
+┊  ┊15┊app.use(koaBody());
+┊  ┊16┊router.post('/graphql', graphqlKoa({schema}));
+┊  ┊17┊router.get('/graphiql', graphiqlKoa({endpointURL: '/graphql'}));
+┊  ┊18┊app.use(router.routes());
+┊  ┊19┊app.use(router.allowedMethods());
+┊  ┊20┊app.listen(PORT);🚫↵
```

[}]: #

Now we want to feed our graphql server with some data, so let's install moment

    $ npm install moment

and create a fake db:

[{]: <helper> (diffStep "1.2" files="db.ts")

#### Step 1.2: Add fake db

##### Added db.ts
```diff
@@ -0,0 +1,381 @@
+┊   ┊  1┊import * as moment from 'moment';
+┊   ┊  2┊
+┊   ┊  3┊export const random = true;
+┊   ┊  4┊
+┊   ┊  5┊export function getRandomId() {
+┊   ┊  6┊  return String(Math.round(Math.random() * 1000000000000));
+┊   ┊  7┊}
+┊   ┊  8┊
+┊   ┊  9┊export enum MessageType {
+┊   ┊ 10┊  TEXT,
+┊   ┊ 11┊  LOCATION,
+┊   ┊ 12┊  PICTURE,
+┊   ┊ 13┊}
+┊   ┊ 14┊
+┊   ┊ 15┊export interface User {
+┊   ┊ 16┊  id: string,
+┊   ┊ 17┊  name: string,
+┊   ┊ 18┊  picture?: string | null,
+┊   ┊ 19┊  phone?: string | null,
+┊   ┊ 20┊}
+┊   ┊ 21┊
+┊   ┊ 22┊export interface Chat {
+┊   ┊ 23┊  id: string,
+┊   ┊ 24┊  name?: string | null,
+┊   ┊ 25┊  picture?: string | null,
+┊   ┊ 26┊  userIds: string[],
+┊   ┊ 27┊  listingIds: string[],
+┊   ┊ 28┊  memberIds?: string[] | null,
+┊   ┊ 29┊  adminIds?: string[] | null,
+┊   ┊ 30┊  ownerId?: string | null,
+┊   ┊ 31┊  messages: Message[],
+┊   ┊ 32┊}
+┊   ┊ 33┊
+┊   ┊ 34┊export interface Message {
+┊   ┊ 35┊  id: string,
+┊   ┊ 36┊  senderId: string,
+┊   ┊ 37┊  content: string,
+┊   ┊ 38┊  createdAt: number,
+┊   ┊ 39┊  type: MessageType,
+┊   ┊ 40┊  recipients: Recipient[],
+┊   ┊ 41┊  holderIds: string[],
+┊   ┊ 42┊}
+┊   ┊ 43┊
+┊   ┊ 44┊export interface Recipient {
+┊   ┊ 45┊  id: string,
+┊   ┊ 46┊  receivedAt: number | null,
+┊   ┊ 47┊  readAt: number | null,
+┊   ┊ 48┊}
+┊   ┊ 49┊
+┊   ┊ 50┊const users: User[] = [
+┊   ┊ 51┊  {
+┊   ┊ 52┊    id: '1',
+┊   ┊ 53┊    name: 'Ethan Gonzalez',
+┊   ┊ 54┊    picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
+┊   ┊ 55┊    phone: '+391234567890',
+┊   ┊ 56┊  },
+┊   ┊ 57┊  {
+┊   ┊ 58┊    id: '2',
+┊   ┊ 59┊    name: 'Bryan Wallace',
+┊   ┊ 60┊    picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
+┊   ┊ 61┊    phone: '+391234567891',
+┊   ┊ 62┊  },
+┊   ┊ 63┊  {
+┊   ┊ 64┊    id: '3',
+┊   ┊ 65┊    name: 'Avery Stewart',
+┊   ┊ 66┊    picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
+┊   ┊ 67┊    phone: '+391234567892',
+┊   ┊ 68┊  },
+┊   ┊ 69┊  {
+┊   ┊ 70┊    id: '4',
+┊   ┊ 71┊    name: 'Katie Peterson',
+┊   ┊ 72┊    picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
+┊   ┊ 73┊    phone: '+391234567893',
+┊   ┊ 74┊  },
+┊   ┊ 75┊  {
+┊   ┊ 76┊    id: '5',
+┊   ┊ 77┊    name: 'Ray Edwards',
+┊   ┊ 78┊    picture: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
+┊   ┊ 79┊    phone: '+391234567894',
+┊   ┊ 80┊  },
+┊   ┊ 81┊  {
+┊   ┊ 82┊    id: '6',
+┊   ┊ 83┊    name: 'Niccolò Belli',
+┊   ┊ 84┊    picture: 'https://randomuser.me/api/portraits/thumb/men/4.jpg',
+┊   ┊ 85┊    phone: '+391234567895',
+┊   ┊ 86┊  },
+┊   ┊ 87┊  {
+┊   ┊ 88┊    id: '7',
+┊   ┊ 89┊    name: 'Mario Rossi',
+┊   ┊ 90┊    picture: 'https://randomuser.me/api/portraits/thumb/men/5.jpg',
+┊   ┊ 91┊    phone: '+391234567896',
+┊   ┊ 92┊  },
+┊   ┊ 93┊];
+┊   ┊ 94┊
+┊   ┊ 95┊const chats: Chat[] = [
+┊   ┊ 96┊  {
+┊   ┊ 97┊    id: '1',
+┊   ┊ 98┊    name: null,
+┊   ┊ 99┊    picture: null,
+┊   ┊100┊    userIds: ['1', '3'],
+┊   ┊101┊    listingIds: ['1', '3'],
+┊   ┊102┊    adminIds: null,
+┊   ┊103┊    ownerId: null,
+┊   ┊104┊    messages: [
+┊   ┊105┊      {
+┊   ┊106┊        id: random? getRandomId() : '1',
+┊   ┊107┊        senderId: '1',
+┊   ┊108┊        content: 'You on your way?',
+┊   ┊109┊        createdAt: moment().subtract(1, 'hours').unix(),
+┊   ┊110┊        type: MessageType.TEXT,
+┊   ┊111┊        recipients: [
+┊   ┊112┊          {
+┊   ┊113┊            id: '3',
+┊   ┊114┊            receivedAt: null,
+┊   ┊115┊            readAt: null,
+┊   ┊116┊          },
+┊   ┊117┊        ],
+┊   ┊118┊        holderIds: ['1', '3'],
+┊   ┊119┊      },
+┊   ┊120┊      {
+┊   ┊121┊        id: random? getRandomId() : '2',
+┊   ┊122┊        senderId: '3',
+┊   ┊123┊        content: 'Yep!',
+┊   ┊124┊        createdAt: moment().subtract(1, 'hours').add(5, 'minutes').unix(),
+┊   ┊125┊        type: MessageType.TEXT,
+┊   ┊126┊        recipients: [
+┊   ┊127┊          {
+┊   ┊128┊            id: '1',
+┊   ┊129┊            receivedAt: null,
+┊   ┊130┊            readAt: null,
+┊   ┊131┊          },
+┊   ┊132┊        ],
+┊   ┊133┊        holderIds: ['3', '1'],
+┊   ┊134┊      },
+┊   ┊135┊    ],
+┊   ┊136┊  },
+┊   ┊137┊  {
+┊   ┊138┊    id: '2',
+┊   ┊139┊    name: null,
+┊   ┊140┊    picture: null,
+┊   ┊141┊    userIds: ['1', '4'],
+┊   ┊142┊    listingIds: ['1', '4'],
+┊   ┊143┊    adminIds: null,
+┊   ┊144┊    ownerId: null,
+┊   ┊145┊    messages: [
+┊   ┊146┊      {
+┊   ┊147┊        id: random? getRandomId() : '1',
+┊   ┊148┊        senderId: '1',
+┊   ┊149┊        content: 'Hey, it\'s me',
+┊   ┊150┊        createdAt: moment().subtract(2, 'hours').unix(),
+┊   ┊151┊        type: MessageType.TEXT,
+┊   ┊152┊        recipients: [
+┊   ┊153┊          {
+┊   ┊154┊            id: '4',
+┊   ┊155┊            receivedAt: null,
+┊   ┊156┊            readAt: null,
+┊   ┊157┊          },
+┊   ┊158┊        ],
+┊   ┊159┊        holderIds: ['1', '4'],
+┊   ┊160┊      },
+┊   ┊161┊    ],
+┊   ┊162┊  },
+┊   ┊163┊  {
+┊   ┊164┊    id: '3',
+┊   ┊165┊    name: null,
+┊   ┊166┊    picture: null,
+┊   ┊167┊    userIds: ['1', '5'],
+┊   ┊168┊    listingIds: ['1', '5'],
+┊   ┊169┊    adminIds: null,
+┊   ┊170┊    ownerId: null,
+┊   ┊171┊    messages: [
+┊   ┊172┊      {
+┊   ┊173┊        id: random? getRandomId() : '1',
+┊   ┊174┊        senderId: '1',
+┊   ┊175┊        content: 'I should buy a boat',
+┊   ┊176┊        createdAt: moment().subtract(1, 'days').unix(),
+┊   ┊177┊        type: MessageType.TEXT,
+┊   ┊178┊        recipients: [
+┊   ┊179┊          {
+┊   ┊180┊            id: '5',
+┊   ┊181┊            receivedAt: null,
+┊   ┊182┊            readAt: null,
+┊   ┊183┊          },
+┊   ┊184┊        ],
+┊   ┊185┊        holderIds: ['1', '5'],
+┊   ┊186┊      },
+┊   ┊187┊      {
+┊   ┊188┊        id: random? getRandomId() : '2',
+┊   ┊189┊        senderId: '1',
+┊   ┊190┊        content: 'You still there?',
+┊   ┊191┊        createdAt: moment().subtract(1, 'days').add(16, 'hours').unix(),
+┊   ┊192┊        type: MessageType.TEXT,
+┊   ┊193┊        recipients: [
+┊   ┊194┊          {
+┊   ┊195┊            id: '5',
+┊   ┊196┊            receivedAt: null,
+┊   ┊197┊            readAt: null,
+┊   ┊198┊          },
+┊   ┊199┊        ],
+┊   ┊200┊        holderIds: ['1', '5'],
+┊   ┊201┊      },
+┊   ┊202┊    ],
+┊   ┊203┊  },
+┊   ┊204┊  {
+┊   ┊205┊    id: '4',
+┊   ┊206┊    name: null,
+┊   ┊207┊    picture: null,
+┊   ┊208┊    userIds: ['3', '4'],
+┊   ┊209┊    listingIds: ['3', '4'],
+┊   ┊210┊    adminIds: null,
+┊   ┊211┊    ownerId: null,
+┊   ┊212┊    messages: [
+┊   ┊213┊      {
+┊   ┊214┊        id: random? getRandomId() : '1',
+┊   ┊215┊        senderId: '3',
+┊   ┊216┊        content: 'Look at my mukluks!',
+┊   ┊217┊        createdAt: moment().subtract(4, 'days').unix(),
+┊   ┊218┊        type: MessageType.TEXT,
+┊   ┊219┊        recipients: [
+┊   ┊220┊          {
+┊   ┊221┊            id: '4',
+┊   ┊222┊            receivedAt: null,
+┊   ┊223┊            readAt: null,
+┊   ┊224┊          },
+┊   ┊225┊        ],
+┊   ┊226┊        holderIds: ['3', '4'],
+┊   ┊227┊      },
+┊   ┊228┊    ],
+┊   ┊229┊  },
+┊   ┊230┊  {
+┊   ┊231┊    id: '5',
+┊   ┊232┊    name: null,
+┊   ┊233┊    picture: null,
+┊   ┊234┊    userIds: ['2', '5'],
+┊   ┊235┊    listingIds: ['2', '5'],
+┊   ┊236┊    adminIds: null,
+┊   ┊237┊    ownerId: null,
+┊   ┊238┊    messages: [
+┊   ┊239┊      {
+┊   ┊240┊        id: random? getRandomId() : '1',
+┊   ┊241┊        senderId: '2',
+┊   ┊242┊        content: 'This is wicked good ice cream.',
+┊   ┊243┊        createdAt: moment().subtract(2, 'weeks').unix(),
+┊   ┊244┊        type: MessageType.TEXT,
+┊   ┊245┊        recipients: [
+┊   ┊246┊          {
+┊   ┊247┊            id: '5',
+┊   ┊248┊            receivedAt: null,
+┊   ┊249┊            readAt: null,
+┊   ┊250┊          },
+┊   ┊251┊        ],
+┊   ┊252┊        holderIds: ['2', '5'],
+┊   ┊253┊      },
+┊   ┊254┊      {
+┊   ┊255┊        id: random? getRandomId() : '2',
+┊   ┊256┊        senderId: '5',
+┊   ┊257┊        content: 'Love it!',
+┊   ┊258┊        createdAt: moment().subtract(2, 'weeks').add(10, 'minutes').unix(),
+┊   ┊259┊        type: MessageType.TEXT,
+┊   ┊260┊        recipients: [
+┊   ┊261┊          {
+┊   ┊262┊            id: '2',
+┊   ┊263┊            receivedAt: null,
+┊   ┊264┊            readAt: null,
+┊   ┊265┊          },
+┊   ┊266┊        ],
+┊   ┊267┊        holderIds: ['5', '2'],
+┊   ┊268┊      },
+┊   ┊269┊    ],
+┊   ┊270┊  },
+┊   ┊271┊  {
+┊   ┊272┊    id: '6',
+┊   ┊273┊    name: null,
+┊   ┊274┊    picture: null,
+┊   ┊275┊    userIds: ['1', '6'],
+┊   ┊276┊    listingIds: ['1'],
+┊   ┊277┊    adminIds: null,
+┊   ┊278┊    ownerId: null,
+┊   ┊279┊    messages: [],
+┊   ┊280┊  },
+┊   ┊281┊  {
+┊   ┊282┊    id: '7',
+┊   ┊283┊    name: null,
+┊   ┊284┊    picture: null,
+┊   ┊285┊    userIds: ['2', '1'],
+┊   ┊286┊    listingIds: ['2'],
+┊   ┊287┊    adminIds: null,
+┊   ┊288┊    ownerId: null,
+┊   ┊289┊    messages: [],
+┊   ┊290┊  },
+┊   ┊291┊  {
+┊   ┊292┊    id: '8',
+┊   ┊293┊    name: 'A user 0 group',
+┊   ┊294┊    picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
+┊   ┊295┊    userIds: ['1', '3', '4', '6'],
+┊   ┊296┊    listingIds: ['1', '3', '4', '6'],
+┊   ┊297┊    memberIds: ['1', '4', '6'],
+┊   ┊298┊    adminIds: ['1', '6'],
+┊   ┊299┊    ownerId: '1',
+┊   ┊300┊    messages: [
+┊   ┊301┊      {
+┊   ┊302┊        id: random? getRandomId() : '1',
+┊   ┊303┊        senderId: '1',
+┊   ┊304┊        content: 'I made a group',
+┊   ┊305┊        createdAt: moment().subtract(2, 'weeks').unix(),
+┊   ┊306┊        type: MessageType.TEXT,
+┊   ┊307┊        recipients: [
+┊   ┊308┊          {
+┊   ┊309┊            id: '3',
+┊   ┊310┊            receivedAt: null,
+┊   ┊311┊            readAt: null,
+┊   ┊312┊          },
+┊   ┊313┊          {
+┊   ┊314┊            id: '4',
+┊   ┊315┊            receivedAt: moment().subtract(2, 'weeks').add(1, 'minutes').unix(),
+┊   ┊316┊            readAt: moment().subtract(2, 'weeks').add(5, 'minutes').unix(),
+┊   ┊317┊          },
+┊   ┊318┊          {
+┊   ┊319┊            id: '6',
+┊   ┊320┊            receivedAt: null,
+┊   ┊321┊            readAt: null,
+┊   ┊322┊          },
+┊   ┊323┊        ],
+┊   ┊324┊        holderIds: ['1', '3', '4', '6'],
+┊   ┊325┊      },
+┊   ┊326┊      {
+┊   ┊327┊        id: random? getRandomId() : '2',
+┊   ┊328┊        senderId: '1',
+┊   ┊329┊        content: 'Ops, user 2 was not supposed to be here',
+┊   ┊330┊        createdAt: moment().subtract(2, 'weeks').add(2, 'minutes').unix(),
+┊   ┊331┊        type: MessageType.TEXT,
+┊   ┊332┊        recipients: [
+┊   ┊333┊          {
+┊   ┊334┊            id: '4',
+┊   ┊335┊            receivedAt: moment().subtract(2, 'weeks').add(3, 'minutes').unix(),
+┊   ┊336┊            readAt: moment().subtract(2, 'weeks').add(5, 'minutes').unix(),
+┊   ┊337┊          },
+┊   ┊338┊          {
+┊   ┊339┊            id: '6',
+┊   ┊340┊            receivedAt: null,
+┊   ┊341┊            readAt: null,
+┊   ┊342┊          },
+┊   ┊343┊        ],
+┊   ┊344┊        holderIds: ['1', '4', '6'],
+┊   ┊345┊      },
+┊   ┊346┊      {
+┊   ┊347┊        id: random? getRandomId() : '3',
+┊   ┊348┊        senderId: '4',
+┊   ┊349┊        content: 'Awesome!',
+┊   ┊350┊        createdAt: moment().subtract(2, 'weeks').add(10, 'minutes').unix(),
+┊   ┊351┊        type: MessageType.TEXT,
+┊   ┊352┊        recipients: [
+┊   ┊353┊          {
+┊   ┊354┊            id: '1',
+┊   ┊355┊            receivedAt: null,
+┊   ┊356┊            readAt: null,
+┊   ┊357┊          },
+┊   ┊358┊          {
+┊   ┊359┊            id: '6',
+┊   ┊360┊            receivedAt: null,
+┊   ┊361┊            readAt: null,
+┊   ┊362┊          },
+┊   ┊363┊        ],
+┊   ┊364┊        holderIds: ['1', '4', '6'],
+┊   ┊365┊      },
+┊   ┊366┊    ],
+┊   ┊367┊  },
+┊   ┊368┊  {
+┊   ┊369┊    id: '9',
+┊   ┊370┊    name: 'A user 5 group',
+┊   ┊371┊    picture: null,
+┊   ┊372┊    userIds: ['6', '3'],
+┊   ┊373┊    listingIds: ['6', '3'],
+┊   ┊374┊    memberIds: ['6', '3'],
+┊   ┊375┊    adminIds: ['6'],
+┊   ┊376┊    ownerId: '6',
+┊   ┊377┊    messages: [],
+┊   ┊378┊  },
+┊   ┊379┊];
+┊   ┊380┊
+┊   ┊381┊export const db = {users, chats};
```

[}]: #

Its' time to create our schema and our resolvers:

[{]: <helper> (diffStep "1.3")

#### Step 1.3: Add resolvers and schema

##### Changed schema&#x2F;resolvers.ts
```diff
@@ -1,6 +1,36 @@
+┊  ┊ 1┊import { Chat, db, Message } from "../db";
 ┊ 1┊ 2┊import { IResolvers } from "graphql-tools/dist/Interfaces";
 ┊ 2┊ 3┊
+┊  ┊ 4┊let users = db.users;
+┊  ┊ 5┊let chats = db.chats;
+┊  ┊ 6┊const currentUser = '1';
+┊  ┊ 7┊
 ┊ 3┊ 8┊export const resolvers: IResolvers = {
 ┊ 4┊ 9┊  Query: {
+┊  ┊10┊    // Show all users for the moment.
+┊  ┊11┊    users: () => users.filter(user => user.id !== currentUser),
+┊  ┊12┊    chats: () => chats.filter(chat => chat.listingIds.includes(currentUser)),
+┊  ┊13┊    chat: (obj: any, {chatId}) => chats.find(chat => chat.id === chatId),
+┊  ┊14┊  },
+┊  ┊15┊  Chat: {
+┊  ┊16┊    name: (chat: Chat) => chat.name ? chat.name : users
+┊  ┊17┊      .find(user => user.id === chat.userIds.find(userId => userId !== currentUser))!.name,
+┊  ┊18┊    picture: (chat: Chat) => chat.name ? chat.picture : users
+┊  ┊19┊      .find(user => user.id === chat.userIds.find(userId => userId !== currentUser))!.picture,
+┊  ┊20┊    messages: (chat: Chat) => chat.messages
+┊  ┊21┊      .filter(message => message.holderIds.includes(currentUser))
+┊  ┊22┊      .sort((a, b) => a.createdAt - b.createdAt) || [],
+┊  ┊23┊    lastMessage: (chat: Chat) => chat.messages
+┊  ┊24┊      .filter(message => message.holderIds.includes(currentUser))
+┊  ┊25┊      .sort((a, b) => b.createdAt - a.createdAt)[0] || null,
+┊  ┊26┊    unreadMessages: (chat: Chat) => chat.messages
+┊  ┊27┊      .filter(message => message.holderIds.includes(currentUser) &&
+┊  ┊28┊        message.recipients.find(recipient => recipient.id === currentUser && !recipient.readAt))
+┊  ┊29┊      .length,
+┊  ┊30┊    isGroup: (chat: Chat) => !!chat.name,
+┊  ┊31┊  },
+┊  ┊32┊  Message: {
+┊  ┊33┊    sender: (message: Message) => users.find(user => user.id === message.senderId),
+┊  ┊34┊    ownership: (message: Message) => message.senderId === currentUser,
 ┊ 5┊35┊  },
 ┊ 6┊36┊};
```

##### Changed schema&#x2F;typeDefs.ts
```diff
@@ -1,4 +1,71 @@
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
+┊  ┊11┊    TEXT
+┊  ┊12┊    LOCATION
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
+┊  ┊24┊    userIds: [ID!]!
+┊  ┊25┊    #Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
+┊  ┊26┊    listingIds: [ID!]!
+┊  ┊27┊    #Actual members of the group (they are not the only ones who get the group listed). Null for chats.
+┊  ┊28┊    memberIds: [ID!]!
+┊  ┊29┊    #Null for chats
+┊  ┊30┊    adminIds: [ID!]
+┊  ┊31┊    #If null the group is read-only. Null for chats.
+┊  ┊32┊    ownerId: ID!
+┊  ┊33┊    messages: [Message]!
+┊  ┊34┊    #Computed property
+┊  ┊35┊    lastMessage: Message
+┊  ┊36┊    #Computed property
+┊  ┊37┊    unreadMessages: Int!
+┊  ┊38┊    #Computed property
+┊  ┊39┊    isGroup: Boolean!
+┊  ┊40┊  }
+┊  ┊41┊
+┊  ┊42┊  type Message {
+┊  ┊43┊    id: ID!
+┊  ┊44┊    senderId: ID!
+┊  ┊45┊    sender: User!
+┊  ┊46┊    content: String!
+┊  ┊47┊    createdAt: Int
+┊  ┊48┊    #FIXME: should return MessageType
+┊  ┊49┊    type: Int!
+┊  ┊50┊    #Whoever received the message
+┊  ┊51┊    recipients: [Recipient!]!
+┊  ┊52┊    #Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise
+┊  ┊53┊    holderIds: [ID!]!
+┊  ┊54┊    #Computed property
+┊  ┊55┊    ownership: Boolean!
+┊  ┊56┊  }
+┊  ┊57┊  
+┊  ┊58┊  type Recipient {
+┊  ┊59┊    #The user id
+┊  ┊60┊    id: ID!
+┊  ┊61┊    receivedAt: Int
+┊  ┊62┊    readAt: Int
+┊  ┊63┊  }
+┊  ┊64┊
+┊  ┊65┊  type User {
+┊  ┊66┊    id: ID!
+┊  ┊67┊    name: String
+┊  ┊68┊    picture: String
+┊  ┊69┊    phone: String
+┊  ┊70┊  }
 ┊ 4┊71┊`;
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
 ┊10┊11┊    "@types/graphql": "^0.11.7",
```
```diff
@@ -13,6 +14,7 @@
 ┊13┊14┊    "@types/koa-router": "^7.0.27",
 ┊14┊15┊    "@types/koa__cors": "^2.2.2",
 ┊15┊16┊    "@types/node": "^8.0.55",
+┊  ┊17┊    "graphql-code-generator": "^0.8.14",
 ┊16┊18┊    "nodemon": "^1.12.5",
 ┊17┊19┊    "ts-node": "^3.3.0",
 ┊18┊20┊    "typescript": "^2.6.2"
```

[}]: #

Now let's run the generator (the server must be running in the background):

    $ npm run generator

Those are the types created with `npm run generator`:

[{]: <helper> (diffStep "2.2")

#### Step 2.2: Create types with generator

##### Added types.d.ts
```diff
@@ -0,0 +1,53 @@
+┊  ┊ 1┊/* tslint:disable */
+┊  ┊ 2┊
+┊  ┊ 3┊export interface Query {
+┊  ┊ 4┊  users: User[]; 
+┊  ┊ 5┊  chats: Chat[]; 
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
+┊  ┊17┊  id: string; /* May be a chat or a group */
+┊  ┊18┊  name?: string | null; /* Computed for chats */
+┊  ┊19┊  picture?: string | null; /* Computed for chats */
+┊  ┊20┊  userIds: string[]; /* All members, current and past ones. */
+┊  ┊21┊  listingIds: string[]; /* Whoever gets the chat listed. For groups includes past members who still didn&#x27;t delete the group. */
+┊  ┊22┊  memberIds: string[]; /* Actual members of the group (they are not the only ones who get the group listed). Null for chats. */
+┊  ┊23┊  adminIds: string[]; /* Null for chats */
+┊  ┊24┊  ownerId: string; /* If null the group is read-only. Null for chats. */
+┊  ┊25┊  messages: Message[]; 
+┊  ┊26┊  lastMessage?: Message | null; /* Computed property */
+┊  ┊27┊  unreadMessages: number; /* Computed property */
+┊  ┊28┊  isGroup: boolean; /* Computed property */
+┊  ┊29┊}
+┊  ┊30┊
+┊  ┊31┊export interface Message {
+┊  ┊32┊  id: string; 
+┊  ┊33┊  senderId: string; 
+┊  ┊34┊  sender: User; 
+┊  ┊35┊  content: string; 
+┊  ┊36┊  createdAt?: number | null; 
+┊  ┊37┊  type: number; /* FIXME: should return MessageType */
+┊  ┊38┊  recipients: Recipient[]; /* Whoever received the message */
+┊  ┊39┊  holderIds: string[]; /* Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise */
+┊  ┊40┊  ownership: boolean; /* Computed property */
+┊  ┊41┊}
+┊  ┊42┊
+┊  ┊43┊export interface Recipient {
+┊  ┊44┊  id: string; /* The user id */
+┊  ┊45┊  receivedAt?: number | null; 
+┊  ┊46┊  readAt?: number | null; 
+┊  ┊47┊}
+┊  ┊48┊export interface ChatQueryArgs {
+┊  ┊49┊  chatId: string; 
+┊  ┊50┊}
+┊  ┊51┊
+┊  ┊52┊export type MessageType = "TEXT" | "LOCATION" | "PICTURE";
+┊  ┊53┊
```

[}]: #

Now let's use them:

[{]: <helper> (diffStep "2.3")

#### Step 2.3: Use our types

##### Changed schema&#x2F;resolvers.ts
```diff
@@ -1,5 +1,6 @@
 ┊1┊1┊import { Chat, db, Message } from "../db";
 ┊2┊2┊import { IResolvers } from "graphql-tools/dist/Interfaces";
+┊ ┊3┊import { ChatQueryArgs } from "../types";
 ┊3┊4┊
 ┊4┊5┊let users = db.users;
 ┊5┊6┊let chats = db.chats;
```
```diff
@@ -10,7 +11,7 @@
 ┊10┊11┊    // Show all users for the moment.
 ┊11┊12┊    users: () => users.filter(user => user.id !== currentUser),
 ┊12┊13┊    chats: () => chats.filter(chat => chat.listingIds.includes(currentUser)),
-┊13┊  ┊    chat: (obj: any, {chatId}) => chats.find(chat => chat.id === chatId),
+┊  ┊14┊    chat: (obj: any, {chatId}: ChatQueryArgs) => chats.find(chat => chat.id === chatId),
 ┊14┊15┊  },
 ┊15┊16┊  Chat: {
 ┊16┊17┊    name: (chat: Chat) => chat.name ? chat.name : users
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
-┊1┊ ┊import { Chat, db, Message } from "../db";
+┊ ┊1┊import { Chat, db, getRandomId, Message, MessageType, random, Recipient } from "../db";
 ┊2┊2┊import { IResolvers } from "graphql-tools/dist/Interfaces";
 ┊3┊3┊import { ChatQueryArgs } from "../types";
+┊ ┊4┊import * as moment from "moment";
 ┊4┊5┊
 ┊5┊6┊let users = db.users;
 ┊6┊7┊let chats = db.chats;
```
```diff
@@ -13,6 +14,273 @@
 ┊ 13┊ 14┊    chats: () => chats.filter(chat => chat.listingIds.includes(currentUser)),
 ┊ 14┊ 15┊    chat: (obj: any, {chatId}: ChatQueryArgs) => chats.find(chat => chat.id === chatId),
 ┊ 15┊ 16┊  },
+┊   ┊ 17┊  Mutation: {
+┊   ┊ 18┊    addChat: (obj: any, {recipientId}: any) => {
+┊   ┊ 19┊      if (!users.find(user => user.id === recipientId)) {
+┊   ┊ 20┊        throw new Error(`Recipient ${recipientId} doesn't exist.`);
+┊   ┊ 21┊      }
+┊   ┊ 22┊
+┊   ┊ 23┊      const chat = chats.find(chat => !chat.name && chat.userIds.includes(currentUser) && chat.userIds.includes(recipientId));
+┊   ┊ 24┊      if (chat) {
+┊   ┊ 25┊        // Chat already exists. Both users are already in the userIds array
+┊   ┊ 26┊        const chatId = chat.id;
+┊   ┊ 27┊        if (!chat.listingIds.includes(currentUser)) {
+┊   ┊ 28┊          // The chat isn't listed for the current user. Add him to the memberIds
+┊   ┊ 29┊          chat.listingIds.push(currentUser);
+┊   ┊ 30┊          chats.find(chat => chat.id === chatId)!.listingIds.push(currentUser);
+┊   ┊ 31┊          return chat;
+┊   ┊ 32┊        } else {
+┊   ┊ 33┊          throw new Error(`Chat already exists.`);
+┊   ┊ 34┊        }
+┊   ┊ 35┊      } else {
+┊   ┊ 36┊        // Create the chat
+┊   ┊ 37┊        const id = (chats.length && String(Number(chats[chats.length - 1].id) + 1)) || '1';
+┊   ┊ 38┊        const chat: Chat = {
+┊   ┊ 39┊          id,
+┊   ┊ 40┊          name: null,
+┊   ┊ 41┊          picture: null,
+┊   ┊ 42┊          adminIds: null,
+┊   ┊ 43┊          ownerId: null,
+┊   ┊ 44┊          userIds: [currentUser, recipientId],
+┊   ┊ 45┊          // Chat will not be listed to the other user until the first message gets written
+┊   ┊ 46┊          listingIds: [currentUser],
+┊   ┊ 47┊          memberIds: null,
+┊   ┊ 48┊          messages: [],
+┊   ┊ 49┊        };
+┊   ┊ 50┊        chats.push(chat);
+┊   ┊ 51┊        return chat;
+┊   ┊ 52┊      }
+┊   ┊ 53┊    },
+┊   ┊ 54┊    addGroup: (obj: any, {recipientIds, groupName}: any) => {
+┊   ┊ 55┊      recipientIds.forEach((recipientId: any) => {
+┊   ┊ 56┊        if (!users.find(user => user.id === recipientId)) {
+┊   ┊ 57┊          throw new Error(`Recipient ${recipientId} doesn't exist.`);
+┊   ┊ 58┊        }
+┊   ┊ 59┊      });
+┊   ┊ 60┊
+┊   ┊ 61┊      const id = (chats.length && String(Number(chats[chats.length - 1].id) + 1)) || '1';
+┊   ┊ 62┊      const chat: Chat = {
+┊   ┊ 63┊        id,
+┊   ┊ 64┊        name: groupName,
+┊   ┊ 65┊        picture: null,
+┊   ┊ 66┊        adminIds: [currentUser],
+┊   ┊ 67┊        ownerId: currentUser,
+┊   ┊ 68┊        userIds: [currentUser, ...recipientIds],
+┊   ┊ 69┊        listingIds: [currentUser, ...recipientIds],
+┊   ┊ 70┊        memberIds: [currentUser, ...recipientIds],
+┊   ┊ 71┊        messages: [],
+┊   ┊ 72┊      };
+┊   ┊ 73┊      chats.push(chat);
+┊   ┊ 74┊      return chat;
+┊   ┊ 75┊    },
+┊   ┊ 76┊    removeChat: (obj: any, {chatId}: any) => {
+┊   ┊ 77┊      const chat = chats.find(chat => chat.id === chatId);
+┊   ┊ 78┊
+┊   ┊ 79┊      if (!chat) {
+┊   ┊ 80┊        throw new Error(`The chat ${chatId} doesn't exist.`);
+┊   ┊ 81┊      }
+┊   ┊ 82┊
+┊   ┊ 83┊      if (!chat.name) {
+┊   ┊ 84┊        // Chat
+┊   ┊ 85┊        if (!chat.listingIds.includes(currentUser)) {
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
+┊   ┊102┊        const listingIds = chat.listingIds.filter(listingId => listingId !== currentUser);
+┊   ┊103┊
+┊   ┊104┊        // Check how many members are left
+┊   ┊105┊        if (listingIds.length === 0) {
+┊   ┊106┊          // Delete the chat
+┊   ┊107┊          chats = chats.filter(chat => chat.id !== chatId);
+┊   ┊108┊        } else {
+┊   ┊109┊          // Update the chat
+┊   ┊110┊          chats = chats.map(chat => {
+┊   ┊111┊            if (chat.id === chatId) {
+┊   ┊112┊              chat = {...chat, listingIds, messages};
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
+┊   ┊137┊        const listingIds = chat.listingIds.filter(listingId => listingId !== currentUser);
+┊   ┊138┊
+┊   ┊139┊        // Check how many members (including previous ones who can still access old messages) are left
+┊   ┊140┊        if (listingIds.length === 0) {
+┊   ┊141┊          // Remove the group
+┊   ┊142┊          chats = chats.filter(chat => chat.id !== chatId);
+┊   ┊143┊        } else {
+┊   ┊144┊          // Update the group
+┊   ┊145┊
+┊   ┊146┊          // Remove the current user from the chat members. He is no longer a member of the group
+┊   ┊147┊          const memberIds = chat.memberIds!.filter(memberId => memberId !== currentUser);
+┊   ┊148┊          // Remove the current user from the chat admins
+┊   ┊149┊          const adminIds = chat.adminIds!.filter(memberId => memberId !== currentUser);
+┊   ┊150┊          // Set the owner id to be null. A null owner means the group is read-only
+┊   ┊151┊          let ownerId: string | null = null;
+┊   ┊152┊
+┊   ┊153┊          // Check if there is any admin left
+┊   ┊154┊          if (adminIds!.length) {
+┊   ┊155┊            // Pick an admin as the new owner. The group is no longer read-only
+┊   ┊156┊            ownerId = chat.adminIds![0];
+┊   ┊157┊          }
+┊   ┊158┊
+┊   ┊159┊          chats = chats.map(chat => {
+┊   ┊160┊            if (chat.id === chatId) {
+┊   ┊161┊              chat = {...chat, messages, listingIds, memberIds, adminIds, ownerId};
+┊   ┊162┊            }
+┊   ┊163┊            return chat;
+┊   ┊164┊          });
+┊   ┊165┊        }
+┊   ┊166┊        return chatId;
+┊   ┊167┊      }
+┊   ┊168┊    },
+┊   ┊169┊    addMessage: (obj: any, {chatId, content}: any) => {
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
+┊   ┊180┊      let holderIds = chat.listingIds;
+┊   ┊181┊
+┊   ┊182┊      if (!chat.name) {
+┊   ┊183┊        // Chat
+┊   ┊184┊        if (!chat.listingIds.find(listingId => listingId === currentUser)) {
+┊   ┊185┊          throw new Error(`The chat ${chatId} must be listed for the current user before adding a message.`);
+┊   ┊186┊        }
+┊   ┊187┊
+┊   ┊188┊        const recipientId = chat.userIds.filter(userId => userId !== currentUser)[0];
+┊   ┊189┊
+┊   ┊190┊        if (!chat.listingIds.find(listingId => listingId === recipientId)) {
+┊   ┊191┊          // Chat is not listed for the recipient. Add him to the listingIds
+┊   ┊192┊          const listingIds = chat.listingIds.concat(recipientId);
+┊   ┊193┊
+┊   ┊194┊          chats = chats.map(chat => {
+┊   ┊195┊            if (chat.id === chatId) {
+┊   ┊196┊              chat = {...chat, listingIds};
+┊   ┊197┊            }
+┊   ┊198┊            return chat;
+┊   ┊199┊          });
+┊   ┊200┊
+┊   ┊201┊          holderIds = listingIds;
+┊   ┊202┊        }
+┊   ┊203┊      } else {
+┊   ┊204┊        // Group
+┊   ┊205┊        if (!chat.memberIds!.find(memberId => memberId === currentUser)) {
+┊   ┊206┊          throw new Error(`The user is not a member of the group ${chatId}. Cannot add message.`);
+┊   ┊207┊        }
+┊   ┊208┊
+┊   ┊209┊        holderIds = chat.memberIds!;
+┊   ┊210┊      }
+┊   ┊211┊
+┊   ┊212┊      const id = random ? getRandomId() : (chat.messages.length && String(Number(chat.messages[chat.messages.length - 1].id) + 1)) || '1';
+┊   ┊213┊
+┊   ┊214┊      let recipients: Recipient[] = [];
+┊   ┊215┊
+┊   ┊216┊      holderIds.forEach(holderId => {
+┊   ┊217┊        if (holderId !== currentUser) {
+┊   ┊218┊          recipients.push({
+┊   ┊219┊            id: holderId,
+┊   ┊220┊            receivedAt: null,
+┊   ┊221┊            readAt: null,
+┊   ┊222┊          });
+┊   ┊223┊        }
+┊   ┊224┊      });
+┊   ┊225┊
+┊   ┊226┊      const message: Message = {
+┊   ┊227┊        id,
+┊   ┊228┊        senderId: currentUser,
+┊   ┊229┊        content,
+┊   ┊230┊        createdAt: moment().unix(),
+┊   ┊231┊        type: MessageType.TEXT,
+┊   ┊232┊        recipients,
+┊   ┊233┊        holderIds,
+┊   ┊234┊      };
+┊   ┊235┊
+┊   ┊236┊      chats = chats.map(chat => {
+┊   ┊237┊        if (chat.id === chatId) {
+┊   ┊238┊          chat = {...chat, messages: chat.messages.concat(message)}
+┊   ┊239┊        }
+┊   ┊240┊        return chat;
+┊   ┊241┊      });
+┊   ┊242┊
+┊   ┊243┊      return message;
+┊   ┊244┊    },
+┊   ┊245┊    removeMessages: (obj: any, {chatId, messageIds, all}: any) => {
+┊   ┊246┊      const chat = chats.find(chat => chat.id === chatId);
+┊   ┊247┊
+┊   ┊248┊      if (!chat) {
+┊   ┊249┊        throw new Error(`Cannot find chat ${chatId}.`);
+┊   ┊250┊      }
+┊   ┊251┊
+┊   ┊252┊      if (!chat.listingIds.find(listingId => listingId === currentUser)) {
+┊   ┊253┊        throw new Error(`The chat/group ${chatId} is not listed for the current user, so there is nothing to delete.`);
+┊   ┊254┊      }
+┊   ┊255┊
+┊   ┊256┊      if (all && messageIds) {
+┊   ┊257┊        throw new Error(`Cannot specify both 'all' and 'messageIds'.`);
+┊   ┊258┊      }
+┊   ┊259┊
+┊   ┊260┊      let deletedIds: string[] = [];
+┊   ┊261┊      chats = chats.map(chat => {
+┊   ┊262┊        if (chat.id === chatId) {
+┊   ┊263┊          // Instead of chaining map and filter we can loop once using reduce
+┊   ┊264┊          const messages = chat.messages.reduce<Message[]>((filtered, message) => {
+┊   ┊265┊            if (all || messageIds!.includes(message.id)) {
+┊   ┊266┊              deletedIds.push(message.id);
+┊   ┊267┊              // Remove the current user from the message holders
+┊   ┊268┊              message.holderIds = message.holderIds.filter(holderId => holderId !== currentUser);
+┊   ┊269┊            }
+┊   ┊270┊
+┊   ┊271┊            if (message.holderIds.length !== 0) {
+┊   ┊272┊              filtered.push(message);
+┊   ┊273┊            } // else discard the message
+┊   ┊274┊
+┊   ┊275┊            return filtered;
+┊   ┊276┊          }, []);
+┊   ┊277┊          chat = {...chat, messages};
+┊   ┊278┊        }
+┊   ┊279┊        return chat;
+┊   ┊280┊      });
+┊   ┊281┊      return deletedIds;
+┊   ┊282┊    },
+┊   ┊283┊  },
 ┊ 16┊284┊  Chat: {
 ┊ 17┊285┊    name: (chat: Chat) => chat.name ? chat.name : users
 ┊ 18┊286┊      .find(user => user.id === chat.userIds.find(userId => userId !== currentUser))!.name,
```

##### Changed schema&#x2F;typeDefs.ts
```diff
@@ -68,4 +68,20 @@
 ┊68┊68┊    picture: String
 ┊69┊69┊    phone: String
 ┊70┊70┊  }
+┊  ┊71┊
+┊  ┊72┊  type Mutation {
+┊  ┊73┊    addChat(recipientId: ID!): Chat
+┊  ┊74┊    addGroup(recipientIds: [ID!]!, groupName: String!): Chat
+┊  ┊75┊    removeChat(chatId: ID!): ID
+┊  ┊76┊    addMessage(chatId: ID!, content: String!): Message
+┊  ┊77┊    removeMessages(chatId: ID!, messageIds: [ID], all: Boolean): [ID]
+┊  ┊78┊    addMembers(groupId: ID!, userIds: [ID!]!): [ID]
+┊  ┊79┊    removeMembers(groupId: ID!, userIds: [ID!]!): [ID]
+┊  ┊80┊    addAdmins(groupId: ID!, userIds: [ID!]!): [ID]
+┊  ┊81┊    removeAdmins(groupId: ID!, userIds: [ID!]!): [ID]
+┊  ┊82┊    setGroupName(groupId: ID!): String
+┊  ┊83┊    setGroupPicture(groupId: ID!): String
+┊  ┊84┊    markAsReceived(chatId: ID!): Boolean
+┊  ┊85┊    markAsRead(chatId: ID!): Boolean
+┊  ┊86┊  }
 ┊71┊87┊`;
```

[}]: #

    $ npm run generator

[{]: <helper> (diffStep "3.3")

#### Step 3.3: Use generated types

##### Changed schema&#x2F;resolvers.ts
```diff
@@ -1,6 +1,9 @@
 ┊1┊1┊import { Chat, db, getRandomId, Message, MessageType, random, Recipient } from "../db";
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
@@ -15,7 +18,7 @@
 ┊15┊18┊    chat: (obj: any, {chatId}: ChatQueryArgs) => chats.find(chat => chat.id === chatId),
 ┊16┊19┊  },
 ┊17┊20┊  Mutation: {
-┊18┊  ┊    addChat: (obj: any, {recipientId}: any) => {
+┊  ┊21┊    addChat: (obj: any, {recipientId}: AddChatMutationArgs) => {
 ┊19┊22┊      if (!users.find(user => user.id === recipientId)) {
 ┊20┊23┊        throw new Error(`Recipient ${recipientId} doesn't exist.`);
 ┊21┊24┊      }
```
```diff
@@ -51,8 +54,8 @@
 ┊51┊54┊        return chat;
 ┊52┊55┊      }
 ┊53┊56┊    },
-┊54┊  ┊    addGroup: (obj: any, {recipientIds, groupName}: any) => {
-┊55┊  ┊      recipientIds.forEach((recipientId: any) => {
+┊  ┊57┊    addGroup: (obj: any, {recipientIds, groupName}: AddGroupMutationArgs) => {
+┊  ┊58┊      recipientIds.forEach(recipientId => {
 ┊56┊59┊        if (!users.find(user => user.id === recipientId)) {
 ┊57┊60┊          throw new Error(`Recipient ${recipientId} doesn't exist.`);
 ┊58┊61┊        }
```
```diff
@@ -73,7 +76,7 @@
 ┊73┊76┊      chats.push(chat);
 ┊74┊77┊      return chat;
 ┊75┊78┊    },
-┊76┊  ┊    removeChat: (obj: any, {chatId}: any) => {
+┊  ┊79┊    removeChat: (obj: any, {chatId}: RemoveChatMutationArgs) => {
 ┊77┊80┊      const chat = chats.find(chat => chat.id === chatId);
 ┊78┊81┊
 ┊79┊82┊      if (!chat) {
```
```diff
@@ -166,7 +169,7 @@
 ┊166┊169┊        return chatId;
 ┊167┊170┊      }
 ┊168┊171┊    },
-┊169┊   ┊    addMessage: (obj: any, {chatId, content}: any) => {
+┊   ┊172┊    addMessage: (obj: any, {chatId, content}: AddMessageMutationArgs) => {
 ┊170┊173┊      if (content === null || content === '') {
 ┊171┊174┊        throw new Error(`Cannot add empty or null messages.`);
 ┊172┊175┊      }
```
```diff
@@ -242,7 +245,7 @@
 ┊242┊245┊
 ┊243┊246┊      return message;
 ┊244┊247┊    },
-┊245┊   ┊    removeMessages: (obj: any, {chatId, messageIds, all}: any) => {
+┊   ┊248┊    removeMessages: (obj: any, {chatId, messageIds, all}: RemoveMessagesMutationArgs) => {
 ┊246┊249┊      const chat = chats.find(chat => chat.id === chatId);
 ┊247┊250┊
 ┊248┊251┊      if (!chat) {
```

[}]: #



[//]: # (foot-start)

[{]: <helper> (navStep)

| [< Previous Step](step2.md) |
|:----------------------|

[}]: #

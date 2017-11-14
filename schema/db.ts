import * as moment from "moment";

export enum MessageType {
  TEXT,
  LOCATION,
  PICTURE,
}

export interface User {
  id: number,
  name: string,
  picture?: string | null,
  phone?: string | null,
}

export interface Chat {
  id: number,
  name?: string | null,
  picture?: string | null,
  userIds: number[],
  listingIds: number[],
  memberIds?: number[] | null,
  adminIds?: number[] | null,
  ownerId?: number | null,
  messages: Message[],
}

export interface Message {
  id: number,
  senderId: number,
  content: string,
  createdAt: number,
  type: MessageType,
  recipients: Recipient[],
  holderIds: number[],
}

export interface Recipient {
  id: number,
  receivedAt: number | null,
  readAt: number | null,
}

const users: User[] = [
  {
    id: 0,
    name: 'Ethan Gonzalez',
    picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
    phone: '+391234567890',
  },
  {
    id: 1,
    name: 'Bryan Wallace',
    picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
    phone: '+391234567891',
  },
  {
    id: 2,
    name: 'Avery Stewart',
    picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
    phone: '+391234567892',
  },
  {
    id: 3,
    name: 'Katie Peterson',
    picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
    phone: '+391234567893',
  },
  {
    id: 4,
    name: 'Ray Edwards',
    picture: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
    phone: '+391234567894',
  },
  {
    id: 5,
    name: 'Niccolò Belli',
    picture: 'https://randomuser.me/api/portraits/thumb/men/4.jpg',
    phone: '+391234567895',
  },
  {
    id: 6,
    name: 'Mario Rossi',
    picture: 'https://randomuser.me/api/portraits/thumb/men/5.jpg',
    phone: '+391234567896',
  },
];

const chats: Chat[] = [
  {
    id: 0,
    name: null,
    picture: null,
    userIds: [0, 2],
    listingIds: [0, 2],
    adminIds: null,
    ownerId: null,
    messages: [
      {
        id: 0,
        senderId: 0,
        content: 'You on your way?',
        createdAt: moment().subtract(1, 'hours').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: 2,
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: [0, 2],
      },
      {
        id: 1,
        senderId: 2,
        content: 'Yep!',
        createdAt: moment().subtract(1, 'hours').add(5, 'minutes').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: 0,
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: [2, 0],
      },
    ],
  },
  {
    id: 1,
    name: null,
    picture: null,
    userIds: [0, 3],
    listingIds: [0, 3],
    adminIds: null,
    ownerId: null,
    messages: [
      {
        id: 0,
        senderId: 0,
        content: 'Hey, it\'s me',
        createdAt: moment().subtract(2, 'hours').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: 3,
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: [0, 3],
      },
    ],
  },
  {
    id: 2,
    name: null,
    picture: null,
    userIds: [0, 4],
    listingIds: [0, 4],
    adminIds: null,
    ownerId: null,
    messages: [
      {
        id: 0,
        senderId: 0,
        content: 'I should buy a boat',
        createdAt: moment().subtract(1, 'days').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: 4,
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: [0, 4],
      },
      {
        id: 1,
        senderId: 0,
        content: 'You still there?',
        createdAt: moment().subtract(1, 'days').add(16, 'hours').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: 4,
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: [0, 4],
      },
    ],
  },
  {
    id: 3,
    name: null,
    picture: null,
    userIds: [2, 3],
    listingIds: [2, 3],
    adminIds: null,
    ownerId: null,
    messages: [
      {
        id: 0,
        senderId: 2,
        content: 'Look at my mukluks!',
        createdAt: moment().subtract(4, 'days').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: 3,
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: [2, 3],
      },
    ],
  },
  {
    id: 4,
    name: null,
    picture: null,
    userIds: [1, 4],
    listingIds: [1, 4],
    adminIds: null,
    ownerId: null,
    messages: [
      {
        id: 0,
        senderId: 1,
        content: 'This is wicked good ice cream.',
        createdAt: moment().subtract(2, 'weeks').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: 4,
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: [1, 4],
      },
      {
        id: 1,
        senderId: 4,
        content: 'Love it!',
        createdAt: moment().subtract(2, 'weeks').add(10, 'minutes').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: 1,
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: [4, 1],
      },
    ],
  },
  {
    id: 5,
    name: null,
    picture: null,
    userIds: [0, 5],
    listingIds: [0],
    adminIds: null,
    ownerId: null,
    messages: [],
  },
  {
    id: 6,
    name: null,
    picture: null,
    userIds: [1, 0],
    listingIds: [1],
    adminIds: null,
    ownerId: null,
    messages: [],
  },
  {
    id: 7,
    name: 'A user 0 group',
    picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
    userIds: [0, 2, 3, 5],
    listingIds: [0, 2, 3, 5],
    memberIds: [0, 3, 5],
    adminIds: [0, 5],
    ownerId: 0,
    messages: [
      {
        id: 0,
        senderId: 0,
        content: 'I made a group',
        createdAt: moment().subtract(2, 'weeks').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: 2,
            receivedAt: null,
            readAt: null,
          },
          {
            id: 3,
            receivedAt: moment().subtract(2, 'weeks').add(1, 'minutes').unix(),
            readAt: moment().subtract(2, 'weeks').add(5, 'minutes').unix(),
          },
          {
            id: 5,
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: [0, 2, 3, 5],
      },
      {
        id: 1,
        senderId: 0,
        content: 'Ops, user 2 was not supposed to be here',
        createdAt: moment().subtract(2, 'weeks').add(2, 'minutes').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: 3,
            receivedAt: moment().subtract(2, 'weeks').add(3, 'minutes').unix(),
            readAt: moment().subtract(2, 'weeks').add(5, 'minutes').unix(),
          },
          {
            id: 5,
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: [0, 3, 5],
      },
      {
        id: 2,
        senderId: 3,
        content: 'Awesome!',
        createdAt: moment().subtract(2, 'weeks').add(10, 'minutes').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: 0,
            receivedAt: null,
            readAt: null,
          },
          {
            id: 5,
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: [0, 3, 5],
      },
    ],
  },
  {
    id: 8,
    name: 'A user 5 group',
    picture: null,
    userIds: [5, 2],
    listingIds: [5, 2],
    memberIds: [5, 2],
    adminIds: [5],
    ownerId: 5,
    messages: [],
  },
];

export const db = {users, chats};

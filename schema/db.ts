import * as moment from 'moment';

export const random = true;

export function getRandomId() {
  return String(Math.round(Math.random() * 1000000000000));
}

export enum MessageType {
  TEXT,
  LOCATION,
  PICTURE,
}

export interface User {
  id: string,
  name: string,
  picture?: string | null,
  phone?: string | null,
}

export interface Chat {
  id: string,
  name?: string | null,
  picture?: string | null,
  userIds: string[],
  listingIds: string[],
  memberIds?: string[] | null,
  adminIds?: string[] | null,
  ownerId?: string | null,
  messages: Message[],
}

export interface Message {
  id: string,
  senderId: string,
  content: string,
  createdAt: number,
  type: MessageType,
  recipients: Recipient[],
  holderIds: string[],
}

export interface Recipient {
  id: string,
  receivedAt: number | null,
  readAt: number | null,
}

const users: User[] = [
  {
    id: '1',
    name: 'Ethan Gonzalez',
    picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
    phone: '+391234567890',
  },
  {
    id: '2',
    name: 'Bryan Wallace',
    picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
    phone: '+391234567891',
  },
  {
    id: '3',
    name: 'Avery Stewart',
    picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
    phone: '+391234567892',
  },
  {
    id: '4',
    name: 'Katie Peterson',
    picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
    phone: '+391234567893',
  },
  {
    id: '5',
    name: 'Ray Edwards',
    picture: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
    phone: '+391234567894',
  },
  {
    id: '6',
    name: 'Niccolò Belli',
    picture: 'https://randomuser.me/api/portraits/thumb/men/4.jpg',
    phone: '+391234567895',
  },
  {
    id: '7',
    name: 'Mario Rossi',
    picture: 'https://randomuser.me/api/portraits/thumb/men/5.jpg',
    phone: '+391234567896',
  },
];

const chats: Chat[] = [
  {
    id: '1',
    name: null,
    picture: null,
    userIds: ['1', '3'],
    listingIds: ['1', '3'],
    adminIds: null,
    ownerId: null,
    messages: [
      {
        id: random? getRandomId() : '1',
        senderId: '1',
        content: 'You on your way?',
        createdAt: moment().subtract(1, 'hours').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: '3',
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: ['1', '3'],
      },
      {
        id: random? getRandomId() : '2',
        senderId: '3',
        content: 'Yep!',
        createdAt: moment().subtract(1, 'hours').add(5, 'minutes').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: '1',
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: ['3', '1'],
      },
    ],
  },
  {
    id: '2',
    name: null,
    picture: null,
    userIds: ['1', '4'],
    listingIds: ['1', '4'],
    adminIds: null,
    ownerId: null,
    messages: [
      {
        id: random? getRandomId() : '1',
        senderId: '1',
        content: 'Hey, it\'s me',
        createdAt: moment().subtract(2, 'hours').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: '4',
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: ['1', '4'],
      },
    ],
  },
  {
    id: '3',
    name: null,
    picture: null,
    userIds: ['1', '5'],
    listingIds: ['1', '5'],
    adminIds: null,
    ownerId: null,
    messages: [
      {
        id: random? getRandomId() : '1',
        senderId: '1',
        content: 'I should buy a boat',
        createdAt: moment().subtract(1, 'days').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: '5',
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: ['1', '5'],
      },
      {
        id: random? getRandomId() : '2',
        senderId: '1',
        content: 'You still there?',
        createdAt: moment().subtract(1, 'days').add(16, 'hours').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: '5',
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: ['1', '5'],
      },
    ],
  },
  {
    id: '4',
    name: null,
    picture: null,
    userIds: ['3', '4'],
    listingIds: ['3', '4'],
    adminIds: null,
    ownerId: null,
    messages: [
      {
        id: random? getRandomId() : '1',
        senderId: '3',
        content: 'Look at my mukluks!',
        createdAt: moment().subtract(4, 'days').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: '4',
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: ['3', '4'],
      },
    ],
  },
  {
    id: '5',
    name: null,
    picture: null,
    userIds: ['2', '5'],
    listingIds: ['2', '5'],
    adminIds: null,
    ownerId: null,
    messages: [
      {
        id: random? getRandomId() : '1',
        senderId: '2',
        content: 'This is wicked good ice cream.',
        createdAt: moment().subtract(2, 'weeks').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: '5',
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: ['2', '5'],
      },
      {
        id: random? getRandomId() : '2',
        senderId: '5',
        content: 'Love it!',
        createdAt: moment().subtract(2, 'weeks').add(10, 'minutes').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: '2',
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: ['5', '2'],
      },
    ],
  },
  {
    id: '6',
    name: null,
    picture: null,
    userIds: ['1', '6'],
    listingIds: ['1'],
    adminIds: null,
    ownerId: null,
    messages: [],
  },
  {
    id: '7',
    name: null,
    picture: null,
    userIds: ['2', '1'],
    listingIds: ['2'],
    adminIds: null,
    ownerId: null,
    messages: [],
  },
  {
    id: '8',
    name: 'A user 0 group',
    picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
    userIds: ['1', '3', '4', '6'],
    listingIds: ['1', '3', '4', '6'],
    memberIds: ['1', '4', '6'],
    adminIds: ['1', '6'],
    ownerId: '1',
    messages: [
      {
        id: random? getRandomId() : '1',
        senderId: '1',
        content: 'I made a group',
        createdAt: moment().subtract(2, 'weeks').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: '3',
            receivedAt: null,
            readAt: null,
          },
          {
            id: '4',
            receivedAt: moment().subtract(2, 'weeks').add(1, 'minutes').unix(),
            readAt: moment().subtract(2, 'weeks').add(5, 'minutes').unix(),
          },
          {
            id: '6',
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: ['1', '3', '4', '6'],
      },
      {
        id: random? getRandomId() : '2',
        senderId: '1',
        content: 'Ops, user 2 was not supposed to be here',
        createdAt: moment().subtract(2, 'weeks').add(2, 'minutes').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: '4',
            receivedAt: moment().subtract(2, 'weeks').add(3, 'minutes').unix(),
            readAt: moment().subtract(2, 'weeks').add(5, 'minutes').unix(),
          },
          {
            id: '6',
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: ['1', '4', '6'],
      },
      {
        id: random? getRandomId() : '3',
        senderId: '4',
        content: 'Awesome!',
        createdAt: moment().subtract(2, 'weeks').add(10, 'minutes').unix(),
        type: MessageType.TEXT,
        recipients: [
          {
            id: '1',
            receivedAt: null,
            readAt: null,
          },
          {
            id: '6',
            receivedAt: null,
            readAt: null,
          },
        ],
        holderIds: ['1', '4', '6'],
      },
    ],
  },
  {
    id: '9',
    name: 'A user 5 group',
    picture: null,
    userIds: ['6', '3'],
    listingIds: ['6', '3'],
    memberIds: ['6', '3'],
    adminIds: ['6'],
    ownerId: '6',
    messages: [],
  },
];

export const db = {users, chats};

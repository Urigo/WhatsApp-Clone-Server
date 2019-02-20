import moment from 'moment'
import Chat from './entity/chat'
import Message, { MessageType } from './entity/message'
import User from './entity/user'

const users: User[] = [
  {
    id: '1',
    username: 'ethan',
    password: '$2a$08$NO9tkFLCoSqX1c5wk3s7z.JfxaVMKA.m7zUDdDwEquo4rvzimQeJm', // 111
    name: 'Ethan Gonzalez',
    picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
  },
  {
    id: '2',
    username: 'bryan',
    password: '$2a$08$xE4FuCi/ifxjL2S8CzKAmuKLwv18ktksSN.F3XYEnpmcKtpbpeZgO', // 222
    name: 'Bryan Wallace',
    picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
  },
  {
    id: '3',
    username: 'avery',
    password: '$2a$08$UHgH7J8G6z1mGQn2qx2kdeWv0jvgHItyAsL9hpEUI3KJmhVW5Q1d.', // 333
    name: 'Avery Stewart',
    picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
  },
  {
    id: '4',
    username: 'katie',
    password: '$2a$08$wR1k5Q3T9FC7fUgB7Gdb9Os/GV7dGBBf4PLlWT7HERMFhmFDt47xi', // 444
    name: 'Katie Peterson',
    picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
  },
  {
    id: '5',
    username: 'ray',
    password: '$2a$08$6.mbXqsDX82ZZ7q5d8Osb..JrGSsNp4R3IKj7mxgF6YGT0OmMw242', // 555
    name: 'Ray Edwards',
    picture: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
  },
  {
    id: '6',
    username: 'niko',
    password: '$2a$08$fL5lZR.Rwf9FWWe8XwwlceiPBBim8n9aFtaem.INQhiKT4.Ux3Uq.', // 666
    name: 'Niccolò Belli',
    picture: 'https://randomuser.me/api/portraits/thumb/men/4.jpg',
  },
  {
    id: '7',
    username: 'mario',
    password: '$2a$08$nDHDmWcVxDnH5DDT3HMMC.psqcnu6wBiOgkmJUy9IH..qxa3R6YrO', // 777
    name: 'Mario Rossi',
    picture: 'https://randomuser.me/api/portraits/thumb/men/5.jpg',
  },
]

const chats: Chat[] = [
  {
    id: '1',
    name: null,
    picture: null,
    allTimeMemberIds: ['1', '3'],
    listingMemberIds: ['1', '3'],
    ownerId: null,
    messages: [
      {
        id: '1',
        chatId: '1',
        senderId: '1',
        content: 'You on your way?',
        createdAt: moment()
          .subtract(1, 'hours')
          .unix(),
        type: MessageType.TEXT,
        holderIds: ['1', '3'],
      },
      {
        id: '2',
        chatId: '1',
        senderId: '3',
        content: 'Yep!',
        createdAt: moment()
          .subtract(1, 'hours')
          .add(5, 'minutes')
          .unix(),
        type: MessageType.TEXT,
        holderIds: ['3', '1'],
      },
    ],
  },
  {
    id: '2',
    name: null,
    picture: null,
    allTimeMemberIds: ['1', '4'],
    listingMemberIds: ['1', '4'],
    ownerId: null,
    messages: [
      {
        id: '1',
        chatId: '2',
        senderId: '1',
        content: "Hey, it's me",
        createdAt: moment()
          .subtract(2, 'hours')
          .unix(),
        type: MessageType.TEXT,
        holderIds: ['1', '4'],
      },
    ],
  },
  {
    id: '3',
    name: null,
    picture: null,
    allTimeMemberIds: ['1', '5'],
    listingMemberIds: ['1', '5'],
    ownerId: null,
    messages: [
      {
        id: '1',
        chatId: '3',
        senderId: '1',
        content: 'I should buy a boat',
        createdAt: moment()
          .subtract(1, 'days')
          .unix(),
        type: MessageType.TEXT,
        holderIds: ['1', '5'],
      },
      {
        id: '2',
        chatId: '3',
        senderId: '1',
        content: 'You still there?',
        createdAt: moment()
          .subtract(1, 'days')
          .add(16, 'hours')
          .unix(),
        type: MessageType.TEXT,
        holderIds: ['1', '5'],
      },
    ],
  },
  {
    id: '4',
    name: null,
    picture: null,
    allTimeMemberIds: ['3', '4'],
    listingMemberIds: ['3', '4'],
    ownerId: null,
    messages: [
      {
        id: '1',
        chatId: '4',
        senderId: '3',
        content: 'Look at my mukluks!',
        createdAt: moment()
          .subtract(4, 'days')
          .unix(),
        type: MessageType.TEXT,
        holderIds: ['3', '4'],
      },
    ],
  },
  {
    id: '5',
    name: null,
    picture: null,
    allTimeMemberIds: ['2', '5'],
    listingMemberIds: ['2', '5'],
    ownerId: null,
    messages: [
      {
        id: '1',
        chatId: '5',
        senderId: '2',
        content: 'This is wicked good ice cream.',
        createdAt: moment()
          .subtract(2, 'weeks')
          .unix(),
        type: MessageType.TEXT,
        holderIds: ['2', '5'],
      },
      {
        id: '2',
        chatId: '6',
        senderId: '5',
        content: 'Love it!',
        createdAt: moment()
          .subtract(2, 'weeks')
          .add(10, 'minutes')
          .unix(),
        type: MessageType.TEXT,
        holderIds: ['5', '2'],
      },
    ],
  },
  {
    id: '6',
    name: null,
    picture: null,
    allTimeMemberIds: ['1', '6'],
    listingMemberIds: ['1'],
    ownerId: null,
    messages: [],
  },
  {
    id: '7',
    name: null,
    picture: null,
    allTimeMemberIds: ['2', '1'],
    listingMemberIds: ['2'],
    ownerId: null,
    messages: [],
  },
  {
    id: '8',
    name: 'A user 0 group',
    picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
    allTimeMemberIds: ['1', '3', '4', '6'],
    listingMemberIds: ['1', '3', '4', '6'],
    ownerId: '1',
    messages: [
      {
        id: '1',
        chatId: '8',
        senderId: '1',
        content: 'I made a group',
        createdAt: moment()
          .subtract(2, 'weeks')
          .unix(),
        type: MessageType.TEXT,
        holderIds: ['1', '3', '4', '6'],
      },
      {
        id: '2',
        chatId: '8',
        senderId: '1',
        content: 'Ops, user 3 was not supposed to be here',
        createdAt: moment()
          .subtract(2, 'weeks')
          .add(2, 'minutes')
          .unix(),
        type: MessageType.TEXT,
        holderIds: ['1', '4', '6'],
      },
      {
        id: '3',
        chatId: '8',
        senderId: '4',
        content: 'Awesome!',
        createdAt: moment()
          .subtract(2, 'weeks')
          .add(10, 'minutes')
          .unix(),
        type: MessageType.TEXT,
        holderIds: ['1', '4', '6'],
      },
    ],
  },
  {
    id: '9',
    name: 'A user 5 group',
    picture: null,
    allTimeMemberIds: ['6', '3'],
    listingMemberIds: ['6', '3'],
    ownerId: '6',
    messages: [],
  },
]

export default { users, chats }

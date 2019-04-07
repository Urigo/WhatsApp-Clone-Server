export type User = {
  id: string;
  name: string;
  username: string;
  password: string;
  picture: string;
};

export type Message = {
  id: string;
  content: string;
  createdAt: Date;
  sender: string;
  recipient: string;
};

export type Chat = {
  id: string;
  messages: string[];
  participants: string[];
};

export const users: User[] = [];
export const messages: Message[] = [];
export const chats: Chat[] = [];

export const resetDb = () => {
  users.splice(
    0,
    Infinity,
    ...[
      {
        id: '1',
        name: 'Ray Edwards',
        username: 'ray',
        password:
          '$2a$08$NO9tkFLCoSqX1c5wk3s7z.JfxaVMKA.m7zUDdDwEquo4rvzimQeJm', // 111
        picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
      },
      {
        id: '2',
        name: 'Ethan Gonzalez',
        username: 'ethan',
        password:
          '$2a$08$xE4FuCi/ifxjL2S8CzKAmuKLwv18ktksSN.F3XYEnpmcKtpbpeZgO', // 222
        picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
      },
      {
        id: '3',
        name: 'Bryan Wallace',
        username: 'bryan',
        password:
          '$2a$08$UHgH7J8G6z1mGQn2qx2kdeWv0jvgHItyAsL9hpEUI3KJmhVW5Q1d.', // 333
        picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
      },
      {
        id: '4',
        name: 'Avery Stewart',
        username: 'avery',
        password:
          '$2a$08$wR1k5Q3T9FC7fUgB7Gdb9Os/GV7dGBBf4PLlWT7HERMFhmFDt47xi', // 444
        picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
      },
      {
        id: '5',
        name: 'Katie Peterson',
        username: 'katie',
        password:
          '$2a$08$6.mbXqsDX82ZZ7q5d8Osb..JrGSsNp4R3IKj7mxgF6YGT0OmMw242', // 555
        picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
      },
    ]
  );

  messages.splice(
    0,
    Infinity,
    ...[
      {
        id: '1',
        content: 'You on your way?',
        createdAt: new Date(new Date('1-1-2019').getTime() - 60 * 1000 * 1000),
        sender: '1',
        recipient: '2',
      },
      {
        id: '2',
        content: "Hey, it's me",
        createdAt: new Date(
          new Date('1-1-2019').getTime() - 2 * 60 * 1000 * 1000
        ),
        sender: '1',
        recipient: '3',
      },
      {
        id: '3',
        content: 'I should buy a boat',
        createdAt: new Date(
          new Date('1-1-2019').getTime() - 24 * 60 * 1000 * 1000
        ),
        sender: '1',
        recipient: '4',
      },
      {
        id: '4',
        content: 'This is wicked good ice cream.',
        createdAt: new Date(
          new Date('1-1-2019').getTime() - 14 * 24 * 60 * 1000 * 1000
        ),
        sender: '1',
        recipient: '5',
      },
    ]
  );

  chats.splice(
    0,
    Infinity,
    ...[
      {
        id: '1',
        participants: ['1', '2'],
        messages: ['1'],
      },
      {
        id: '2',
        participants: ['1', '3'],
        messages: ['2'],
      },
      {
        id: '3',
        participants: ['1', '4'],
        messages: ['3'],
      },
      {
        id: '4',
        participants: ['1', '5'],
        messages: ['4'],
      },
    ]
  );
};

resetDb();

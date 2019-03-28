export type User = {
  id: string;
  name: string;
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
        picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
      },
      {
        id: '2',
        name: 'Ethan Gonzalez',
        picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
      },
      {
        id: '3',
        name: 'Bryan Wallace',
        picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
      },
      {
        id: '4',
        name: 'Avery Stewart',
        picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
      },
      {
        id: '5',
        name: 'Katie Peterson',
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

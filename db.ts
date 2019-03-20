export const messages = [
  {
    id: '1',
    content: 'You on your way?',
    createdAt: new Date(new Date('1-1-2019').getTime() - 60 * 1000 * 1000),
  },
  {
    id: '2',
    content: "Hey, it's me",
    createdAt: new Date(new Date('1-1-2019').getTime() - 2 * 60 * 1000 * 1000),
  },
  {
    id: '3',
    content: 'I should buy a boat',
    createdAt: new Date(new Date('1-1-2019').getTime() - 24 * 60 * 1000 * 1000),
  },
  {
    id: '4',
    content: 'This is wicked good ice cream.',
    createdAt: new Date(
      new Date('1-1-2019').getTime() - 14 * 24 * 60 * 1000 * 1000
    ),
  },
];

export const chats = [
  {
    id: '1',
    name: 'Ethan Gonzalez',
    picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
    messages: ['1'],
  },
  {
    id: '2',
    name: 'Bryan Wallace',
    picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
    messages: ['2'],
  },
  {
    id: '3',
    name: 'Avery Stewart',
    picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
    messages: ['3'],
  },
  {
    id: '4',
    name: 'Katie Peterson',
    picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
    messages: ['4'],
  },
];

import 'reflect-metadata';
import { Chat } from './entity/Chat';
import { Recipient } from './entity/Recipient';
import moment from 'moment';
import { Message } from './entity/Message';
import { User } from './entity/User';
import { Connection } from 'typeorm';
import AccountsPassword from '@accounts/password';
import { hashPassword } from '@accounts/password/lib/utils';

export enum MessageType {
  PICTURE,
  TEXT,
  LOCATION,
}

export async function addSampleData(connection: Connection, accountsPassword: AccountsPassword) {

  const userId1 = await accountsPassword.createUser({
    username: 'ethan',
    password: hashPassword('111', 'sha256'),
    name: 'Ethan Gonzalez',
    picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
    phone: '+391234567890',
  });

  const userId2 = await accountsPassword.createUser({
    username: 'bryan',
    password: hashPassword('222', 'sha256'),
    name: 'Bryan Wallace',
    picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
    phone: '+391234567891',
  });

  const userId3 = await accountsPassword.createUser({
    username: 'avery',
    password: hashPassword('333', 'sha256'),
    name: 'Avery Stewart',
    picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
    phone: '+391234567892',
  });

  const userId4 = await accountsPassword.createUser({
    username: 'katie',
    password: hashPassword('444', 'sha256'),
    name: 'Katie Peterson',
    picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
    phone: '+391234567893',
  });

  const userId5 = await accountsPassword.createUser({
    username: 'ray',
    password: hashPassword('555', 'sha256'),
    name: 'Ray Edwards',
    picture: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
    phone: '+391234567894',
  });

  const userId6 = await accountsPassword.createUser({
    username: 'niko',
    password: hashPassword('666', 'sha256'),
    name: 'Niccolò Belli',
    picture: 'https://randomuser.me/api/portraits/thumb/men/4.jpg',
    phone: '+391234567895',
  });

  const userId7 = await accountsPassword.createUser({
    username: 'mario',
    password: hashPassword('777', 'sha256'),
    name: 'Mario Rossi',
    picture: 'https://randomuser.me/api/portraits/thumb/men/5.jpg',
    phone: '+391234567896',
  });
  
  const user1 = await connection.getRepository(User).findOne(userId1) as User;
  const user2 = await connection.getRepository(User).findOne(userId2) as User;
  const user3 = await connection.getRepository(User).findOne(userId3) as User;
  const user4 = await connection.getRepository(User).findOne(userId4) as User;
  const user5 = await connection.getRepository(User).findOne(userId5) as User;
  const user6 = await connection.getRepository(User).findOne(userId6) as User;
  const user7 = await connection.getRepository(User).findOne(userId7) as User;


  await connection.manager.save(new Chat({
    allTimeMembers: [user1, user3],
    listingMembers: [user1, user3],
    messages: [
      new Message({
        sender: user1,
        content: 'You on your way?',
        createdAt: moment().subtract(1, 'hours').toDate(),
        type: MessageType.TEXT,
        holders: [user1, user3],
        recipients: [
          new Recipient({
            user: user3,
          }),
        ],
      }),
      new Message({
        sender: user3,
        content: 'Yep!',
        createdAt: moment().subtract(1, 'hours').add(5, 'minutes').toDate(),
        type: MessageType.TEXT,
        holders: [user1, user3],
        recipients: [
          new Recipient({
            user: user1,
          }),
        ],
      }),
    ],
  }));

  await connection.manager.save(new Chat({
    allTimeMembers: [user1, user4],
    listingMembers: [user1, user4],
    messages: [
      new Message({
        sender: user1,
        content: 'Hey, it\'s me',
        createdAt: moment().subtract(2, 'hours').toDate(),
        type: MessageType.TEXT,
        holders: [user1, user4],
        recipients: [
          new Recipient({
            user: user4,
          }),
        ],
      }),
    ],
  }));

  await connection.manager.save(new Chat({
    allTimeMembers: [user1, user5],
    listingMembers: [user1, user5],
    messages: [
      new Message({
        sender: user1,
        content: 'I should buy a boat',
        createdAt: moment().subtract(1, 'days').toDate(),
        type: MessageType.TEXT,
        holders: [user1, user5],
        recipients: [
          new Recipient({
            user: user5,
          }),
        ],
      }),
      new Message({
        sender: user1,
        content: 'You still there?',
        createdAt: moment().subtract(1, 'days').add(16, 'hours').toDate(),
        type: MessageType.TEXT,
        holders: [user1, user5],
        recipients: [
          new Recipient({
            user: user5,
          }),
        ],
      }),
    ],
  }));

  await connection.manager.save(new Chat({
    allTimeMembers: [user3, user4],
    listingMembers: [user3, user4],
    messages: [
      new Message({
        sender: user3,
        content: 'Look at my mukluks!',
        createdAt: moment().subtract(4, 'days').toDate(),
        type: MessageType.TEXT,
        holders: [user3, user4],
        recipients: [
          new Recipient({
            user: user4,
          }),
        ],
      }),
    ],
  }));

  await connection.manager.save(new Chat({
    allTimeMembers: [user2, user5],
    listingMembers: [user2, user5],
    messages: [
      new Message({
        sender: user2,
        content: 'This is wicked good ice cream.',
        createdAt: moment().subtract(2, 'weeks').toDate(),
        type: MessageType.TEXT,
        holders: [user2, user5],
        recipients: [
          new Recipient({
            user: user5,
          }),
        ],
      }),
      new Message({
        sender: user5,
        content: 'Love it!',
        createdAt: moment().subtract(2, 'weeks').add(10, 'minutes').toDate(),
        type: MessageType.TEXT,
        holders: [user2, user5],
        recipients: [
          new Recipient({
            user: user2,
          }),
        ],
      }),
    ],
  }));

  await connection.manager.save(new Chat({
    allTimeMembers: [user1, user6],
    listingMembers: [user1],
  }));

  await connection.manager.save(new Chat({
    allTimeMembers: [user2, user1],
    listingMembers: [user2],
  }));

  await connection.manager.save(new Chat({
    name: 'Ethan\'s group',
    picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
    allTimeMembers: [user1, user3, user4, user6],
    listingMembers: [user1, user3, user4, user6],
    actualGroupMembers: [user1, user4, user6],
    admins: [user1, user6],
    owner: user1,
    messages: [
      new Message({
        sender: user1,
        content: 'I made a group',
        createdAt: moment().subtract(2, 'weeks').toDate(),
        type: MessageType.TEXT,
        holders: [user1, user3, user4, user6],
        recipients: [
          new Recipient({
            user: user3,
          }),
          new Recipient({
            user: user4,
          }),
          new Recipient({
            user: user6,
          }),
        ],
      }),
      new Message({
        sender: user1,
        content: 'Ops, Avery was not supposed to be here',
        createdAt: moment().subtract(2, 'weeks').add(2, 'minutes').toDate(),
        type: MessageType.TEXT,
        holders: [user1, user4, user6],
        recipients: [
          new Recipient({
            user: user4,
          }),
          new Recipient({
            user: user6,
          }),
        ],
      }),
      new Message({
        sender: user4,
        content: 'Awesome!',
        createdAt: moment().subtract(2, 'weeks').add(10, 'minutes').toDate(),
        type: MessageType.TEXT,
        holders: [user1, user4, user6],
        recipients: [
          new Recipient({
            user: user1,
          }),
          new Recipient({
            user: user6,
          }),
        ],
      }),
    ],
  }));

  await connection.manager.save(new Chat({
    name: 'Ray\'s group',
    allTimeMembers: [user3, user6],
    listingMembers: [user3, user6],
    actualGroupMembers: [user3, user6],
    admins: [user6],
    owner: user6,
  }));
}

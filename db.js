"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// For TypeORM
require("reflect-metadata");
const Chat_1 = require("./entity/Chat");
const Recipient_1 = require("./entity/Recipient");
const moment_1 = __importDefault(require("moment"));
const Message_1 = require("./entity/Message");
const User_1 = require("./entity/User");
var MessageType;
(function (MessageType) {
    MessageType[MessageType["PICTURE"] = 0] = "PICTURE";
    MessageType[MessageType["TEXT"] = 1] = "TEXT";
    MessageType[MessageType["LOCATION"] = 2] = "LOCATION";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
async function addSampleData(connection) {
    const user1 = new User_1.User({
        username: 'ethan',
        password: '$2a$08$NO9tkFLCoSqX1c5wk3s7z.JfxaVMKA.m7zUDdDwEquo4rvzimQeJm',
        name: 'Ethan Gonzalez',
        picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
        phone: '+391234567890',
    });
    await connection.manager.save(user1);
    const user2 = new User_1.User({
        username: 'bryan',
        password: '$2a$08$xE4FuCi/ifxjL2S8CzKAmuKLwv18ktksSN.F3XYEnpmcKtpbpeZgO',
        name: 'Bryan Wallace',
        picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
        phone: '+391234567891',
    });
    await connection.manager.save(user2);
    const user3 = new User_1.User({
        username: 'avery',
        password: '$2a$08$UHgH7J8G6z1mGQn2qx2kdeWv0jvgHItyAsL9hpEUI3KJmhVW5Q1d.',
        name: 'Avery Stewart',
        picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
        phone: '+391234567892',
    });
    await connection.manager.save(user3);
    const user4 = new User_1.User({
        username: 'katie',
        password: '$2a$08$wR1k5Q3T9FC7fUgB7Gdb9Os/GV7dGBBf4PLlWT7HERMFhmFDt47xi',
        name: 'Katie Peterson',
        picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
        phone: '+391234567893',
    });
    await connection.manager.save(user4);
    const user5 = new User_1.User({
        username: 'ray',
        password: '$2a$08$6.mbXqsDX82ZZ7q5d8Osb..JrGSsNp4R3IKj7mxgF6YGT0OmMw242',
        name: 'Ray Edwards',
        picture: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
        phone: '+391234567894',
    });
    await connection.manager.save(user5);
    const user6 = new User_1.User({
        username: 'niko',
        password: '$2a$08$fL5lZR.Rwf9FWWe8XwwlceiPBBim8n9aFtaem.INQhiKT4.Ux3Uq.',
        name: 'Niccolò Belli',
        picture: 'https://randomuser.me/api/portraits/thumb/men/4.jpg',
        phone: '+391234567895',
    });
    await connection.manager.save(user6);
    const user7 = new User_1.User({
        username: 'mario',
        password: '$2a$08$nDHDmWcVxDnH5DDT3HMMC.psqcnu6wBiOgkmJUy9IH..qxa3R6YrO',
        name: 'Mario Rossi',
        picture: 'https://randomuser.me/api/portraits/thumb/men/5.jpg',
        phone: '+391234567896',
    });
    await connection.manager.save(user7);
    await connection.manager.save(new Chat_1.Chat({
        createdAt: moment_1.default().subtract(10, 'weeks').toDate(),
        allTimeMembers: [user1, user3],
        listingMembers: [user1, user3],
        messages: [
            new Message_1.Message({
                sender: user1,
                content: 'You on your way?',
                createdAt: moment_1.default().subtract(1, 'hours').toDate(),
                type: MessageType.TEXT,
                holders: [user1, user3],
                recipients: [
                    new Recipient_1.Recipient({
                        user: user3,
                    }),
                ],
            }),
            new Message_1.Message({
                sender: user3,
                content: 'Yep!',
                createdAt: moment_1.default().subtract(1, 'hours').add(5, 'minutes').toDate(),
                type: MessageType.TEXT,
                holders: [user1, user3],
                recipients: [
                    new Recipient_1.Recipient({
                        user: user1,
                    }),
                ],
            }),
        ],
    }));
    await connection.manager.save(new Chat_1.Chat({
        createdAt: moment_1.default().subtract(9, 'weeks').toDate(),
        allTimeMembers: [user1, user4],
        listingMembers: [user1, user4],
        messages: [
            new Message_1.Message({
                sender: user1,
                content: 'Hey, it\'s me',
                createdAt: moment_1.default().subtract(2, 'hours').toDate(),
                type: MessageType.TEXT,
                holders: [user1, user4],
                recipients: [
                    new Recipient_1.Recipient({
                        user: user4,
                    }),
                ],
            }),
        ],
    }));
    await connection.manager.save(new Chat_1.Chat({
        createdAt: moment_1.default().subtract(8, 'weeks').toDate(),
        allTimeMembers: [user1, user5],
        listingMembers: [user1, user5],
        messages: [
            new Message_1.Message({
                sender: user1,
                content: 'I should buy a boat',
                createdAt: moment_1.default().subtract(1, 'days').toDate(),
                type: MessageType.TEXT,
                holders: [user1, user5],
                recipients: [
                    new Recipient_1.Recipient({
                        user: user5,
                    }),
                ],
            }),
            new Message_1.Message({
                sender: user1,
                content: 'You still there?',
                createdAt: moment_1.default().subtract(1, 'days').add(16, 'hours').toDate(),
                type: MessageType.TEXT,
                holders: [user1, user5],
                recipients: [
                    new Recipient_1.Recipient({
                        user: user5,
                    }),
                ],
            }),
        ],
    }));
    await connection.manager.save(new Chat_1.Chat({
        createdAt: moment_1.default().subtract(7, 'weeks').toDate(),
        allTimeMembers: [user3, user4],
        listingMembers: [user3, user4],
        messages: [
            new Message_1.Message({
                sender: user3,
                content: 'Look at my mukluks!',
                createdAt: moment_1.default().subtract(4, 'days').toDate(),
                type: MessageType.TEXT,
                holders: [user3, user4],
                recipients: [
                    new Recipient_1.Recipient({
                        user: user4,
                    }),
                ],
            }),
        ],
    }));
    await connection.manager.save(new Chat_1.Chat({
        createdAt: moment_1.default().subtract(6, 'weeks').toDate(),
        allTimeMembers: [user2, user5],
        listingMembers: [user2, user5],
        messages: [
            new Message_1.Message({
                sender: user2,
                content: 'This is wicked good ice cream.',
                createdAt: moment_1.default().subtract(2, 'weeks').toDate(),
                type: MessageType.TEXT,
                holders: [user2, user5],
                recipients: [
                    new Recipient_1.Recipient({
                        user: user5,
                    }),
                ],
            }),
            new Message_1.Message({
                sender: user5,
                content: 'Love it!',
                createdAt: moment_1.default().subtract(2, 'weeks').add(10, 'minutes').toDate(),
                type: MessageType.TEXT,
                holders: [user2, user5],
                recipients: [
                    new Recipient_1.Recipient({
                        user: user2,
                    }),
                ],
            }),
        ],
    }));
    await connection.manager.save(new Chat_1.Chat({
        createdAt: moment_1.default().subtract(5, 'weeks').toDate(),
        allTimeMembers: [user1, user6],
        listingMembers: [user1],
    }));
    await connection.manager.save(new Chat_1.Chat({
        createdAt: moment_1.default().subtract(4, 'weeks').toDate(),
        allTimeMembers: [user2, user1],
        listingMembers: [user2],
    }));
    await connection.manager.save(new Chat_1.Chat({
        createdAt: moment_1.default().subtract(3, 'weeks').toDate(),
        name: 'Ethan\'s group',
        picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
        allTimeMembers: [user1, user3, user4, user6],
        listingMembers: [user1, user3, user4, user6],
        actualGroupMembers: [user1, user4, user6],
        admins: [user1, user6],
        owner: user1,
        messages: [
            new Message_1.Message({
                sender: user1,
                content: 'I made a group',
                createdAt: moment_1.default().subtract(2, 'weeks').toDate(),
                type: MessageType.TEXT,
                holders: [user1, user3, user4, user6],
                recipients: [
                    new Recipient_1.Recipient({
                        user: user3,
                    }),
                    new Recipient_1.Recipient({
                        user: user4,
                    }),
                    new Recipient_1.Recipient({
                        user: user6,
                    }),
                ],
            }),
            new Message_1.Message({
                sender: user1,
                content: 'Ops, Avery was not supposed to be here',
                createdAt: moment_1.default().subtract(2, 'weeks').add(2, 'minutes').toDate(),
                type: MessageType.TEXT,
                holders: [user1, user4, user6],
                recipients: [
                    new Recipient_1.Recipient({
                        user: user4,
                    }),
                    new Recipient_1.Recipient({
                        user: user6,
                    }),
                ],
            }),
            new Message_1.Message({
                sender: user4,
                content: 'Awesome!',
                createdAt: moment_1.default().subtract(2, 'weeks').add(10, 'minutes').toDate(),
                type: MessageType.TEXT,
                holders: [user1, user4, user6],
                recipients: [
                    new Recipient_1.Recipient({
                        user: user1,
                    }),
                    new Recipient_1.Recipient({
                        user: user6,
                    }),
                ],
            }),
        ],
    }));
    await connection.manager.save(new Chat_1.Chat({
        createdAt: moment_1.default().subtract(2, 'weeks').toDate(),
        name: 'Ray\'s group',
        allTimeMembers: [user3, user6],
        listingMembers: [user3, user6],
        actualGroupMembers: [user3, user6],
        admins: [user6],
        owner: user6,
    }));
}
exports.addSampleData = addSampleData;

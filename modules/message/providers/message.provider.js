"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const di_1 = require("@graphql-modules/di");
const apollo_server_express_1 = require("apollo-server-express");
const typeorm_1 = require("typeorm");
const chat_provider_1 = require("../../chat/providers/chat.provider");
const Message_1 = require("../../../entity/Message");
const db_1 = require("../../../db");
const auth_provider_1 = require("../../auth/providers/auth.provider");
const user_provider_1 = require("../../user/providers/user.provider");
let MessageProvider = class MessageProvider {
    constructor(pubsub, connection, chatProvider, authProvider, userProvider) {
        this.pubsub = pubsub;
        this.connection = connection;
        this.chatProvider = chatProvider;
        this.authProvider = authProvider;
        this.userProvider = userProvider;
        this.repository = this.connection.getRepository(Message_1.Message);
        this.currentUser = this.authProvider.currentUser;
    }
    createQueryBuilder() {
        return this.connection.createQueryBuilder(Message_1.Message, 'message');
    }
    async addMessage(chatId, content) {
        if (content === null || content === '') {
            throw new Error(`Cannot add empty or null messages.`);
        }
        let chat = await this.chatProvider
            .createQueryBuilder()
            .whereInIds(chatId)
            .innerJoinAndSelect('chat.allTimeMembers', 'allTimeMembers')
            .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
            .leftJoinAndSelect('chat.actualGroupMembers', 'actualGroupMembers')
            .getOne();
        if (!chat) {
            throw new Error(`Cannot find chat ${chatId}.`);
        }
        let holders;
        if (!chat.name) {
            // Chat
            if (!chat.listingMembers.map(user => user.id).includes(this.currentUser.id)) {
                throw new Error(`The chat ${chatId} must be listed for the current user in order to add a message.`);
            }
            // Receiver's user
            const receiver = chat.allTimeMembers.find(user => user.id !== this.currentUser.id);
            if (!receiver) {
                throw new Error(`Cannot find receiver's user.`);
            }
            if (!chat.listingMembers.find(listingMember => listingMember.id === receiver.id)) {
                // Chat is not listed for the receiver user. Add him to the listingIds
                chat.listingMembers.push(receiver);
                await this.chatProvider.repository.save(chat);
                this.pubsub.publish('chatAdded', {
                    creatorId: this.currentUser.id,
                    chatAdded: chat,
                });
            }
            holders = chat.listingMembers;
        }
        else {
            // Group
            if (!chat.actualGroupMembers || !chat.actualGroupMembers.find(actualGroupMember => actualGroupMember.id === this.currentUser.id)) {
                throw new Error(`The user is not a member of the group ${chatId}. Cannot add message.`);
            }
            holders = chat.actualGroupMembers;
        }
        const message = await this.repository.save(new Message_1.Message({
            chat,
            sender: this.currentUser,
            content,
            type: db_1.MessageType.TEXT,
            holders,
        }));
        this.pubsub.publish('messageAdded', {
            messageAdded: message,
        });
        return message || null;
    }
    async _removeMessages(chatId, { messageIds, all, } = {}) {
        const chat = await this.chatProvider
            .createQueryBuilder()
            .whereInIds(chatId)
            .innerJoinAndSelect('chat.listingMembers', 'listingMembers')
            .innerJoinAndSelect('chat.messages', 'messages')
            .innerJoinAndSelect('messages.holders', 'holders')
            .getOne();
        if (!chat) {
            throw new Error(`Cannot find chat ${chatId}.`);
        }
        if (!chat.listingMembers.find(user => user.id === this.currentUser.id)) {
            throw new Error(`The chat/group ${chatId} is not listed for the current user so there is nothing to delete.`);
        }
        if (all && messageIds) {
            throw new Error(`Cannot specify both 'all' and 'messageIds'.`);
        }
        if (!all && !(messageIds && messageIds.length)) {
            throw new Error(`'all' and 'messageIds' cannot be both null`);
        }
        let deletedIds = [];
        let removedMessages = [];
        // Instead of chaining map and filter we can loop once using reduce
        chat.messages = await chat.messages.reduce(async (filtered$, message) => {
            const filtered = await filtered$;
            if (all || messageIds.map(Number).includes(message.id)) {
                deletedIds.push(String(message.id));
                // Remove the current user from the message holders
                message.holders = message.holders.filter(user => user.id !== this.currentUser.id);
            }
            if (message.holders.length !== 0) {
                // Remove the current user from the message holders
                await this.repository.save(message);
                filtered.push(message);
            }
            else {
                // Message is flagged for removal
                removedMessages.push(message);
            }
            return filtered;
        }, Promise.resolve([]));
        return { deletedIds, removedMessages };
    }
    async removeMessages(chatId, { messageIds, all, } = {}) {
        const { deletedIds, removedMessages } = await this._removeMessages(chatId, { messageIds, all });
        for (let message of removedMessages) {
            await this.repository.remove(message);
        }
        return deletedIds;
    }
    async _removeChatGetMessages(chatId) {
        let messages = await this.createQueryBuilder()
            .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId })
            .leftJoinAndSelect('message.holders', 'holders')
            .getMany();
        messages = messages.map(message => ({
            ...message,
            holders: message.holders.filter(user => user.id !== this.currentUser.id),
        }));
        return messages;
    }
    async removeChat(chatId, messages) {
        if (!messages) {
            messages = await this._removeChatGetMessages(chatId);
        }
        for (let message of messages) {
            message.holders = message.holders.filter(user => user.id !== this.currentUser.id);
            if (message.holders.length !== 0) {
                // Remove the current user from the message holders
                await this.repository.save(message);
            }
            else {
                // Simply remove the message
                await this.repository.remove(message);
            }
        }
        return await this.chatProvider.removeChat(chatId);
    }
    async getMessageSender(message) {
        const sender = await this.userProvider
            .createQueryBuilder()
            .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {
            messageId: message.id,
        })
            .getOne();
        if (!sender) {
            throw new Error(`Message must have a sender.`);
        }
        return sender;
    }
    async getMessageOwnership(message) {
        return !!(await this.userProvider
            .createQueryBuilder()
            .whereInIds(this.currentUser.id)
            .innerJoin('user.senderMessages', 'senderMessages', 'senderMessages.id = :messageId', {
            messageId: message.id,
        })
            .getCount());
    }
    async getMessageHolders(message) {
        return await this.userProvider
            .createQueryBuilder()
            .innerJoin('user.holderMessages', 'holderMessages', 'holderMessages.id = :messageId', {
            messageId: message.id,
        })
            .getMany();
    }
    async getMessageChat(message) {
        const chat = await this.chatProvider
            .createQueryBuilder()
            .innerJoin('chat.messages', 'messages', 'messages.id = :messageId', {
            messageId: message.id
        })
            .getOne();
        if (!chat) {
            throw new Error(`Message must have a chat.`);
        }
        return chat;
    }
    async getChats() {
        // TODO: make a proper query instead of this mess (see https://github.com/typeorm/typeorm/issues/2132)
        const chats = await this.chatProvider
            .createQueryBuilder()
            .leftJoin('chat.listingMembers', 'listingMembers')
            .where('listingMembers.id = :id', { id: this.currentUser.id })
            .getMany();
        for (let chat of chats) {
            chat.messages = await this.getChatMessages(chat);
        }
        return chats.sort((chatA, chatB) => {
            const dateA = chatA.messages.length ? chatA.messages[chatA.messages.length - 1].createdAt : chatA.createdAt;
            const dateB = chatB.messages.length ? chatB.messages[chatB.messages.length - 1].createdAt : chatB.createdAt;
            return dateB.valueOf() - dateA.valueOf();
        });
    }
    async getChatMessages(chat, amount) {
        if (chat.messages) {
            return amount ? chat.messages.slice(-amount) : chat.messages;
        }
        let query = this.createQueryBuilder()
            .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId: chat.id })
            .innerJoin('message.holders', 'holders', 'holders.id = :userId', {
            userId: this.currentUser.id,
        })
            .orderBy({ 'message.createdAt': { order: 'DESC', nulls: 'NULLS LAST' } });
        if (amount) {
            query = query.take(amount);
        }
        return (await query.getMany()).reverse();
    }
    async getChatLastMessage(chat) {
        const messages = await this.getChatMessages(chat, 1);
        return messages && messages.length ? messages[0] : null;
    }
    async getChatUpdatedAt(chat) {
        const latestMessage = await this.getChatLastMessage(chat);
        return latestMessage ? latestMessage.createdAt : null;
    }
    async filterMessageAdded(messageAdded) {
        let relevantUsers;
        if (!messageAdded.chat.name) {
            // Chat
            relevantUsers = (await this.userProvider
                .createQueryBuilder()
                .innerJoin('user.listingMemberChats', 'listingMemberChats', 'listingMemberChats.id = :chatId', { chatId: messageAdded.chat.id })
                .getMany())
                .filter(user => user.id != messageAdded.sender.id);
        }
        else {
            // Group
            relevantUsers = (await this.userProvider
                .createQueryBuilder()
                .innerJoin('user.actualGroupMemberChats', 'actualGroupMemberChats', 'actualGroupMemberChats.id = :chatId', { chatId: messageAdded.chat.id })
                .getMany())
                .filter(user => user.id != messageAdded.sender.id);
        }
        return relevantUsers.some(user => user.id === this.currentUser.id);
    }
};
MessageProvider = __decorate([
    di_1.Injectable(),
    __metadata("design:paramtypes", [apollo_server_express_1.PubSub,
        typeorm_1.Connection,
        chat_provider_1.ChatProvider,
        auth_provider_1.AuthProvider,
        user_provider_1.UserProvider])
], MessageProvider);
exports.MessageProvider = MessageProvider;

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
const typeorm_1 = require("typeorm");
const message_provider_1 = require("../../message/providers/message.provider");
const Recipient_1 = require("../../../entity/Recipient");
const auth_provider_1 = require("../../auth/providers/auth.provider");
let RecipientProvider = class RecipientProvider {
    constructor(authProvider, connection, messageProvider) {
        this.authProvider = authProvider;
        this.connection = connection;
        this.messageProvider = messageProvider;
        this.repository = this.connection.getRepository(Recipient_1.Recipient);
        this.currentUser = this.authProvider.currentUser;
    }
    createQueryBuilder() {
        return this.connection.createQueryBuilder(Recipient_1.Recipient, 'recipient');
    }
    getChatUnreadMessagesCount(chat) {
        return this.messageProvider
            .createQueryBuilder()
            .innerJoin('message.chat', 'chat', 'chat.id = :chatId', { chatId: chat.id })
            .innerJoin('message.recipients', 'recipients', 'recipients.user.id = :userId AND recipients.readAt IS NULL', {
            userId: this.currentUser.id
        })
            .getCount();
    }
    getMessageRecipients(message) {
        return this.createQueryBuilder()
            .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', {
            messageId: message.id,
        })
            .innerJoinAndSelect('recipient.user', 'user')
            .getMany();
    }
    async getRecipientChat(recipient) {
        if (recipient.message.chat) {
            return recipient.message.chat;
        }
        return this.messageProvider.getMessageChat(recipient.message);
    }
    async removeChat(chatId) {
        const messages = await this.messageProvider._removeChatGetMessages(chatId);
        for (let message of messages) {
            if (message.holders.length === 0) {
                const recipients = await this.createQueryBuilder()
                    .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', { messageId: message.id })
                    .innerJoinAndSelect('recipient.user', 'user')
                    .getMany();
                for (let recipient of recipients) {
                    await this.repository.remove(recipient);
                }
            }
        }
        return await this.messageProvider.removeChat(chatId, messages);
    }
    async addMessage(chatId, content) {
        const message = await this.messageProvider.addMessage(chatId, content);
        for (let user of message.holders) {
            if (user.id !== this.currentUser.id) {
                await this.repository.save(new Recipient_1.Recipient({ user, message }));
            }
        }
        return message;
    }
    async removeMessages(chatId, { messageIds, all, } = {}) {
        const { deletedIds, removedMessages } = await this.messageProvider._removeMessages(chatId, { messageIds, all });
        for (let message of removedMessages) {
            const recipients = await this.createQueryBuilder()
                .innerJoinAndSelect('recipient.message', 'message', 'message.id = :messageId', { messageId: message.id })
                .innerJoinAndSelect('recipient.user', 'user')
                .getMany();
            for (let recipient of recipients) {
                await this.repository.remove(recipient);
            }
            await this.messageProvider.repository.remove(message);
        }
        return deletedIds;
    }
};
RecipientProvider = __decorate([
    di_1.Injectable({
        scope: di_1.ProviderScope.Session,
    }),
    __metadata("design:paramtypes", [auth_provider_1.AuthProvider,
        typeorm_1.Connection,
        message_provider_1.MessageProvider])
], RecipientProvider);
exports.RecipientProvider = RecipientProvider;

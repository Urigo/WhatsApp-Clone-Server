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
const typeorm_1 = require("typeorm");
const Chat_1 = require("./Chat");
const User_1 = require("./User");
const Recipient_1 = require("./Recipient");
let Message = class Message {
    constructor({ sender, content, createdAt, type, recipients, holders, chat } = {}) {
        if (sender) {
            this.sender = sender;
        }
        if (content) {
            this.content = content;
        }
        if (createdAt) {
            this.createdAt = createdAt;
        }
        if (type) {
            this.type = type;
        }
        if (recipients) {
            recipients.forEach(recipient => recipient.message = this);
            this.recipients = recipients;
        }
        if (holders) {
            this.holders = holders;
        }
        if (chat) {
            this.chat = chat;
        }
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Message.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User_1.User, user => user.senderMessages, { eager: true }),
    __metadata("design:type", User_1.User)
], Message.prototype, "sender", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
__decorate([
    typeorm_1.CreateDateColumn({ nullable: true }),
    __metadata("design:type", Date)
], Message.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Message.prototype, "type", void 0);
__decorate([
    typeorm_1.OneToMany(type => Recipient_1.Recipient, recipient => recipient.message, { cascade: ["insert", "update"], eager: true }),
    __metadata("design:type", Array)
], Message.prototype, "recipients", void 0);
__decorate([
    typeorm_1.ManyToMany(type => User_1.User, user => user.holderMessages, { cascade: ["insert", "update"], eager: true }),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], Message.prototype, "holders", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Chat_1.Chat, chat => chat.messages),
    __metadata("design:type", Chat_1.Chat)
], Message.prototype, "chat", void 0);
Message = __decorate([
    typeorm_1.Entity(),
    __metadata("design:paramtypes", [Object])
], Message);
exports.Message = Message;

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
const Message_1 = require("./Message");
const User_1 = require("./User");
const Chat_1 = require("./Chat");
let Recipient = class Recipient {
    constructor({ user, message, receivedAt, readAt } = {}) {
        if (user) {
            this.user = user;
        }
        if (message) {
            this.message = message;
        }
        if (receivedAt) {
            this.receivedAt = receivedAt;
        }
        if (readAt) {
            this.readAt = readAt;
        }
    }
};
__decorate([
    typeorm_1.ManyToOne(type => User_1.User, user => user.recipients, { primary: true }),
    __metadata("design:type", User_1.User)
], Recipient.prototype, "user", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Message_1.Message, message => message.recipients, { primary: true }),
    __metadata("design:type", Message_1.Message)
], Recipient.prototype, "message", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Chat_1.Chat, chat => chat.recipients),
    __metadata("design:type", Chat_1.Chat)
], Recipient.prototype, "chat", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Date)
], Recipient.prototype, "receivedAt", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Date)
], Recipient.prototype, "readAt", void 0);
Recipient = __decorate([
    typeorm_1.Entity(),
    __metadata("design:paramtypes", [Object])
], Recipient);
exports.Recipient = Recipient;

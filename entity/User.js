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
const Message_1 = require("./Message");
const Recipient_1 = require("./Recipient");
let User = class User {
    constructor({ username, password, name, picture, phone } = {}) {
        if (username) {
            this.username = username;
        }
        if (password) {
            this.password = password;
        }
        if (name) {
            this.name = name;
        }
        if (picture) {
            this.picture = picture;
        }
        if (phone) {
            this.phone = phone;
        }
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "picture", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    typeorm_1.ManyToMany(type => Chat_1.Chat, chat => chat.allTimeMembers),
    __metadata("design:type", Array)
], User.prototype, "allTimeMemberChats", void 0);
__decorate([
    typeorm_1.ManyToMany(type => Chat_1.Chat, chat => chat.listingMembers),
    __metadata("design:type", Array)
], User.prototype, "listingMemberChats", void 0);
__decorate([
    typeorm_1.ManyToMany(type => Chat_1.Chat, chat => chat.actualGroupMembers),
    __metadata("design:type", Array)
], User.prototype, "actualGroupMemberChats", void 0);
__decorate([
    typeorm_1.ManyToMany(type => Chat_1.Chat, chat => chat.admins),
    __metadata("design:type", Array)
], User.prototype, "adminChats", void 0);
__decorate([
    typeorm_1.ManyToMany(type => Message_1.Message, message => message.holders),
    __metadata("design:type", Array)
], User.prototype, "holderMessages", void 0);
__decorate([
    typeorm_1.OneToMany(type => Chat_1.Chat, chat => chat.owner),
    __metadata("design:type", Array)
], User.prototype, "ownerChats", void 0);
__decorate([
    typeorm_1.OneToMany(type => Message_1.Message, message => message.sender),
    __metadata("design:type", Array)
], User.prototype, "senderMessages", void 0);
__decorate([
    typeorm_1.OneToMany(type => Recipient_1.Recipient, recipient => recipient.user),
    __metadata("design:type", Array)
], User.prototype, "recipients", void 0);
User = __decorate([
    typeorm_1.Entity(),
    __metadata("design:paramtypes", [Object])
], User);
exports.User = User;

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
const Recipient_1 = require("./Recipient");
let Chat = class Chat {
    constructor({ createdAt, name, picture, allTimeMembers, listingMembers, actualGroupMembers, admins, owner, messages } = {}) {
        if (createdAt) {
            this.createdAt = createdAt;
        }
        if (name) {
            this.name = name;
        }
        if (picture) {
            this.picture = picture;
        }
        if (allTimeMembers) {
            this.allTimeMembers = allTimeMembers;
        }
        if (listingMembers) {
            this.listingMembers = listingMembers;
        }
        if (actualGroupMembers) {
            this.actualGroupMembers = actualGroupMembers;
        }
        if (admins) {
            this.admins = admins;
        }
        if (owner) {
            this.owner = owner;
        }
        if (messages) {
            this.messages = messages;
        }
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Chat.prototype, "id", void 0);
__decorate([
    typeorm_1.CreateDateColumn({ nullable: true }),
    __metadata("design:type", Date)
], Chat.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Chat.prototype, "name", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Chat.prototype, "picture", void 0);
__decorate([
    typeorm_1.ManyToMany(type => User_1.User, user => user.allTimeMemberChats, { cascade: ["insert", "update"], eager: false }),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], Chat.prototype, "allTimeMembers", void 0);
__decorate([
    typeorm_1.ManyToMany(type => User_1.User, user => user.listingMemberChats, { cascade: ["insert", "update"], eager: false }),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], Chat.prototype, "listingMembers", void 0);
__decorate([
    typeorm_1.ManyToMany(type => User_1.User, user => user.actualGroupMemberChats, { cascade: ["insert", "update"], eager: false }),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], Chat.prototype, "actualGroupMembers", void 0);
__decorate([
    typeorm_1.ManyToMany(type => User_1.User, user => user.adminChats, { cascade: ["insert", "update"], eager: false }),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], Chat.prototype, "admins", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User_1.User, user => user.ownerChats, { cascade: ["insert", "update"], eager: false }),
    __metadata("design:type", Object)
], Chat.prototype, "owner", void 0);
__decorate([
    typeorm_1.OneToMany(type => Message_1.Message, message => message.chat, { cascade: ["insert", "update"], eager: true }),
    __metadata("design:type", Array)
], Chat.prototype, "messages", void 0);
__decorate([
    typeorm_1.OneToMany(type => Recipient_1.Recipient, recipient => recipient.chat),
    __metadata("design:type", Array)
], Chat.prototype, "recipients", void 0);
Chat = __decorate([
    typeorm_1.Entity(),
    __metadata("design:paramtypes", [Object])
], Chat);
exports.Chat = Chat;

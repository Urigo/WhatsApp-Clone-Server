import {
  Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, ManyToMany, JoinTable, CreateDateColumn
} from "typeorm";
import { Chat } from "./Chat";
import { User } from "./User";
import { Recipient } from "./Recipient";
import { MessageType } from "../db";

interface MessageConstructor {
  sender?: User;
  content?: string;
  createdAt?: Date,
  type?: MessageType;
  recipients?: Recipient[];
  holders?: User[];
  chat?: Chat;
}

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User, user => user.senderMessages, {eager: true})
  sender: User;

  @Column()
  content: string;

  @CreateDateColumn({nullable: true})
  createdAt: Date;

  @Column()
  type: number;

  @OneToMany(type => Recipient, recipient => recipient.message, {cascade: ["insert", "update"], eager: true})
  recipients: Recipient[];

  @ManyToMany(type => User, user => user.holderMessages, {cascade: ["insert", "update"], eager: true})
  @JoinTable()
  holders: User[];

  @ManyToOne(type => Chat, chat => chat.messages)
  chat: Chat;

  constructor({sender, content, createdAt, type, recipients, holders, chat}: MessageConstructor = {}) {
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
}

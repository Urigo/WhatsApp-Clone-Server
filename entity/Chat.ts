import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { Message } from "./Message";
import { User } from "./User";
import { Recipient } from "./Recipient";

interface ChatConstructor {
  name?: string;
  picture?: string;
  allTimeMembers?: User[];
  listingMembers?: User[];
  actualGroupMembers?: User[];
  admins?: User[];
  owner?: User;
  messages?: Message[];
}

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})
  name: string;

  @Column({nullable: true})
  picture: string;

  @ManyToMany(type => User, user => user.allTimeMemberChats, {cascade: ["insert", "update"], eager: false})
  @JoinTable()
  allTimeMembers: User[];

  @ManyToMany(type => User, user => user.listingMemberChats, {cascade: ["insert", "update"], eager: false})
  @JoinTable()
  listingMembers: User[];

  @ManyToMany(type => User, user => user.actualGroupMemberChats, {cascade: ["insert", "update"], eager: false})
  @JoinTable()
  actualGroupMembers?: User[];

  @ManyToMany(type => User, user => user.adminChats, {cascade: ["insert", "update"], eager: false})
  @JoinTable()
  admins?: User[];

  @ManyToOne(type => User, user => user.ownerChats, {cascade: ["insert", "update"], eager: false})
  owner?: User | null;

  @OneToMany(type => Message, message => message.chat, {cascade: ["insert", "update"], eager: true})
  messages: Message[];

  @OneToMany(type => Recipient, recipient => recipient.chat)
  recipients: Recipient[];

  constructor({name, picture, allTimeMembers, listingMembers, actualGroupMembers, admins, owner, messages}: ChatConstructor = {}) {
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
}

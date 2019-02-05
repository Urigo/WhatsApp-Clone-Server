import { Entity, Column, ManyToMany, OneToMany } from 'typeorm';
import { Chat } from './Chat';
import { Message } from './Message';
import { Recipient } from './Recipient';
import { User as AccountsUser, UserService } from '@accounts/typeorm';

interface UserConstructor {
  username?: string;
  password?: string;
  name?: string;
  picture?: string;
  phone?: string;
}

@Entity()
export class User extends AccountsUser{

  @Column({nullable: true})
  name: string;

  @Column({nullable: true})
  picture: string;

  @Column({nullable: true})
  phone?: string;

  @ManyToMany(type => Chat, chat => chat.allTimeMembers)
  allTimeMemberChats: Chat[];

  @ManyToMany(type => Chat, chat => chat.listingMembers)
  listingMemberChats: Chat[];

  @ManyToMany(type => Chat, chat => chat.actualGroupMembers)
  actualGroupMemberChats: Chat[];

  @ManyToMany(type => Chat, chat => chat.admins)
  adminChats: Chat[];

  @ManyToMany(type => Message, message => message.holders)
  holderMessages: Message[];

  @OneToMany(type => Chat, chat => chat.owner)
  ownerChats: Chat[];

  @OneToMany(type => Message, message => message.sender)
  senderMessages: Message[];

  @OneToMany(type => Recipient, recipient => recipient.user)
  recipients: Recipient[];

  constructor({username, password, name, picture, phone}: UserConstructor = {}) {
    super();
    if (username) {
      this.username = username;
    }
    if (password) {
      const userService = new UserService();
      userService.name = 'password';
      userService.options = { bcrypt: password };
      this.allServices = [userService];
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
}

import { Entity, Column, ManyToMany, OneToMany } from 'typeorm';
import { Chat } from './Chat';
import { Message } from './Message';
import { Recipient } from './Recipient';
import { User as AccountsUser } from '@accounts/typeorm';

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
}

import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm'
import Chat from './chat'
import Message from './message'

interface UserConstructor {
  username?: string
  password?: string
  name?: string
  picture?: string
}

@Entity('app_user')
export class User {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  username: string

  @Column()
  password: string

  @Column()
  name: string

  @Column({ nullable: true })
  picture: string

  @ManyToMany(type => Chat, chat => chat.allTimeMembers)
  allTimeMemberChats: Chat[]

  @ManyToMany(type => Chat, chat => chat.listingMembers)
  listingMemberChats: Chat[]

  @ManyToMany(type => Message, message => message.holders)
  holderMessages: Message[]

  @OneToMany(type => Chat, chat => chat.owner)
  ownerChats: Chat[]

  @OneToMany(type => Message, message => message.sender)
  senderMessages: Message[]

  constructor({ username, password, name, picture }: UserConstructor = {}) {
    if (username) {
      this.username = username
    }
    if (password) {
      this.password = password
    }
    if (name) {
      this.name = name
    }
    if (picture) {
      this.picture = picture
    }
  }
}

export default User

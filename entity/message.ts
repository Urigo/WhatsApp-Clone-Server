import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm'
import Chat from './chat'
import User from './user'
import { MessageType } from '../db'

interface MessageConstructor {
  sender?: User
  content?: string
  createdAt?: Date
  type?: MessageType
  holders?: User[]
  chat?: Chat
}

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: string

  @ManyToOne(type => User, user => user.senderMessages, { eager: true })
  sender: User

  @Column()
  content: string

  @CreateDateColumn({ nullable: true })
  createdAt: Date

  @Column()
  type: number

  @ManyToMany(type => User, user => user.holderMessages, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  @JoinTable()
  holders: User[]

  @ManyToOne(type => Chat, chat => chat.messages)
  chat: Chat

  constructor({
    sender,
    content,
    createdAt,
    type,
    holders,
    chat,
  }: MessageConstructor = {}) {
    if (sender) {
      this.sender = sender
    }
    if (content) {
      this.content = content
    }
    if (createdAt) {
      this.createdAt = createdAt
    }
    if (type) {
      this.type = type
    }
    if (holders) {
      this.holders = holders
    }
    if (chat) {
      this.chat = chat
    }
  }
}

export default Message

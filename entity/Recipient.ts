import { Entity, ManyToOne, Column } from 'typeorm';
import { Message } from './Message';
import { User } from './User';

interface RecipientConstructor {
  user?: User;
  message?: Message;
  receivedAt?: Date;
  readAt?: Date;
}

@Entity()
export class Recipient {
  @ManyToOne(type => User, user => user.recipients, { primary: true })
  user: User;

  @ManyToOne(type => Message, message => message.recipients, { primary: true })
  message: Message;

  @Column({nullable: true})
  receivedAt: Date;

  @Column({nullable: true})
  readAt: Date;

  constructor({user, message, receivedAt, readAt}: RecipientConstructor = {}) {
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
}

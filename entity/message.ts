import Recipient from './recipient'

export enum MessageType {
  PICTURE,
  TEXT,
  LOCATION,
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  createdAt: number
  type: MessageType
  recipients: Recipient[]
  holderIds: string[]
}

export default Message

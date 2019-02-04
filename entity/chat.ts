import Message from './message'

export interface Chat {
  id: string
  name?: string | null
  picture?: string | null
  // All members, current and past ones.
  allTimeMemberIds: string[]
  // Whoever gets the chat listed. For groups includes past members who still didn't delete the group.
  listingMemberIds: string[]
  // Actual members of the group (they are not the only ones who get the group listed). Null for chats.
  actualGroupMemberIds?: string[] | null
  adminIds?: string[] | null
  ownerId?: string | null
  messages: Message[]
}

export default Chat

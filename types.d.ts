/* tslint:disable */

/** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
export type DateTime = any;

export interface Query {
  users?: User[] | null;
  chats?: Chat[] | null;
  chat?: Chat | null;
}

export interface User {
  id: string;
  name?: string | null;
  picture?: string | null;
  phone?: string | null;
}

export interface Chat {
  id: string /** May be a chat or a group */;
  name?: string | null /** Computed for chats */;
  picture?: string | null /** Computed for chats */;
  allTimeMembers: User[] /** All members, current and past ones. */;
  listingMembers: User[] /** Whoever gets the chat listed. For groups includes past members who still didn't delete the group. */;
  actualGroupMembers: User[] /** Actual members of the group (they are not the only ones who get the group listed). Null for chats. */;
  admins?: User[] | null /** Null for chats */;
  owner?: User | null /** If null the group is read-only. Null for chats. */;
  messages: (Message | null)[];
  messageFeed?: MessageFeed | null /** Return messages in a a Feed Wrapper with cursor based pagination */;
  unreadMessages: number /** Computed property */;
  isGroup: boolean /** Computed property */;
}

export interface Message {
  id: string;
  sender: User;
  chat: Chat;
  content: string;
  createdAt: DateTime;
  type: number /** FIXME: should return MessageType */;
  recipients: Recipient[] /** Whoever received the message */;
  holders: User[] /** Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise */;
  ownership: boolean /** Computed property */;
}

export interface Recipient {
  user: User;
  message: Message;
  chat: Chat;
  receivedAt?: DateTime | null;
  readAt?: DateTime | null;
}

export interface MessageFeed {
  hasNextPage: boolean;
  cursor?: string | null;
  messages: (Message | null)[];
}

export interface Mutation {
  addChat?: Chat | null;
  addGroup?: Chat | null;
  removeChat?: string | null;
  addMessage?: Message | null;
  removeMessages?: (string | null)[] | null;
  addMembers?: (string | null)[] | null;
  removeMembers?: (string | null)[] | null;
  addAdmins?: (string | null)[] | null;
  removeAdmins?: (string | null)[] | null;
  setGroupName?: string | null;
  setGroupPicture?: string | null;
  markAsReceived?: boolean | null;
  markAsRead?: boolean | null;
}

export interface Subscription {
  messageAdded?: Message | null;
  chatAdded?: Chat | null;
}
export interface ChatQueryArgs {
  chatId: string;
}
export interface MessagesChatArgs {
  amount?: number | null;
  before?: string | null;
}
export interface MessageFeedChatArgs {
  amount?: number | null;
  before?: string | null;
}
export interface AddChatMutationArgs {
  recipientId: string;
}
export interface AddGroupMutationArgs {
  recipientIds: string[];
  groupName: string;
}
export interface RemoveChatMutationArgs {
  chatId: string;
}
export interface AddMessageMutationArgs {
  chatId: string;
  content: string;
}
export interface RemoveMessagesMutationArgs {
  chatId: string;
  messageIds?: (string | null)[] | null;
  all?: boolean | null;
}
export interface AddMembersMutationArgs {
  groupId: string;
  userIds: string[];
}
export interface RemoveMembersMutationArgs {
  groupId: string;
  userIds: string[];
}
export interface AddAdminsMutationArgs {
  groupId: string;
  userIds: string[];
}
export interface RemoveAdminsMutationArgs {
  groupId: string;
  userIds: string[];
}
export interface SetGroupNameMutationArgs {
  groupId: string;
}
export interface SetGroupPictureMutationArgs {
  groupId: string;
}
export interface MarkAsReceivedMutationArgs {
  chatId: string;
}
export interface MarkAsReadMutationArgs {
  chatId: string;
}
export interface MessageAddedSubscriptionArgs {
  chatId?: string | null;
}

export enum MessageType {
  LOCATION = "LOCATION",
  TEXT = "TEXT",
  PICTURE = "PICTURE"
}

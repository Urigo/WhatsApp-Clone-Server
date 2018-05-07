export type Maybe<T> = T | undefined | null;

export enum MessageType {
  Location = "LOCATION",
  Text = "TEXT",
  Picture = "PICTURE"
}

export type Date = any;

// ====================================================
// Scalars
// ====================================================

// ====================================================
// Types
// ====================================================

export interface Query {
  users?: Maybe<User[]>;

  chats?: Maybe<Chat[]>;

  chat?: Maybe<Chat>;
}

export interface User {
  id: number;

  name?: Maybe<string>;

  picture?: Maybe<string>;

  phone?: Maybe<string>;
}

export interface Chat {
  id: number;

  name?: Maybe<string>;

  picture?: Maybe<string>;

  allTimeMembers: User[];

  listingMembers: User[];

  actualGroupMembers: User[];

  admins?: Maybe<User[]>;

  owner?: Maybe<User>;

  messages: (Maybe<Message>)[];

  messageFeed?: Maybe<MessageFeed>;

  unreadMessages: number;

  isGroup: boolean;
}

export interface Message {
  id: number;

  sender: User;

  chat: Chat;

  content: string;

  createdAt: Date;

  type: number;

  recipients: Recipient[];

  holders: User[];

  ownership: boolean;
}

export interface Recipient {
  user: User;

  message: Message;

  chat: Chat;

  receivedAt?: Maybe<Date>;

  readAt?: Maybe<Date>;
}

export interface MessageFeed {
  hasNextPage: boolean;

  cursor?: Maybe<string>;

  messages: (Maybe<Message>)[];
}

export interface Mutation {
  addChat?: Maybe<Chat>;

  addGroup?: Maybe<Chat>;

  removeChat?: Maybe<number>;

  addMessage?: Maybe<Message>;

  removeMessages?: Maybe<(Maybe<number>)[]>;

  addMembers?: Maybe<(Maybe<number>)[]>;

  removeMembers?: Maybe<(Maybe<number>)[]>;

  addAdmins?: Maybe<(Maybe<number>)[]>;

  removeAdmins?: Maybe<(Maybe<number>)[]>;

  setGroupName?: Maybe<string>;

  setGroupPicture?: Maybe<string>;

  markAsReceived?: Maybe<boolean>;

  markAsRead?: Maybe<boolean>;
}

export interface Subscription {
  messageAdded?: Maybe<Message>;

  chatAdded?: Maybe<Chat>;
}

// ====================================================
// Arguments
// ====================================================

export interface ChatQueryArgs {
  chatId: number;
}
export interface MessagesChatArgs {
  amount?: Maybe<number>;

  before?: Maybe<string>;
}
export interface MessageFeedChatArgs {
  amount?: Maybe<number>;

  before?: Maybe<string>;
}
export interface AddChatMutationArgs {
  recipientId: number;
}
export interface AddGroupMutationArgs {
  recipientIds: number[];

  groupName: string;
}
export interface RemoveChatMutationArgs {
  chatId: number;
}
export interface AddMessageMutationArgs {
  chatId: number;

  content: string;
}
export interface RemoveMessagesMutationArgs {
  chatId: number;

  messageIds?: Maybe<(Maybe<number>)[]>;

  all?: Maybe<boolean>;
}
export interface AddMembersMutationArgs {
  groupId: number;

  userIds: number[];
}
export interface RemoveMembersMutationArgs {
  groupId: number;

  userIds: number[];
}
export interface AddAdminsMutationArgs {
  groupId: number;

  userIds: number[];
}
export interface RemoveAdminsMutationArgs {
  groupId: number;

  userIds: number[];
}
export interface SetGroupNameMutationArgs {
  groupId: number;
}
export interface SetGroupPictureMutationArgs {
  groupId: number;
}
export interface MarkAsReceivedMutationArgs {
  chatId: number;
}
export interface MarkAsReadMutationArgs {
  chatId: number;
}
export interface MessageAddedSubscriptionArgs {
  chatId?: Maybe<number>;
}

import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig
} from "graphql";

import { Chat } from "./entity/Chat";

import { Message } from "./entity/Message";

import { Recipient } from "./entity/Recipient";

import { AppContext } from "./schema/types";

export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export interface ISubscriptionResolverObject<Result, Parent, Context, Args> {
  subscribe<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>;
  resolve?<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>;
}

export type SubscriptionResolver<
  Result,
  Parent = {},
  Context = {},
  Args = {}
> =
  | ((
      ...args: any[]
    ) => ISubscriptionResolverObject<Result, Parent, Context, Args>)
  | ISubscriptionResolverObject<Result, Parent, Context, Args>;

export type TypeResolveFn<Types, Parent = {}, Context = {}> = (
  parent: Parent,
  context: Context,
  info: GraphQLResolveInfo
) => Maybe<Types>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult, TArgs = {}, TContext = {}> = (
  next: NextResolverFn<TResult>,
  source: any,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export namespace QueryResolvers {
  export interface Resolvers<Context = AppContext, TypeParent = {}> {
    users?: UsersResolver<Maybe<User[]>, TypeParent, Context>;

    chats?: ChatsResolver<Maybe<Chat[]>, TypeParent, Context>;

    chat?: ChatResolver<Maybe<Chat>, TypeParent, Context>;
  }

  export type UsersResolver<
    R = Maybe<User[]>,
    Parent = {},
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type ChatsResolver<
    R = Maybe<Chat[]>,
    Parent = {},
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type ChatResolver<
    R = Maybe<Chat>,
    Parent = {},
    Context = AppContext
  > = Resolver<R, Parent, Context, ChatArgs>;
  export interface ChatArgs {
    chatId: number;
  }
}

export namespace UserResolvers {
  export interface Resolvers<Context = AppContext, TypeParent = User> {
    id?: IdResolver<number, TypeParent, Context>;

    name?: NameResolver<Maybe<string>, TypeParent, Context>;

    picture?: PictureResolver<Maybe<string>, TypeParent, Context>;

    phone?: PhoneResolver<Maybe<string>, TypeParent, Context>;
  }

  export type IdResolver<
    R = number,
    Parent = User,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type NameResolver<
    R = Maybe<string>,
    Parent = User,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type PictureResolver<
    R = Maybe<string>,
    Parent = User,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type PhoneResolver<
    R = Maybe<string>,
    Parent = User,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
}

export namespace ChatResolvers {
  export interface Resolvers<Context = AppContext, TypeParent = Chat> {
    id?: IdResolver<number, TypeParent, Context>;

    name?: NameResolver<Maybe<string>, TypeParent, Context>;

    picture?: PictureResolver<Maybe<string>, TypeParent, Context>;

    allTimeMembers?: AllTimeMembersResolver<User[], TypeParent, Context>;

    listingMembers?: ListingMembersResolver<User[], TypeParent, Context>;

    actualGroupMembers?: ActualGroupMembersResolver<
      User[],
      TypeParent,
      Context
    >;

    admins?: AdminsResolver<Maybe<User[]>, TypeParent, Context>;

    owner?: OwnerResolver<Maybe<User>, TypeParent, Context>;

    messages?: MessagesResolver<(Maybe<Message>)[], TypeParent, Context>;

    messageFeed?: MessageFeedResolver<Maybe<MessageFeed>, TypeParent, Context>;

    unreadMessages?: UnreadMessagesResolver<number, TypeParent, Context>;

    isGroup?: IsGroupResolver<boolean, TypeParent, Context>;
  }

  export type IdResolver<
    R = number,
    Parent = Chat,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type NameResolver<
    R = Maybe<string>,
    Parent = Chat,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type PictureResolver<
    R = Maybe<string>,
    Parent = Chat,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type AllTimeMembersResolver<
    R = User[],
    Parent = Chat,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type ListingMembersResolver<
    R = User[],
    Parent = Chat,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type ActualGroupMembersResolver<
    R = User[],
    Parent = Chat,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type AdminsResolver<
    R = Maybe<User[]>,
    Parent = Chat,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type OwnerResolver<
    R = Maybe<User>,
    Parent = Chat,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type MessagesResolver<
    R = (Maybe<Message>)[],
    Parent = Chat,
    Context = AppContext
  > = Resolver<R, Parent, Context, MessagesArgs>;
  export interface MessagesArgs {
    amount?: Maybe<number>;

    before?: Maybe<string>;
  }

  export type MessageFeedResolver<
    R = Maybe<MessageFeed>,
    Parent = Chat,
    Context = AppContext
  > = Resolver<R, Parent, Context, MessageFeedArgs>;
  export interface MessageFeedArgs {
    amount?: Maybe<number>;

    before?: Maybe<string>;
  }

  export type UnreadMessagesResolver<
    R = number,
    Parent = Chat,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type IsGroupResolver<
    R = boolean,
    Parent = Chat,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
}

export namespace MessageResolvers {
  export interface Resolvers<Context = AppContext, TypeParent = Message> {
    id?: IdResolver<number, TypeParent, Context>;

    sender?: SenderResolver<User, TypeParent, Context>;

    chat?: ChatResolver<Chat, TypeParent, Context>;

    content?: ContentResolver<string, TypeParent, Context>;

    createdAt?: CreatedAtResolver<Date, TypeParent, Context>;

    type?: TypeResolver<number, TypeParent, Context>;

    recipients?: RecipientsResolver<Recipient[], TypeParent, Context>;

    holders?: HoldersResolver<User[], TypeParent, Context>;

    ownership?: OwnershipResolver<boolean, TypeParent, Context>;
  }

  export type IdResolver<
    R = number,
    Parent = Message,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type SenderResolver<
    R = User,
    Parent = Message,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type ChatResolver<
    R = Chat,
    Parent = Message,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type ContentResolver<
    R = string,
    Parent = Message,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type CreatedAtResolver<
    R = Date,
    Parent = Message,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type TypeResolver<
    R = number,
    Parent = Message,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type RecipientsResolver<
    R = Recipient[],
    Parent = Message,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type HoldersResolver<
    R = User[],
    Parent = Message,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type OwnershipResolver<
    R = boolean,
    Parent = Message,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
}

export namespace RecipientResolvers {
  export interface Resolvers<Context = AppContext, TypeParent = Recipient> {
    user?: UserResolver<User, TypeParent, Context>;

    message?: MessageResolver<Message, TypeParent, Context>;

    chat?: ChatResolver<Chat, TypeParent, Context>;

    receivedAt?: ReceivedAtResolver<Maybe<Date>, TypeParent, Context>;

    readAt?: ReadAtResolver<Maybe<Date>, TypeParent, Context>;
  }

  export type UserResolver<
    R = User,
    Parent = Recipient,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type MessageResolver<
    R = Message,
    Parent = Recipient,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type ChatResolver<
    R = Chat,
    Parent = Recipient,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type ReceivedAtResolver<
    R = Maybe<Date>,
    Parent = Recipient,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type ReadAtResolver<
    R = Maybe<Date>,
    Parent = Recipient,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
}

export namespace MessageFeedResolvers {
  export interface Resolvers<Context = AppContext, TypeParent = MessageFeed> {
    hasNextPage?: HasNextPageResolver<boolean, TypeParent, Context>;

    cursor?: CursorResolver<Maybe<string>, TypeParent, Context>;

    messages?: MessagesResolver<(Maybe<Message>)[], TypeParent, Context>;
  }

  export type HasNextPageResolver<
    R = boolean,
    Parent = MessageFeed,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type CursorResolver<
    R = Maybe<string>,
    Parent = MessageFeed,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
  export type MessagesResolver<
    R = (Maybe<Message>)[],
    Parent = MessageFeed,
    Context = AppContext
  > = Resolver<R, Parent, Context>;
}

export namespace MutationResolvers {
  export interface Resolvers<Context = AppContext, TypeParent = {}> {
    addChat?: AddChatResolver<Maybe<Chat>, TypeParent, Context>;

    addGroup?: AddGroupResolver<Maybe<Chat>, TypeParent, Context>;

    removeChat?: RemoveChatResolver<Maybe<number>, TypeParent, Context>;

    addMessage?: AddMessageResolver<Maybe<Message>, TypeParent, Context>;

    removeMessages?: RemoveMessagesResolver<
      Maybe<(Maybe<number>)[]>,
      TypeParent,
      Context
    >;

    addMembers?: AddMembersResolver<
      Maybe<(Maybe<number>)[]>,
      TypeParent,
      Context
    >;

    removeMembers?: RemoveMembersResolver<
      Maybe<(Maybe<number>)[]>,
      TypeParent,
      Context
    >;

    addAdmins?: AddAdminsResolver<
      Maybe<(Maybe<number>)[]>,
      TypeParent,
      Context
    >;

    removeAdmins?: RemoveAdminsResolver<
      Maybe<(Maybe<number>)[]>,
      TypeParent,
      Context
    >;

    setGroupName?: SetGroupNameResolver<Maybe<string>, TypeParent, Context>;

    setGroupPicture?: SetGroupPictureResolver<
      Maybe<string>,
      TypeParent,
      Context
    >;

    markAsReceived?: MarkAsReceivedResolver<
      Maybe<boolean>,
      TypeParent,
      Context
    >;

    markAsRead?: MarkAsReadResolver<Maybe<boolean>, TypeParent, Context>;
  }

  export type AddChatResolver<
    R = Maybe<Chat>,
    Parent = {},
    Context = AppContext
  > = Resolver<R, Parent, Context, AddChatArgs>;
  export interface AddChatArgs {
    recipientId: number;
  }

  export type AddGroupResolver<
    R = Maybe<Chat>,
    Parent = {},
    Context = AppContext
  > = Resolver<R, Parent, Context, AddGroupArgs>;
  export interface AddGroupArgs {
    recipientIds: number[];

    groupName: string;
  }

  export type RemoveChatResolver<
    R = Maybe<number>,
    Parent = {},
    Context = AppContext
  > = Resolver<R, Parent, Context, RemoveChatArgs>;
  export interface RemoveChatArgs {
    chatId: number;
  }

  export type AddMessageResolver<
    R = Maybe<Message>,
    Parent = {},
    Context = AppContext
  > = Resolver<R, Parent, Context, AddMessageArgs>;
  export interface AddMessageArgs {
    chatId: number;

    content: string;
  }

  export type RemoveMessagesResolver<
    R = Maybe<(Maybe<number>)[]>,
    Parent = {},
    Context = AppContext
  > = Resolver<R, Parent, Context, RemoveMessagesArgs>;
  export interface RemoveMessagesArgs {
    chatId: number;

    messageIds?: Maybe<(Maybe<number>)[]>;

    all?: Maybe<boolean>;
  }

  export type AddMembersResolver<
    R = Maybe<(Maybe<number>)[]>,
    Parent = {},
    Context = AppContext
  > = Resolver<R, Parent, Context, AddMembersArgs>;
  export interface AddMembersArgs {
    groupId: number;

    userIds: number[];
  }

  export type RemoveMembersResolver<
    R = Maybe<(Maybe<number>)[]>,
    Parent = {},
    Context = AppContext
  > = Resolver<R, Parent, Context, RemoveMembersArgs>;
  export interface RemoveMembersArgs {
    groupId: number;

    userIds: number[];
  }

  export type AddAdminsResolver<
    R = Maybe<(Maybe<number>)[]>,
    Parent = {},
    Context = AppContext
  > = Resolver<R, Parent, Context, AddAdminsArgs>;
  export interface AddAdminsArgs {
    groupId: number;

    userIds: number[];
  }

  export type RemoveAdminsResolver<
    R = Maybe<(Maybe<number>)[]>,
    Parent = {},
    Context = AppContext
  > = Resolver<R, Parent, Context, RemoveAdminsArgs>;
  export interface RemoveAdminsArgs {
    groupId: number;

    userIds: number[];
  }

  export type SetGroupNameResolver<
    R = Maybe<string>,
    Parent = {},
    Context = AppContext
  > = Resolver<R, Parent, Context, SetGroupNameArgs>;
  export interface SetGroupNameArgs {
    groupId: number;
  }

  export type SetGroupPictureResolver<
    R = Maybe<string>,
    Parent = {},
    Context = AppContext
  > = Resolver<R, Parent, Context, SetGroupPictureArgs>;
  export interface SetGroupPictureArgs {
    groupId: number;
  }

  export type MarkAsReceivedResolver<
    R = Maybe<boolean>,
    Parent = {},
    Context = AppContext
  > = Resolver<R, Parent, Context, MarkAsReceivedArgs>;
  export interface MarkAsReceivedArgs {
    chatId: number;
  }

  export type MarkAsReadResolver<
    R = Maybe<boolean>,
    Parent = {},
    Context = AppContext
  > = Resolver<R, Parent, Context, MarkAsReadArgs>;
  export interface MarkAsReadArgs {
    chatId: number;
  }
}

export namespace SubscriptionResolvers {
  export interface Resolvers<Context = AppContext, TypeParent = {}> {
    messageAdded?: MessageAddedResolver<Maybe<Message>, TypeParent, Context>;

    chatAdded?: ChatAddedResolver<Maybe<Chat>, TypeParent, Context>;
  }

  export type MessageAddedResolver<
    R = Maybe<Message>,
    Parent = {},
    Context = AppContext
  > = SubscriptionResolver<R, Parent, Context, MessageAddedArgs>;
  export interface MessageAddedArgs {
    chatId?: Maybe<number>;
  }

  export type ChatAddedResolver<
    R = Maybe<Chat>,
    Parent = {},
    Context = AppContext
  > = SubscriptionResolver<R, Parent, Context>;
}

/** Directs the executor to skip this field or fragment when the `if` argument is true. */
export type SkipDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  SkipDirectiveArgs,
  AppContext
>;
export interface SkipDirectiveArgs {
  /** Skipped when true. */
  if: boolean;
}

/** Directs the executor to include this field or fragment only when the `if` argument is true. */
export type IncludeDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  IncludeDirectiveArgs,
  AppContext
>;
export interface IncludeDirectiveArgs {
  /** Included when true. */
  if: boolean;
}

/** Marks an element of a GraphQL schema as no longer supported. */
export type DeprecatedDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  DeprecatedDirectiveArgs,
  AppContext
>;
export interface DeprecatedDirectiveArgs {
  /** Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax (as specified by [CommonMark](https://commonmark.org/). */
  reason?: string;
}

export interface DateScalarConfig extends GraphQLScalarTypeConfig<Date, any> {
  name: "Date";
}

export interface IResolvers {
  Query?: QueryResolvers.Resolvers;
  User?: UserResolvers.Resolvers;
  Chat?: ChatResolvers.Resolvers;
  Message?: MessageResolvers.Resolvers;
  Recipient?: RecipientResolvers.Resolvers;
  MessageFeed?: MessageFeedResolvers.Resolvers;
  Mutation?: MutationResolvers.Resolvers;
  Subscription?: SubscriptionResolvers.Resolvers;
  Date?: GraphQLScalarType;
}

export interface IDirectiveResolvers<Result> {
  skip?: SkipDirectiveResolver<Result>;
  include?: IncludeDirectiveResolver<Result>;
  deprecated?: DeprecatedDirectiveResolver<Result>;
}
